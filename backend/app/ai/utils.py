"""
Shared AI helper utilities — Milestone 3 (full implementation).

Small, dependency-free helpers reused across the inference pipeline.
Import-safe: no torch/cv2/ultralytics imports at module level.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    """Clamp ``value`` into the inclusive range ``[low, high]``."""
    return max(low, min(high, value))


def normalize_box(x1: float, y1: float, x2: float, y2: float) -> List[float]:
    """
    Normalize an unbounded box to 0–1 coordinates.

    Args:
        x1, y1, x2, y2: Pixel-space box corners.

    Returns:
        ``[x1, y1, x2, y2]`` each clamped to 0–1.
    """
    return [clamp(x1), clamp(y1), clamp(x2), clamp(y2)]


def pick_device(preferred: str) -> str:
    """
    Resolve a preferred device string to a concrete compute device.

    ``"auto"`` → resolves to ``"cuda:0"`` when CUDA is available, else ``"cpu"``.
    ``"cpu"`` / ``"cuda"`` / ``"cuda:N"`` are returned as-is after validation.

    Args:
        preferred: The configured device string (from AI_DEVICE env var).

    Returns:
        A concrete device string safe to pass to ultralytics YOLO.
    """
    preferred = (preferred or "cpu").strip().lower()
    if preferred in ("", "cpu"):
        return "cpu"
    if preferred == "auto":
        try:
            import torch  # noqa: PLC0415

            return "cuda:0" if torch.cuda.is_available() else "cpu"
        except Exception:  # noqa: BLE001 — torch unavailable → cpu
            return "cpu"
    # Return cuda / cuda:N / mps as-is.
    return preferred


def detection_confidence(detection: Dict[str, Any]) -> float:
    """Return the confidence value of a detection dict (default 0.0)."""
    return float(detection.get("confidence") or 0.0)
