"""A small pytest plugin that reports collection and test outcomes as JSON."""

import json
import os
import time
from pathlib import Path


_outcomes: dict[str, dict[str, str]] = {}


def pytest_collection_finish(session):
    destination = os.environ.get("WOBBLE_COLLECTION_FILE")
    if destination:
        Path(destination).write_text(
            json.dumps([item.nodeid for item in session.items]), encoding="utf-8"
        )


def pytest_runtest_logreport(report):
    if not os.environ.get("WOBBLE_RESULT_FILE"):
        return

    outcome = _outcomes.setdefault(report.nodeid, {"status": "unknown"})
    if report.failed:
        outcome["status"] = "failed"
        outcome["failure"] = str(report.longrepr)[-4000:]
    elif report.skipped and outcome["status"] != "failed":
        outcome["status"] = "skipped"
    elif report.when == "call" and report.passed and outcome["status"] != "failed":
        outcome["status"] = "passed"


def pytest_sessionfinish(session, exitstatus):
    destination = os.environ.get("WOBBLE_RESULT_FILE")
    if destination:
        Path(destination).write_text(
            json.dumps({
                "exit_code": int(exitstatus),
                "outcomes": _outcomes,
                "reported_time_epoch": time.time(),
            }),
            encoding="utf-8",
        )
