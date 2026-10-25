import unittest
from pathlib import Path

from wobble.runner import PytestRunner


class RunnerIntegrationTests(unittest.TestCase):
    def test_real_pytest_run_preserves_order_and_reports_victim(self):
        repo = Path(__file__).resolve().parents[1] / "examples" / "order_dependent"
        runner = PytestRunner(repo)
        collected = runner.collect()
        polluter = next(nodeid for nodeid in collected if "test_a_polluter" in nodeid)
        victim = next(nodeid for nodeid in collected if "test_b_victim" in nodeid)

        isolated = runner.run([victim])
        polluted = runner.run([polluter, victim])

        self.assertEqual(isolated.outcomes[victim]["status"], "passed")
        self.assertEqual(polluted.outcomes[victim]["status"], "failed")
        self.assertEqual(list(polluted.outcomes), [polluter, victim])


if __name__ == "__main__":
    unittest.main()
