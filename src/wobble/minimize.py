"""Delta debugging for an ordered list of tests before a victim."""

from collections.abc import Callable
from math import ceil


def ddmin(prefix: list[str], fails: Callable[[list[str]], bool]) -> list[str]:
    """Find a 1-minimal ordered failure-inducing subsequence."""
    prefix = list(prefix)
    if not fails(prefix):
        raise ValueError("The original prefix does not reproduce the failure")
    if fails([]):
        return []

    granularity = 2
    while len(prefix) >= 2:
        size = ceil(len(prefix) / granularity)
        chunks = [prefix[index:index + size] for index in range(0, len(prefix), size)]
        candidates = chunks + [
            [test for index, chunk in enumerate(chunks) if index != removed for test in chunk]
            for removed in range(len(chunks))
        ]
        for candidate in candidates:
            if fails(candidate):
                prefix = candidate
                granularity = max(2, granularity - 1)
                break
        else:
            if granularity >= len(prefix):
                break
            granularity = min(len(prefix), granularity * 2)
    return prefix
