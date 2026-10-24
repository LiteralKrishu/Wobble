"""Bounded model-guided experiments with a deterministic runner."""

import ast
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Protocol

from wobble.container_runner import ContainerPytestRunner
from wobble.hunt import HuntReport
from wobble.investigate import investigate
from wobble.ollama_client import Decision
from wobble.runner import PytestRunner


class DecisionModel(Protocol):
    def decide(self, evidence: dict) -> Decision: ...


@dataclass(frozen=True)
class AgentStep:
    decision: Decision
    observation: dict


@dataclass(frozen=True)
class AgentResult:
    victim: str
    status: str
    diagnosis: str
    model_diagnosis: str
    reason: str
    steps: list[AgentStep]


def _source_excerpt(repo: Path, nodeid: str) -> str:
    path = (repo / nodeid.split("::", 1)[0]).resolve()
    if not path.is_relative_to(repo) or path.suffix != ".py" or not path.is_file():
        return ""
    source = path.read_text(encoding="utf-8")
    function_name = nodeid.split("::")[-1].split("[", 1)[0]
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return ""
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == function_name:
            return "\n".join(source.splitlines()[node.lineno - 1:node.end_lineno])[:2500]
    return ""


def _supported_diagnosis(diagnosis: str, steps: list[AgentStep]) -> bool:
    if diagnosis == "unknown":
        return True
    if diagnosis == "shared_state":
        isolated_passed = any(
            step.decision.action == "run_isolated" and step.observation["victim_status"] == "passed"
            for step in steps
        )
        ordered_failure = any(
            step.decision.action == "run_before_victim" and step.observation["victim_status"] == "failed"
            for step in steps
        )
        minimized_failure = any(
            step.decision.action == "minimize_order" and step.observation["minimized_prefix"]
            for step in steps
        )
        return isolated_passed and (ordered_failure or minimized_failure)
    if diagnosis == "time":
        baseline = {
            step.observation["test_id"]: step.observation["victim_status"]
            for step in steps if step.decision.action in ("run_isolated", "run_before_victim")
        }
        return any(
            step.decision.action == "shift_clock"
            and baseline.get(step.observation["test_id"]) not in (None, step.observation["victim_status"])
            for step in steps
        )
    return False


def run_agent(
    runner: PytestRunner,
    report: HuntReport,
    victim: str,
    model: DecisionModel,
    max_steps: int = 5,
) -> AgentResult:
    if max_steps < 1:
        raise ValueError("Agent step budget must be positive")
    failed = next(run for run in report.runs if run.outcomes[victim]["status"] == "failed")
    passed = next(run for run in report.runs if run.outcomes[victim]["status"] == "passed")
    prefix = failed.order[:failed.order.index(victim)]
    passed_prefix = passed.order[:passed.order.index(victim)]
    snippets = {nodeid: _source_excerpt(runner.repo, nodeid) for nodeid in [*prefix[-3:], victim]}
    evidence = {
        "victim": victim,
        "allowed_prefix": prefix[-12:],
        "failing_prefix_count": len(prefix),
        "failing_prefix_tail": prefix[-12:],
        "passing_prefix_tail": passed_prefix[-12:],
        "failure": failed.outcomes[victim].get("failure", "")[-2000:],
        "run_conditions": asdict(failed.conditions),
        "test_source": snippets,
        "available_actions": [
            "run_isolated", "run_before_victim", "minimize_order",
            *(["shift_clock"] if isinstance(runner, ContainerPytestRunner) else []),
        ],
        "history": [],
    }
    steps: list[AgentStep] = []
    used_actions: set[str] = set()
    for _ in range(max_steps):
        decision = model.decide(evidence)
        if decision.action not in evidence["available_actions"]:
            raise ValueError("Model repeated an unavailable experiment")
        if decision.action == "finish":
            if not steps:
                raise ValueError("Model tried to finish before running an experiment")
            if decision.test_id:
                raise ValueError("Finish cannot include an experiment parameter")
            if decision.diagnosis == "unknown":
                return AgentResult(
                    victim, "inconclusive", "unknown", "unknown",
                    "The model did not choose a cause", steps,
                )
            supported = _supported_diagnosis(decision.diagnosis, steps)
            return AgentResult(
                victim, "hypothesis" if supported else "insufficient_evidence",
                decision.diagnosis if supported else "unknown", decision.diagnosis,
                "The proposed cause matches the experiments" if supported
                else "The proposed cause lacks a matching experiment", steps,
            )
        if decision.action in ("run_isolated", "minimize_order") and decision.test_id:
            raise ValueError("This action does not accept a test ID")
        if decision.test_id and decision.test_id not in prefix:
            raise ValueError("Model selected a test outside the failing prefix")
        if decision.action == "run_before_victim" and not decision.test_id:
            raise ValueError("run_before_victim needs an earlier test")
        if decision.action == "shift_clock":
            if not isinstance(runner, ContainerPytestRunner):
                raise ValueError("Clock experiment needs Docker")
            shifted_seconds = runner.conditions.clock_shift_seconds + 3600
            shifted = ContainerPytestRunner(
                runner.repo, runner.timeout_seconds, runner.image,
                runner.conditions.cpu_limit, runner.conditions.memory_mb,
                runner.conditions.pids_limit, shifted_seconds,
            )
            selected = [decision.test_id] if decision.test_id else []
            run = shifted.run([*selected, victim])
            observation = {"victim_status": run.outcomes[victim]["status"], "test_id": decision.test_id, "clock_shift_seconds": shifted_seconds}
        elif decision.action == "minimize_order":
            result = investigate(runner, report, victim)
            observation = asdict(result)
            if result.minimized_prefix:
                evidence["allowed_prefix"] = result.minimized_prefix[-12:]
                for nodeid in result.minimized_prefix[-3:]:
                    evidence["test_source"][nodeid] = _source_excerpt(runner.repo, nodeid)
        elif decision.action in ("run_isolated", "run_before_victim"):
            selected = [] if decision.action == "run_isolated" else [decision.test_id]
            run = runner.run([*selected, victim])
            observation = {"victim_status": run.outcomes[victim]["status"], "test_id": decision.test_id}
        else:
            raise ValueError(f"Unknown model action: {decision.action}")
        step = AgentStep(decision, observation)
        steps.append(step)
        used_actions.add(decision.action)
        evidence["history"].append({"action": decision.action, "observation": observation})
        evidence["available_actions"] = [
            *[action for action in ("run_isolated", "run_before_victim", "minimize_order") if action not in used_actions],
            *(["shift_clock"] if isinstance(runner, ContainerPytestRunner) and "shift_clock" not in used_actions else []),
            *(["finish"] if len(steps) >= 2 else []),
        ]
    return AgentResult(victim, "step_budget_exhausted", "unknown", "unknown", "The model did not finish within the step budget", steps)
