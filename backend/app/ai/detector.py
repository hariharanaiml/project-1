"""
YOLOv8 detection adapter.

Responsibilities:
    - Run ``model.predict()`` with the configured confidence/IoU thresholds and
      image size.
    - Extract per-detection results: pixel-space ``xyxy`` boxes, confidence, and
      class id.
    - Map class ids to ``model.names`` labels.
    - Normalize boxes to 0–1 relative coordinates.
    - Return a list of detection dicts matching the API contract:
      ``{label, confidence, bbox: [x1, y1, x2, y2], class_id}``.

This module is entirely independent of any LLM, Vercel AI Gateway, or LiteLLM.
It only uses the Ultralytics YOLO model loaded by ModelManager.
"""

from __future__ import annotations

from typing import Any, Dict, List

from app.ai.settings import ai_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# ── Class-id → damage label mapping for the trained best.pt model ─────────────
# Matches the Roboflow Road Damage Detection v2 dataset class indices.
DAMAGE_CLASS_NAMES: Dict[int, str] = {
    0: "alligator_crack",
    1: "lane_line_blur",
    2: "longitudinal_crack",
    3: "manhole_cover",
    4: "patchy_road_section",
    5: "pothole",
    6: "transverse_crack",
}


def normalize_boxes(
    original_width: int,
    original_height: int,
    xyxy_pixels: Any,
) -> List[float]:
    """
    Convert pixel-space [x1, y1, x2, y2] boxes to normalized 0–1 coordinates.

    Args:
        original_width: Width of the source image in pixels.
        original_height: Height of the source image in pixels.
        xyxy_pixels: Tensor or list-like [x1, y1, x2, y2] in pixel space.

    Returns:
        ``[x1_norm, y1_norm, x2_norm, y2_norm]`` clamped to [0, 1].
    """
    coords = [float(v) for v in xyxy_pixels[:4]]
    x1, y1, x2, y2 = coords
    w, h = float(original_width), float(original_height)
    if w <= 0 or h <= 0:
        return [0.0, 0.0, 0.0, 0.0]
    return [
        max(0.0, min(1.0, x1 / w)),
        max(0.0, min(1.0, y1 / h)),
        max(0.0, min(1.0, x2 / w)),
        max(0.0, min(1.0, y2 / h)),
    ]


class YOLODetector:
    """Wraps an Ultralytics YOLO model with RoadSense-specific post-processing."""

    def __init__(self, model: Any) -> None:
        self.model = model

    def detect(self, image: Any, image_size: int = 640) -> List[Dict[str, Any]]:
        """
        Run detection on a BGR image and return normalized detections.

        Args:
            image: BGR np.ndarray at original resolution, or a file path string.
            image_size: YOLO letterbox input size (default 640).

        Returns:
            List of detection dicts::

                {
                    "label": str,           # damage type name
                    "class_id": int,        # YOLO class index
                    "confidence": float,    # 0–1
                    "bbox": [x1, y1, x2, y2],  # normalized 0–1
                }

        The list is empty when no damage is detected above the confidence
        threshold. Inference errors are logged and raised so the pipeline can
        report a failed analysis instead of presenting it as zero detections.
        """
        # Very small source images lose detail when YOLO's default 640 input
        # size scales them up aggressively. Keep images below 320 px at a
        # smaller inference size; this also improves detection on thumbnail-
        # sized uploads without lowering the confidence threshold.
        inference_size = image_size
        image_shape = getattr(image, "shape", None)
        if image_shape is not None and len(image_shape) >= 2:
            height, width = image_shape[:2]
            if max(height, width) < 320:
                inference_size = min(image_size, 320)

        try:
            results = self.model.predict(
                source=image,
                conf=ai_settings.confidence_threshold,
                imgsz=inference_size,
                device=ai_settings.device,
                verbose=False,
            )
        except Exception as exc:  # noqa: BLE001
            logger.exception("YOLO model.predict() failed")
            raise RuntimeError("YOLO inference failed.") from exc

        detections: List[Dict[str, Any]] = []

        for result in results:
            # Resolve image dimensions for box normalization.
            orig_h, orig_w = result.orig_shape[:2] if result.orig_shape else (0, 0)

            if result.boxes is None or len(result.boxes) == 0:
                continue

            for box in result.boxes:
                try:
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    xyxy = box.xyxy[0].tolist()

                    # Map class id to a human-readable label.
                    label = DAMAGE_CLASS_NAMES.get(class_id, f"damage_class_{class_id}")
                    # Fall back to model.names if the model has extra classes.
                    if class_id not in DAMAGE_CLASS_NAMES and hasattr(self.model, "names"):
                        raw_label = self.model.names.get(class_id, label)
                        label = str(raw_label).strip().lower().replace(" ", "_").replace("-", "_")

                    bbox = normalize_boxes(orig_w, orig_h, xyxy)

                    detections.append(
                        {
                            "label": label,
                            "class_id": class_id,
                            "confidence": round(confidence, 4),
                            "bbox": [round(v, 4) for v in bbox],
                        }
                    )
                except Exception as exc:  # noqa: BLE001
                    logger.warning("Skipping malformed detection box: %s", exc)
                    continue

        logger.info(
            "YOLO detection complete: %d detection(s) (conf>=%.2f)",
            len(detections),
            ai_settings.confidence_threshold,
        )
        return detections
