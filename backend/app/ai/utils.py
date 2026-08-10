"""
Shared AI helper utilities (Phase 13 — Milestone 2 scaffold).

Small, dependency-free helpers reused across the inference pipeline (box math,
device string helpers, etc.). Kept import-safe so the app always boots without
heavy AI dependencies.

Import-safe scaffold only — full implementation lands in Milestone 3.
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

    ``"auto"`` → resolves to ``"cuda:0"`` when available, else ``"cpu"``.
    ``"cpu"`` / ``"cuda"`` / ``"cuda:N"`` are returned as-is.

    Args:
        preferred: The configured device string.

    Returns:
        A concrete device string.
    """
    raise NotImplementedError("Implemented in Milestone 3.")


def detection_confidence(detection: Dict[str, Any]) -> float:
    """Return the confidence value of a detection dict (default 0.0)."""
    return float(detection.get("confidence") or 0.0)
