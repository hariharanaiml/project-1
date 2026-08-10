"""Temporary verification script: start uvicorn, probe /api/health, stop.

Used during Milestone 1 verification to confirm the real ASGI server
(uvicorn) starts and serves the application correctly.
"""

import subprocess
import sys
import time
import urllib.request

PORT = "8011"
URL = f"http://127.0.0.1:{PORT}/api/health"


def main() -> int:
    """Start uvicorn, probe health, then terminate it."""
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--port", PORT],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    ok = False
    msg = ""
    try:
        time.sleep(3)
        with urllib.request.urlopen(URL, timeout=5) as resp:
            body = resp.read().decode()
            ok = resp.status == 200 and '"status":"ok"' in body
            msg = f"HTTP {resp.status}"
    except Exception as exc:  # noqa: BLE001 - report any probe failure
        msg = str(exc)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()

    print(f"Uvicorn startup test: {'PASS - ' + msg if ok else 'FAIL - ' + msg}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())

