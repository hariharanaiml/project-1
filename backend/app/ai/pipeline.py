"""
RoadDamagePipeline — full YOLOv8 analysis pipeline — Milestone 3.

Pipeline steps:
    1. Resolve + decode the input image (EXIF-corrected BGR ndarray).
    2. Run YOLOv8 detection (YOLODetector) → normalized boxes + labels.
    3. Post-process: confidence filter + class-id mapping (postprocess).
    4. Classify severity (severity module — deterministic rule-based).
    5. Estimate repair cost (cost_estimator — INR rule table).
    6. Generate maintenance recommendation (recommender — deterministic rules).
    7. Draw + save annotated image (annotator).
    8. Assemble the result dict — structurally identical to the mock
       AIService.analyze_image() output so the API contract is unchanged,
       plus new fields: annotated_image_url, processing_time_ms, mock=False.

No LLM, Vercel AI Gateway, or external service is consulted at any step.
The pipeline works fully offline after the YOLO model + dependencies are installed.
"""

from __future__ import annotations

import time
import uuid
from typing import Any, Dict, Optional

from app.core.logging import get_logger

logger = get_logger(__name__)


class RoadDamagePipeline:
    """Full real-inference pipeline producing a structured AI result."""

    def run(
        self,
        image_path: str,
        report_id: Optional[str] = None,
        analysis_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Run the full analysis pipeline on a road image.

        Args:
            image_path:  Stored/static/absolute path to the image.
            report_id:   Optional report identifier for traceability.
            analysis_id: Optional identifier used to name the annotated file.

        Returns:
            Structured result dict matching the AIResponse contract (mock=False).
            All fields that the mock service returns are present, plus:
              - ``annotated_image_url`` — URL of the annotated image.
              - ``processing_time_ms`` — total inference wall-clock time.
              - ``mock: False``

        Raises:
            Nothing — errors are caught and returned in the ``error`` field.
        """
        t_start = time.perf_counter()
        analysis_id = analysis_id or str(uuid.uuid4())

        try:
            return self._run_pipeline(image_path, report_id, analysis_id, t_start)
        except Exception as exc:  # noqa: BLE001
            elapsed_ms = round((time.perf_counter() - t_start) * 1000, 1)
            logger.exception("Road damage analysis failed for image %s", image_path)
            return self._error_result(
                image_path=image_path,
                report_id=report_id,
                analysis_id=analysis_id,
                error=str(exc),
                elapsed_ms=elapsed_ms,
            )

    # ── Internal implementation ───────────────────────────────────────────────

    def _run_pipeline(
        self,
        image_path: str,
        report_id: Optional[str],
        analysis_id: str,
        t_start: float,
    ) -> Dict[str, Any]:
        from app.ai.preprocessing import decode_image
        from app.ai.model_manager import model_manager
        from app.ai.detector import YOLODetector
        from app.ai.postprocess import filter_by_confidence, map_class_ids
        from app.ai.severity import classify_severity
        from app.ai.cost_estimator import estimate_repair_cost
        from app.ai.recommender import generate_recommendation
        from app.ai.annotator import annotate_image
        from app.ai.settings import ai_settings

        # 1. Decode image.
        image_bgr = decode_image(image_path)

        # 2. Load model (lazy singleton).
        model = model_manager.get_model()
        if model is None:
            raise RuntimeError(
                "YOLO model is not loaded. "
                "Ensure AI_ENABLED=true and MODEL_PATH is set."
            )

        # 3. Run YOLOv8 detection.
        detector = YOLODetector(model)
        raw_detections = detector.detect(image_bgr)

        # 4. Post-process.
        detections = filter_by_confidence(
            raw_detections, ai_settings.confidence_threshold
        )
        detections = map_class_ids(detections, getattr(model, "names", None))

        # 5. Severity classification.
        severity_result = classify_severity(detections)
        primary_damage  = severity_result["primary_damage_type"]
        severity_label  = severity_result["severity"]

        # 6. Cost estimation.
        cost_result = estimate_repair_cost(primary_damage, severity_label)

        # 7. Recommendation.
        recommendation = generate_recommendation(severity_result, cost_result)

        # 8. Annotate image (best-effort — skip if cv2 unavailable).
        annotated_filename = f"{analysis_id}.jpg"
        annotation = annotate_image(image_bgr, detections, annotated_filename)
        annotated_url = annotation.get("url")

        # 9. Assemble result.
        elapsed_ms = round((time.perf_counter() - t_start) * 1000, 1)

        # Top-level confidence = highest individual detection confidence.
        top_confidence = max(
            (d.get("confidence", 0.0) for d in detections), default=0.0
        )

        # Build bounding_boxes in the mock-compatible format.
        bounding_boxes = [
            {
                "label":      d.get("label", "unknown"),
                "confidence": d.get("confidence", 0.0),
                "severity":   d.get("severity", severity_label),
                "x1": d["bbox"][0] if d.get("bbox") else 0.0,
                "y1": d["bbox"][1] if d.get("bbox") else 0.0,
                "x2": d["bbox"][2] if d.get("bbox") else 0.0,
                "y2": d["bbox"][3] if d.get("bbox") else 0.0,
            }
            for d in detections
        ]

        return {
            # ── Core fields (mock-contract compatible) ──
            "report_id":              report_id,
            "image_path":             image_path,
            "analysis_id":            analysis_id,
            "model_version":          "yolov8-best-v1",
            "damage_detected":        len(detections) > 0,
            "damage_type":            _map_to_legacy_type(primary_damage),
            "severity":               severity_label,
            "confidence":             round(top_confidence, 4),
            "estimated_repair_cost":  cost_result["estimated_repair_cost"],
            "repair_method":          recommendation["repair_method"],
            "priority":               recommendation["priority"],
            "summary":                recommendation["summary"],
            "detections":             detections,
            "bounding_boxes":         bounding_boxes,
            "cost_breakdown":         cost_result.get("cost_breakdown", {}),
            "expected_duration_days": cost_result.get("expected_duration_days"),
            "equipment":              cost_result.get("equipment", []),
            "notes":                  recommendation.get("notes", ""),
            "risk_score":             severity_result["risk_score"],
            "overall_damage_score":   severity_result["overall_score"],
            "road_condition":         _road_condition(severity_result["overall_score"]),
            # ── Extended real-AI fields ──
            "annotated_image_url":    annotated_url,
            "processing_time_ms":     elapsed_ms,
            "mock":                   False,
            # ── LLM gate (always false in this pipeline) ──
            "llm_available":          False,
            # ── Cost range ──
            "cost_range":             cost_result.get("cost_range"),
            "currency":               cost_result.get("currency", "INR"),
            "cost_disclaimer":        cost_result.get("disclaimer"),
        }

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _error_result(
        image_path: str,
        report_id: Optional[str],
        analysis_id: str,
        error: str,
        elapsed_ms: float,
    ) -> Dict[str, Any]:
        """Return a structured error result that still matches the API contract."""
        return {
            "report_id":             report_id,
            "image_path":            image_path,
            "analysis_id":           analysis_id,
            "model_version":         "yolov8-best-v1",
            "damage_detected":       False,
            "damage_type":           "other",
            "severity":              "low",
            "confidence":            0.0,
            "estimated_repair_cost": None,
            "repair_method":         None,
            "priority":              "low",
            "summary":               f"Pipeline error: {error}",
            "detections":            [],
            "bounding_boxes":        [],
            "cost_breakdown":        {},
            "expected_duration_days": None,
            "equipment":             [],
            "notes":                 error,
            "risk_score":            0.0,
            "overall_damage_score":  0.0,
            "road_condition":        "Unknown",
            "annotated_image_url":   None,
            "processing_time_ms":    elapsed_ms,
            "mock":                  False,
            "llm_available":         False,
            "error":                 error,
        }


def _road_condition(overall_score: float) -> str:
    """Map an overall damage score (0–100) to a road condition label."""
    if overall_score >= 60:
        return "Poor"
    if overall_score >= 30:
        return "Fair"
    if overall_score >= 10:
        return "Moderate"
    return "Good"


# Mapping from YOLO class labels to the legacy DamageType enum values
# used by the mock service and ORM. Falls back to "other".
_LEGACY_TYPE_MAP: Dict[str, str] = {
    "pothole":             "pothole",
    "alligator_crack":     "alligator_cracks",
    "alligator crack":     "alligator_cracks",
    "longitudinal_crack":  "crack",
    "longitudinal crack":  "crack",
    "transverse_crack":    "crack",
    "transverse crack":    "crack",
    "patchy_road_section": "surface_wear",
    "patchy road section": "surface_wear",
    "lane_line_blur":      "other",
    "lane line blur":      "other",
    "manhole_cover":       "other",
    "manhole cover":       "other",
}


def _map_to_legacy_type(label: str) -> str:
    """Map a YOLO class label to the legacy DamageType enum string."""
    cleaned = (label or "").lower().strip()
    return _LEGACY_TYPE_MAP.get(cleaned.replace(" ", "_"), _LEGACY_TYPE_MAP.get(cleaned, "other"))


# Module-level singleton for convenient imports.
pipeline = RoadDamagePipeline()
