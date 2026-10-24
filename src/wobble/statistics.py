"""Measurement functions for observed test failures."""

from math import sqrt


def wilson_interval(failures: int, observations: int) -> tuple[float, float]:
    """Return the 95% Wilson interval for a binomial failure rate."""
    if observations < 1 or failures < 0 or failures > observations:
        raise ValueError("Expected 0 <= failures <= observations and observations > 0")
    z = 1.959963984540054
    rate = failures / observations
    denominator = 1 + z * z / observations
    center = (rate + z * z / (2 * observations)) / denominator
    margin = z * sqrt(rate * (1 - rate) / observations + z * z / (4 * observations**2)) / denominator
    low = 0.0 if failures == 0 else max(0.0, center - margin)
    high = 1.0 if failures == observations else min(1.0, center + margin)
    return low, high
