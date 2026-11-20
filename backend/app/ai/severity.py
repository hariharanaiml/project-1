"""
Rule-based severity classification — Milestone 3 (full implementation).

HOW SEVERITY IS DETERMINED
---------------------------
The trained YOLOv8 model (best.pt) outputs object class and bounding box only.
It does NOT directly predict a severity level.

Severity is derived deterministically from the detection results using the
following explainable rules:

1. DAMAGE CLASS WEIGHT
   Each road damage class is assigned an inherent risk weight:
   - pothole / alligator_crack:           high risk (weight 3)
   - longitudinal_crack / transverse_crack: medium risk (weight 2)
   - patchy_road_section:                  medium risk (weight 2)
   - lane_line_blur / manhole_cover:       low risk (weight 1)

2. BOX AREA (damage coverage fraction)
   The normalized bounding-box area (fraction of image area 0–1) represents
   how much of the road surface is affected.  Larger boxes → higher severity.

3. CONFIDENCE SCORE
   Higher confidence detections contribute more to the damage score.

4. DAMAGE SCORE FORMULA (0–100)
   For each detection:
       contribution = class_weight × box_area × confidence
   Raw score = Σ contributions × 100
   Clamped to [0, 100] and used to map to a SeverityLevel.

5. SEVERITY MAPPING
   damage_score < 10  → LOW
   damage_score < 30  → MEDIUM
   damage_score < 60  → HIGH
   damage_score ≥ 60  → CRITICAL

6. MULTIPLE DETECTIONS
   If there are ≥ 4 high-risk detections (pothole / alligator_crack),
   the severity is escalated to at least HIGH regardless of score.

These thresholds are deliberately conservative so that on-road detections
trigger appropriate maintenance attention.
"""

from __future__ import annotations

from typing import Dict, List

# ── Class risk weights ─────────────────────────────────────────────────────────
# Scale: 1 (low concern) to 3 (high concern).
# These reflect real-world maintenance urgency, not model prediction.
_CLASS_WEIGHTS: Dict[str, float] = {
    "pothole":            3.0,
    "alligator_crack":    3.0,
    "longitudinal_crack": 2.0,
    "transverse_crack":   2.0,
    "patchy_road_section": 2.0,
    "lane_line_blur":     1.0,
    "manhole_cover":      1.0,
}
_DEFAULT_WEIGHT = 1.5  # for unknown/future classes

# ── Severity thresholds ───────────────────────────────────────────────────────
_THRESHOLDS = [
    (60.0, "critical"),
    (30.0, "high"),
    (10.0, "medium"),
    (0.0,  "low"),
]

# Classes that trigger severity escalation when many are detected.
_HIGH_RISK_CLASSES = {"pothole", "alligator_crack"}
_ESCALATION_COUNT = 3   # ≥ N high-risk detections → at least HIGH


def _box_area(bbox: list) -> float:
    """Fractional image area covered by the normalized bounding box."""
    if not bbox or len(bbox) < 4:
        return 0.0
    x1, y1, x2, y2 = bbox[:4]
    w = max(0.0, float(x2) - float(x1))
    h = max(0.0, float(y2) - float(y1))
    return w * h


def damage_score_from_boxes(detections: List[Dict], image_area: float = 1.0) -> float:
    """
    Compute a damage score (0–100) from the detection list.

    Args:
        detections: List of detection dicts with ``label``, ``confidence``,
                    and normalized ``bbox`` keys.
        image_area: Ignored (reserved for future pixel-space support).
                    Normalized boxes are used directly.

    Returns:
        Damage score in [0, 100].
    """
    if not detections:
        return 0.0
    raw = 0.0
    for det in detections:
        label = (det.get("label") or "").lower().strip().replace(" ", "_")
        weight = _CLASS_WEIGHTS.get(label, _DEFAULT_WEIGHT)
        area = _box_area(det.get("bbox") or [])
        confidence = float(det.get("confidence") or 0.0)
        raw += weight * area * confidence
    # Normalize: a single large high-confidence pothole covering 25% of the frame
    # gives roughly 3 × 0.25 × 0.9 = 0.675 → score ≈ 67.5 (CRITICAL).
    return min(100.0, round(raw * 100.0, 2))


def classify_detection_severity(det: Dict) -> str:
    """Return severity ('low' | 'medium' | 'high' | 'critical') for an individual detection."""
    label = (det.get("label") or "").lower().strip().replace(" ", "_")
    area = _box_area(det.get("bbox") or [])
    conf = float(det.get("confidence") or 0.0)
    weight = _CLASS_WEIGHTS.get(label, _DEFAULT_WEIGHT)
    score = weight * area * conf * 100.0
    if label in _HIGH_RISK_CLASSES:
        if score >= 15.0 or area >= 0.08:
            return "critical" if score >= 35.0 else "high"
        return "medium"
    if score >= 25.0:
        return "critical"
    if score >= 12.0:
        return "high"
    if score >= 4.0:
        return "medium"
    return "low"


def _primary_damage_type(detections: List[Dict]) -> str:
    """Return the label of the highest-weight detection (by weight × confidence)."""
    if not detections:
        return "other"
    best = max(
        detections,
        key=lambda d: _CLASS_WEIGHTS.get(
            (d.get("label") or "").lower().strip().replace(" ", "_"), _DEFAULT_WEIGHT
        )
        * float(d.get("confidence") or 0.0),
    )
    raw_label = best.get("label") or "other"
    return str(raw_label).lower().strip().replace(" ", "_")


def classify_severity(detections: List[Dict]) -> Dict:
    """
    Derive severity + scores from a list of YOLO detections.

    This is a **deterministic, rule-based** function.
    It does NOT use an LLM or any external service.

    Args:
        detections: List of detection dicts (from YOLODetector.detect()).
                    Each dict has: ``label``, ``class_id``, ``confidence``, ``bbox``.

    Returns:
        Dict with keys::

            {
                "severity":            str,   # "low" | "medium" | "high" | "critical"
                "overall_score":       float, # 0–100 overall damage score
                "risk_score":          float, # same scale, for API compatibility
                "primary_damage_type": str,   # dominant damage label
                "detection_count":     int,
                "insurance_risk":      str,   # "low" | "medium" | "high"
            }
    """
    if not detections:
        return {
            "severity": "low",
            "overall_score": 0.0,
            "risk_score": 0.0,
            "primary_damage_type": "none",
            "detection_count": 0,
            "insurance_risk": "low",
        }

    # Ensure each individual detection has its own severity attached
    for d in detections:
        if "severity" not in d:
            d["severity"] = classify_detection_severity(d)

    score = damage_score_from_boxes(detections)

    # Map score → severity label.
    severity = "low"
    for threshold, label in _THRESHOLDS:
        if score >= threshold:
            severity = label
            break

    # Escalation rule: many high-risk detections → at least HIGH.
    high_risk_count = sum(
        1 for d in detections
        if (d.get("label") or "").lower().strip().replace(" ", "_") in _HIGH_RISK_CLASSES
    )
    if high_risk_count >= _ESCALATION_COUNT and severity in ("low", "medium"):
        severity = "high"

    primary = _primary_damage_type(detections)

    # Insurance risk tracks severity but uses "medium" instead of "critical".
    insurance_map = {"low": "low", "medium": "medium", "high": "high", "critical": "high"}

    return {
        "severity": severity,
        "overall_score": score,
        "risk_score": score,
        "primary_damage_type": primary,
        "detection_count": len(detections),
        "insurance_risk": insurance_map.get(severity, "medium"),
    }
