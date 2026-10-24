"""A polluter checks its own work but leaves shared state for later tests."""

cache = {}


def test_a_polluter():
    cache["ready"] = True
    assert cache["ready"] is True


def test_b_victim():
    assert "ready" not in cache


def test_c_cleanup():
    cache.clear()
