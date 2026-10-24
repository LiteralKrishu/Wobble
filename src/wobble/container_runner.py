"""Run pytest inside a constrained, disposable Docker container."""

import os
import re
import shutil
import subprocess
import time
from math import isfinite
from pathlib import Path
from uuid import uuid4

from wobble.runner import PytestRunner, RunConditions, RunnerError


class ContainerPytestRunner(PytestRunner):
    def __init__(
        self,
        repo: Path,
        timeout_seconds: float = 120,
        image: str = "wobble-pytest:py311",
        cpu_limit: float = 1.0,
        memory_mb: int = 512,
        pids_limit: int = 64,
        clock_shift_seconds: int = 0,
    ):
        super().__init__(repo, timeout_seconds)
        if not shutil.which("docker"):
            raise RunnerError("Docker is not installed")
        if not isfinite(cpu_limit) or cpu_limit <= 0 or memory_mb < 64 or pids_limit < 1:
            raise RunnerError("CPU limit must be positive, memory at least 64 MB, and PID limit positive")
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_./:@-]*", image):
            raise RunnerError("Docker image name has invalid characters")
        self.image = image
        self.conditions = RunConditions(cpu_limit, memory_mb, pids_limit, clock_shift_seconds)
        self.source_dir = Path(__file__).resolve().parents[1]

    def _docker_command(self, args: list[str], environment: dict[str, str], name: str) -> list[str]:
        report_key = "WOBBLE_COLLECTION_FILE" if "WOBBLE_COLLECTION_FILE" in environment else "WOBBLE_RESULT_FILE"
        report_path = Path(environment[report_key])
        for path in (self.repo, self.source_dir, report_path.parent):
            if "," in str(path):
                raise RunnerError("Docker bind mount paths cannot contain commas")

        command = [
            "docker", "run", "--rm", "--name", name, "--pull=never",
            "--network=none", "--read-only", "--cap-drop=ALL",
            "--security-opt=no-new-privileges", "--pids-limit", str(self.conditions.pids_limit),
            "--memory", f"{self.conditions.memory_mb}m", "--cpus", str(self.conditions.cpu_limit),
            "--user", f"{os.getuid()}:{os.getgid()}",
            "--tmpfs", "/tmp:rw,nosuid,nodev,size=64m,mode=1777",
            "--mount", f"type=bind,src={self.repo},dst=/workspace,readonly",
            "--mount", f"type=bind,src={self.source_dir},dst=/opt/wobble/src,readonly",
            "--mount", f"type=bind,src={report_path.parent},dst=/results",
            "--workdir", "/workspace",
            "--env", "PYTHONPATH=/opt/wobble/src:/workspace:/workspace/src",
            "--env", "PYTHONDONTWRITEBYTECODE=1",
            "--env", "HOME=/tmp", "--env", "TMPDIR=/tmp",
            "--env", f"{report_key}=/results/{report_path.name}",
        ]
        shift = self.conditions.clock_shift_seconds
        if shift:
            command.extend([
                "--env", "LD_PRELOAD=/usr/local/lib/libfaketime.so.1",
                "--env", f"FAKETIME={shift:+d}",
                "--env", "FAKETIME_DONT_FAKE_MONOTONIC=1",
            ])
        command.extend([
            self.image, "python", "-m", "pytest", "-p", "wobble.probe",
            "-p", "no:cacheprovider", "-q", "--rootdir", "/workspace", "-o", "addopts=", *args,
        ])
        return command

    def _invoke(self, args: list[str], environment: dict[str, str]) -> tuple[subprocess.CompletedProcess[str], float]:
        name = f"wobble-{uuid4().hex[:12]}"
        command = self._docker_command(args, environment, name)
        started = time.monotonic()
        try:
            completed = subprocess.run(
                command, text=True, capture_output=True,
                timeout=self.timeout_seconds, check=False,
            )
        except subprocess.TimeoutExpired as error:
            try:
                subprocess.run(["docker", "rm", "-f", name], capture_output=True, timeout=15, check=False)
            except (OSError, subprocess.TimeoutExpired):
                pass
            raise RunnerError(f"container exceeded {self.timeout_seconds:g} seconds") from error
        return completed, time.monotonic() - started
