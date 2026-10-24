"""A deliberate order-dependent failure for the local demo."""

cache = {}


def test_a_polluter():
    cache["user"] = "bob"


def test_b_victim():
    assert "user" not in cache


def test_c_cleanup():
    cache.clear()
