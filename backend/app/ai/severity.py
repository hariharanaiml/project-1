"""
Severity classification from detection results.

Responsibilities (Milestone 3):
    - Convert a list of detections into a SeverityLevel (low/medium/high/critical).
    - Compute an overall damage score (0–100) and risk score (0–100) using a
      deterministic rule set (class mix, box areas, detection counts, confidences).
    - Map a damage-label set to the primary DamageType.

Scaffold only — full implementation lands in Milestone 3.
"""

from __future__ import annotations

from typing import Dict, List


def classify_severity(detections: List[Dict]) -> Dict:
    """
    Derive severity + scores from detection results.

    Returns:
        ``{"severity", "overall_score", "risk_score", "primary_damage_type"}``.
    """
    raise NotImplementedError("Implemented in Milestone 3.")


def damage_score_from_boxes(detections: List[Dict], image_area: float) -> float:
    """Compute a damage score from the fraction of image area covered by boxes."""
    raise NotImplementedError("Implemented in Milestone 3.")

