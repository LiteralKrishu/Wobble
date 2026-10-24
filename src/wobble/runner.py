"""Run a trusted pytest repository in a fresh Python process."""

import json
import os
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path


class RunnerError(RuntimeError):
    """The test harness could not collect or complete a run."""


@dataclass(frozen=True)
class RunConditions:
    cpu_limit: float | None = None
    memory_mb: int | None = None
    pids_limit: int | None = None
    clock_shift_seconds: int = 0


@dataclass(frozen=True)
class RunResult:
    order: list[str]
    outcomes: dict[str, dict[str, str]]
    exit_code: int
    duration_seconds: float
    conditions: RunConditions = RunConditions()
    reported_time_epoch: float | None = None


class PytestRunner:
    def __init__(self, repo: Path, timeout_seconds: float = 120):
        self.repo = repo.resolve()
        self.timeout_seconds = timeout_seconds
        self.conditions = RunConditions()
        if not self.repo.is_dir():
            raise RunnerError(f"Repository directory does not exist: {self.repo}")
        if timeout_seconds <= 0:
            raise RunnerError("Timeout must be positive")

    def _environment(self) -> dict[str, str]:
        environment = os.environ.copy()
        source_dir = str(Path(__file__).resolve().parents[1])
        environment["PYTHONPATH"] = os.pathsep.join(
            part for part in (str(self.repo / "src"), source_dir, environment.get("PYTHONPATH", "")) if part
        )
        return environment

    def _invoke(self, args: list[str], environment: dict[str, str]) -> tuple[subprocess.CompletedProcess[str], float]:
        command = [
            sys.executable, "-m", "pytest", "-p", "wobble.probe", "-q",
            "--rootdir", str(self.repo), "-o", "addopts=", *args,
        ]
        started = time.monotonic()
        try:
            completed = subprocess.run(
                command,
                cwd=self.repo,
                env=environment,
                text=True,
                capture_output=True,
                timeout=self.timeout_seconds,
                check=False,
            )
        except subprocess.TimeoutExpired as error:
            raise RunnerError(f"pytest exceeded {self.timeout_seconds:g} seconds") from error
        return completed, time.monotonic() - started

    def collect(self, selector: str = ".") -> list[str]:
        with tempfile.TemporaryDirectory(prefix="wobble-") as directory:
            destination = Path(directory) / "collected.json"
            environment = self._environment()
            environment["WOBBLE_COLLECTION_FILE"] = str(destination)
            completed, _ = self._invoke(["--collect-only", selector], environment)
            if completed.returncode != 0 or not destination.exists():
                raise RunnerError(f"pytest collection failed:\n{completed.stdout}\n{completed.stderr}")
            collected = json.loads(destination.read_text(encoding="utf-8"))
            if not collected:
                raise RunnerError("pytest collected no tests")
            return collected

    def run(self, order: list[str]) -> RunResult:
        if not order:
            raise RunnerError("Cannot run an empty test order")
        with tempfile.TemporaryDirectory(prefix="wobble-") as directory:
            destination = Path(directory) / "results.json"
            environment = self._environment()
            environment["WOBBLE_RESULT_FILE"] = str(destination)
            completed, duration = self._invoke(order, environment)
            if not destination.exists():
                raise RunnerError(f"pytest produced no result report:\n{completed.stdout}\n{completed.stderr}")
            report = json.loads(destination.read_text(encoding="utf-8"))
            outcomes = report["outcomes"]
            missing = [nodeid for nodeid in order if nodeid not in outcomes]
            if missing or completed.returncode not in (0, 1):
                raise RunnerError(
                    f"pytest did not complete the requested order (missing: {missing}):\n"
                    f"{completed.stdout}\n{completed.stderr}"
                )
            if list(outcomes) != order:
                raise RunnerError("pytest changed the requested test order; disable order-changing plugins")
            if any(result["status"] == "unknown" for result in outcomes.values()):
                raise RunnerError("pytest did not finish every test phase")
            return RunResult(
                order, outcomes, completed.returncode, duration,
                self.conditions, report.get("reported_time_epoch"),
            )
