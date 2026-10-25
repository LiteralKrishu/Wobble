import unittest
from pathlib import Path

from wobble.hunt import hunt
from wobble.investigate import investigate
from wobble.minimize import ddmin
from wobble.runner import RunResult
from wobble.statistics import wilson_interval


class FakeRunner:
    repo = Path("/example")

    def collect(self, selector):
        return ["test_polluter", "test_victim", "test_noise"]

    def run(self, order):
        victim_fails = (
            "test_polluter" in order
            and order.index("test_polluter") < order.index("test_victim")
        )
        outcomes = {
            nodeid: {"status": "failed" if nodeid == "test_victim" and victim_fails else "passed"}
            for nodeid in order
        }
        return RunResult(order, outcomes, int(victim_fails), 0.01)


class CoreTests(unittest.TestCase):
    def test_wilson_interval_with_no_failures_has_nonzero_upper_bound(self):
        low, high = wilson_interval(0, 100)
        self.assertEqual(low, 0.0)
        self.assertGreater(high, 0.0)
        self.assertLess(high, 0.04)

    def test_ddmin_preserves_order_and_removes_noise(self):
        def fails(prefix):
            return "polluter" in prefix and "victim" in prefix and prefix.index("polluter") < prefix.index("victim")

        result = ddmin(["noise_1", "polluter", "noise_2", "victim"], fails)
        self.assertEqual(result, ["polluter", "victim"])

    def test_ddmin_returns_empty_if_victim_fails_without_prefix(self):
        self.assertEqual(ddmin(["noise"], lambda _: True), [])

    def test_hunt_and_investigation_find_polluter(self):
        runner = FakeRunner()
        report = hunt(runner, ".", rounds=12, seed=0)
        victim = next(test for test in report.tests if test.nodeid == "test_victim")
        self.assertEqual(victim.classification, "observed flaky")
        self.assertGreater(victim.failed, 0)
        self.assertGreater(victim.passed, 0)

        result = investigate(runner, report, "test_victim")
        self.assertEqual(result.conclusion, "1-minimal prefix reproduced")
        self.assertEqual(result.minimized_prefix, ["test_polluter"])


if __name__ == "__main__":
    unittest.main()
