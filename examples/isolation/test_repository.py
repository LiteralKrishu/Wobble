"""Run only through Wobble's Docker runner."""

from pathlib import Path


def test_repository_mount_is_read_only():
    marker = Path(__file__).with_name("unexpected-write.txt")
    try:
        marker.write_text("container changed the repository", encoding="utf-8")
    except OSError:
        return
    marker.unlink()
    raise AssertionError("The repository mount was writable")
