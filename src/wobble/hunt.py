"""Repeat a pytest suite in shuffled orders and summarize each test."""

import random
from dataclasses import asdict, dataclass

from wobble.runner import PytestRunner, RunResult
from wobble.statistics import wilson_interval


@dataclass(frozen=True)
class TestSummary:
    nodeid: str
    passed: int
    failed: int
    skipped: int
    failure_rate: float | None
    confidence_low: float | None
    confidence_high: float | None
    classification: str


@dataclass(frozen=True)
class HuntReport:
    repo: str
    selector: str
    seed: int
    runs: list[RunResult]
    tests: list[TestSummary]

    def to_dict(self) -> dict:
        return asdict(self)


def hunt(runner: PytestRunner, selector: str, rounds: int, seed: int) -> HuntReport:
    if rounds < 2:
        raise ValueError("At least two runs are needed to observe both outcomes")
    collected = runner.collect(selector)
    randomizer = random.Random(seed)
    runs: list[RunResult] = []
    for _ in range(rounds):
        order = collected.copy()
        randomizer.shuffle(order)
        runs.append(runner.run(order))

    summaries = []
    for nodeid in collected:
        statuses = [run.outcomes[nodeid]["status"] for run in runs]
        passed = statuses.count("passed")
        failed = statuses.count("failed")
        skipped = statuses.count("skipped")
        observations = passed + failed
        low, high = wilson_interval(failed, observations) if observations else (None, None)
        classification = (
            "observed flaky" if passed and failed else
            "always failed" if failed else
            "always passed" if passed else "only skipped"
        )
        summaries.append(TestSummary(
            nodeid, passed, failed, skipped,
            failed / observations if observations else None,
            low, high, classification,
        ))
    return HuntReport(str(runner.repo), selector, seed, runs, summaries)
