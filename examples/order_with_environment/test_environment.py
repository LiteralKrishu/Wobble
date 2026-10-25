"""A test leaves an environment variable for a later test."""

import os


def test_a_sets_flag():
    os.environ["WOBBLE_DEMO_READY"] = "1"
    assert os.environ["WOBBLE_DEMO_READY"] == "1"


def test_b_requires_clean_environment():
    assert "WOBBLE_DEMO_READY" not in os.environ


def test_c_clear_flag():
    os.environ.pop("WOBBLE_DEMO_READY", None)
