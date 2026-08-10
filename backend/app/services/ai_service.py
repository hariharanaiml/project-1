"""
Mock AI service — placeholder for the future YOLOv8 pipeline.

Milestones 4–5 ship a fully functional backend **without** any AI model.
This service exposes the same method surface the real pipeline will implement
but returns deterministic mock data so the API, schemas, and the frontend
contract can be built and tested immediately.

Method surface (Milestone 5):
  - ``analyze_image()``              — full mock pipeline → structured result
  - ``detect_damage()``              — mock detections (bboxes + labels)
  - ``classify_severity()``          — mock severity classification
  - ``estimate_repair_cost()``       — mock repair cost estimation
  - ``generate_repair_recommendation()`` — mock recommendation generator

No YOLOv8, no torch, no OpenCV inference, no model loading, no Roboflow, no
WebSockets are used anywhere in this module.
"""

from typing import Any, Dict, List, Optional

from app.core.logging import get_logger

logger = get_logger(__name__)

# Default mock model version reported by the API.
MOCK_MODEL_VERSION = "yolov8-mock-0.1.0"


class AIService:
    """Placeholder AI-analysis service returning mock results only."""

    # Deterministic sample damage classes the mock returns.
    _SAMPLE_DAMAGE_TYPES: List[str] = ["pothole", "crack", "surface_wear"]
    _SAMPLE_SEVERITIES: List[str] = ["low", "medium", "high", "critical"]

    def analyze_image(
        self,
        image_path: str,
        report_id: str | None = None,
        analysis_id: str | None = None,
    ) -> Dict[str, Any]:
        """
        Run the full mock analysis pipeline on an image.

        Args:
            image_path: Path/URL to the stored image.
            report_id: Optional report identifier for traceability.
            analysis_id: Optional persisted analysis identifier.

        Returns:
            A structured mock analysis payload matching the `AIResponse`
            contract (Milestone 5).
        """
        logger.info("Mock analyze_image called: image=%s report=%s", image_path, report_id)
        detections = self.detect_damage(image_path)
        severity_data = self.classify_severity(detections)
        cost_data = self.estimate_repair_cost(severity_data)
        recommendation = self.generate_repair_recommendation(severity_data, cost_data)

        return {
            "report_id": report_id,
            "image_path": image_path,
            "analysis_id": analysis_id,
            "model_version": MOCK_MODEL_VERSION,
            "damage_detected": True,
            "damage_type": self._SAMPLE_DAMAGE_TYPES[0],  # pothole
            "severity": severity_data["severity"],
            "confidence": 0.92,
            "estimated_repair_cost": cost_data["estimated_repair_cost"],
            "repair_method": recommendation["repair_method"],
            "priority": recommendation["priority"],
            "summary": recommendation["summary"],
            "detections": detections,
            # Extended fields consumed by the AI Analysis dashboard.
            "cost_breakdown": cost_data["cost_breakdown"],
            "expected_duration_days": recommendation["expected_duration_days"],
            "equipment": recommendation["equipment"],
            "notes": recommendation["notes"],
            "risk_score": severity_data["overall_score"],
            "overall_damage_score": severity_data["overall_score"],
            "road_condition": self._road_condition(severity_data["overall_score"]),
            "bounding_boxes": [
                {
                    "label": det["label"],
                    "confidence": det["confidence"],
                    "x1": det["bbox"][0],
                    "y1": det["bbox"][1],
                    "x2": det["bbox"][2],
                    "y2": det["bbox"][3],
                }
                for det in detections
            ],
            "mock": True,
        }

    def _road_condition(self, overall_score: float) -> str:
        """Derive a road-condition label from the overall damage score."""
        if overall_score >= 80:
            return "Poor"
        if overall_score >= 60:
            return "Fair"
        if overall_score >= 40:
            return "Moderate"
        return "Good"

    def detect_damage(self, image_path: str) -> List[Dict[str, Any]]:
        """
        Mock damage detection.

        Returns a list of damage detections (bounding boxes + labels). No actual
        inference is performed — the payload is static sample data.
        """
        logger.info("Mock detect_damage called: image=%s", image_path)
        return [
            {
                "label": self._SAMPLE_DAMAGE_TYPES[0],  # pothole
                "confidence": 0.92,
                "bbox": [0.10, 0.20, 0.45, 0.60],
            },
            {
                "label": self._SAMPLE_DAMAGE_TYPES[1],  # crack
                "confidence": 0.78,
                "bbox": [0.55, 0.30, 0.85, 0.55],
            },
        ]

    def classify_severity(self, detections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Mock severity classification from detection results.

        Args:
            detections: List of detection dicts (see ``detect_damage``).

        Returns:
            A severity summary with an overall label and score.
        """
        logger.info("Mock classify_severity called with %d detections", len(detections))
        return {
            "severity": self._SAMPLE_SEVERITIES[1],  # medium
            "overall_score": 72.5,
            "primary_damage_type": self._SAMPLE_DAMAGE_TYPES[0],
            "insurance_risk": "medium",
        }

    def estimate_repair_cost(self, severity: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mock repair-cost estimation from the severity summary.

        Args:
            severity: Severity summary dict (see ``classify_severity``).

        Returns:
            Cost estimate details.
        """
        logger.info(
            "Mock estimate_repair_cost called for severity %s",
            severity.get("severity"),
        )
        return {
            "estimated_repair_cost": 750.00,
            "currency": "USD",
            "cost_breakdown": {
                "material": 320.00,
                "labor": 300.00,
                "equipment": 130.00,
            },
        }

    def generate_repair_recommendation(
        self,
        severity: Optional[Dict[str, Any]] = None,
        cost: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Mock repair-recommendation generation.

        Args:
            severity: Optional severity summary dict.
            cost: Optional cost estimate dict.

        Returns:
            A recommendation payload with priority, repair method, and summary.
        """
        severity = severity or {}
        cost = cost or {}
        logger.info(
            "Mock generate_repair_recommendation called for severity %s",
            severity.get("severity"),
        )
        return {
            "priority": "medium",
            "repair_method": "Partial-depth patching of affected road segment.",
            "summary": (
                "Schedule inspection within 7 days. Apply partial-depth patching "
                "with hot-mix asphalt; monitor drainage around affected area."
            ),
            "expected_duration_days": 3,
            "equipment": ["Road Patch Kit", "Vibratory Roller", "Hot-Mix Asphalt Truck", "Traffic Cones"],
            "notes": (
                "Use signage and barriers. Wear reflective vests and steel-toe boots. "
                "Ensure proper traffic control at all times."
            ),
            "mock": True,
        }

    # ── Backward-compatible aliases (Milestone 4) ──────────────────────────────

    def estimate_severity(self, detections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Alias for ``classify_severity`` kept for Milestone 4 compatibility.
        """
        return self.classify_severity(detections)


# Module-level singleton for convenient imports.
ai_service = AIService()

