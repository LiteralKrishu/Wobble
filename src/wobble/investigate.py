"""Replay and shrink a failing order before one test."""

from dataclasses import dataclass

from wobble.hunt import HuntReport
from wobble.minimize import ddmin
from wobble.runner import PytestRunner


@dataclass(frozen=True)
class Investigation:
    victim: str
    original_prefix: list[str]
    minimized_prefix: list[str] | None
    replay_runs: int
    conclusion: str


class ReplayBudgetExceeded(RuntimeError):
    pass


def investigate(
    runner: PytestRunner,
    hunt_report: HuntReport,
    victim: str,
    replay_budget: int = 80,
    confirmations: int = 2,
) -> Investigation:
    failing_run = next(
        (run for run in hunt_report.runs if run.outcomes[victim]["status"] == "failed"),
        None,
    )
    if failing_run is None:
        raise ValueError(f"No failing run for {victim}")
    prefix = failing_run.order[:failing_run.order.index(victim)]
    attempts = 0
    cache: dict[tuple[str, ...], bool] = {}

    def fails(candidate: list[str]) -> bool:
        nonlocal attempts
        key = tuple(candidate)
        if key not in cache:
            if attempts + confirmations > replay_budget:
                raise ReplayBudgetExceeded
            outcomes = []
            for _ in range(confirmations):
                result = runner.run([*candidate, victim])
                attempts += 1
                outcomes.append(result.outcomes[victim]["status"] == "failed")
            cache[key] = all(outcomes)
        return cache[key]

    try:
        if not fails(prefix):
            return Investigation(victim, prefix, None, attempts, "original failure did not reproduce")
        if fails([]):
            return Investigation(victim, prefix, None, attempts, "victim also failed alone")
        minimized = ddmin(prefix, fails)
    except ReplayBudgetExceeded:
        return Investigation(victim, prefix, None, attempts, "replay budget exhausted")
    return Investigation(victim, prefix, minimized, attempts, "1-minimal prefix reproduced")
