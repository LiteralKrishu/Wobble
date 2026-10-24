"""A list of events leaks from one test to the next."""

events = []


def test_a_polluter():
    events.append("ready")


def test_b_victim():
    assert events == []


def test_c_cleanup():
    events.clear()
