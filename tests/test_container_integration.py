import shutil
import subprocess
import time
import unittest
from pathlib import Path

from wobble.container_runner import ContainerPytestRunner


def image_available():
    if not shutil.which("docker"):
        return False
    try:
        result = subprocess.run(
            ["docker", "image", "inspect", "wobble-pytest:py311"],
            capture_output=True, timeout=5, check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return False
    return result.returncode == 0


@unittest.skipUnless(image_available(), "Docker runner image is not available")
class ContainerIntegrationTests(unittest.TestCase):
    def test_clock_shift_and_read_only_repository(self):
        repo = Path(__file__).resolve().parents[1] / "examples" / "isolation"
        marker = repo / "unexpected-write.txt"
        runner = ContainerPytestRunner(
            repo, cpu_limit=0.5, memory_mb=256, clock_shift_seconds=3600,
        )
        collected = runner.collect()
        host_time = time.time()
        result = runner.run(collected)

        self.assertEqual(result.outcomes[collected[0]]["status"], "passed")
        self.assertAlmostEqual(result.reported_time_epoch, host_time + 3600, delta=30)
        self.assertFalse(marker.exists())
        self.assertEqual(result.conditions.cpu_limit, 0.5)


if __name__ == "__main__":
    unittest.main()
