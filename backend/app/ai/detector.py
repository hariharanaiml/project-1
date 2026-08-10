"""
YOLOv8 detection adapter.

Responsibilities (Milestone 3):
    - Run ``model.predict()`` with the configured confidence/IoU thresholds and
      image size.
    - Extract per-detection results: pixel-space ``xyxy`` boxes, confidence, and
      class id.
    - Map class ids to ``model.names`` labels and normalize boxes to 0–1.
    - Map labels to the :class:`app.models.enums.DamageType` enum (unknown → other).
    - Return a list of detection dicts matching the API contract:
      ``{label, confidence, bbox: [x1, y1, x2, y2], class_id}``.

Scaffold only — full implementation lands in Milestone 3.
"""

from __future__ import annotations

from typing import Any, Dict, List


class YOLODetector:
    """Wraps an Ultralytics YOLO model with RoadSense-specific post-processing."""

    def __init__(self, model: Any) -> None:
        self.model = model

    def detect(self, image: Any, image_size: int = 640) -> List[Dict[str, Any]]:
        """
        Run detection on a BGR image and return normalized detections.

        Args:
            image: BGR np.ndarray at original resolution.
            image_size: YOLO letterbox input size.

        Returns:
            List of ``{label, confidence, bbox:[x1,y1,x2,y2]}`` (boxes normalized 0–1).
        """
        raise NotImplementedError("Implemented in Milestone 3.")


def normalize_boxes(original_width: int, original_height: int, xyxy_pixels: Any) -> List[float]:
    """Convert pixel-space [x1,y1,x2,y2] boxes to normalized 0–1 coordinates."""
    raise NotImplementedError("Implemented in Milestone 3.")

