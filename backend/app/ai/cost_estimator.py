"""
Approximate repair cost estimation — Milestone 3 (full implementation).

IMPORTANT DISCLAIMER
--------------------
These are **approximate indicative estimates** based on typical Indian road
repair costs from PWD/NHAI published data (2023–2024).  They are NOT
construction quotes and should NOT be used for procurement or tendering.
Actual costs depend on location, traffic diversion requirements, contractor
rates, and material availability.

HOW THE ESTIMATE WORKS
-----------------------
A two-dimensional lookup table maps (damage_type × severity_level) to a
(min_INR, max_INR) range.  The function returns both the range and a
mid-point "central estimate" for use in summaries.

No LLM or external service is consulted.  The function is deterministic and
works fully offline.
"""

from __future__ import annotations

from typing import Dict, List, Tuple

# ── Cost table ────────────────────────────────────────────────────────────────
# (damage_type, severity) → (min_INR, max_INR) per affected area unit.
# Costs represent per-occurrence estimates for a typical urban road segment.
# Currency: Indian Rupee (INR).

_COST_TABLE: Dict[Tuple[str, str], Tuple[int, int]] = {
    # Pothole — most common, cost depends on depth/size
    ("pothole", "low"):      (2_000,   8_000),
    ("pothole", "medium"):   (8_000,  25_000),
    ("pothole", "high"):    (25_000,  70_000),
    ("pothole", "critical"): (70_000, 2_00_000),

    # Alligator / fatigue cracking — indicates base failure
    ("alligator_crack", "low"):      (5_000,   15_000),
    ("alligator_crack", "medium"):  (15_000,   50_000),
    ("alligator_crack", "high"):    (50_000,  1_50_000),
    ("alligator_crack", "critical"): (1_50_000, 5_00_000),

    # Longitudinal crack — typically pavement joint / edge failure
    ("longitudinal_crack", "low"):      (1_500,   5_000),
    ("longitudinal_crack", "medium"):   (5_000,  20_000),
    ("longitudinal_crack", "high"):    (20_000,  60_000),
    ("longitudinal_crack", "critical"): (60_000, 1_80_000),

    # Transverse crack — thermal / shrinkage cracking
    ("transverse_crack", "low"):      (1_000,   4_000),
    ("transverse_crack", "medium"):   (4_000,  15_000),
    ("transverse_crack", "high"):    (15_000,  50_000),
    ("transverse_crack", "critical"): (50_000, 1_50_000),

    # Patchy road section — prior repairs failing or surface deterioration
    ("patchy_road_section", "low"):      (3_000,   10_000),
    ("patchy_road_section", "medium"):  (10_000,   35_000),
    ("patchy_road_section", "high"):    (35_000,  1_00_000),
    ("patchy_road_section", "critical"): (1_00_000, 3_00_000),

    # Lane line blur — marking renewal, low structural concern
    ("lane_line_blur", "low"):      (500,   2_000),
    ("lane_line_blur", "medium"):  (2_000,  8_000),
    ("lane_line_blur", "high"):    (8_000, 20_000),
    ("lane_line_blur", "critical"): (20_000, 50_000),

    # Manhole cover — replacement / resetting
    ("manhole_cover", "low"):      (3_000,   8_000),
    ("manhole_cover", "medium"):   (8_000,  20_000),
    ("manhole_cover", "high"):    (20_000,  50_000),
    ("manhole_cover", "critical"): (50_000, 1_50_000),
}

# Fallback for unrecognised damage types.
_DEFAULT_COSTS: Dict[str, Tuple[int, int]] = {
    "low":      (1_000,   5_000),
    "medium":   (5_000,  20_000),
    "high":    (20_000,  80_000),
    "critical": (80_000, 3_00_000),
}

# Equipment typically needed per damage type.
_EQUIPMENT_TABLE: Dict[str, List[str]] = {
    "pothole":            ["Pothole Patch Kit", "Vibratory Plate Compactor", "Asphalt Mixer", "Traffic Cones"],
    "alligator_crack":    ["Road Milling Machine", "Asphalt Paver", "Vibratory Roller", "Traffic Barriers"],
    "longitudinal_crack": ["Crack Sealing Machine", "Hot Bitumen Applicator", "Traffic Cones"],
    "transverse_crack":   ["Crack Routing Machine", "Joint Sealant Applicator", "Traffic Cones"],
    "patchy_road_section": ["Road Milling Machine", "Asphalt Paver", "Vibratory Roller", "Traffic Management Kit"],
    "lane_line_blur":     ["Thermoplastic Road Marking Machine", "Traffic Cones"],
    "manhole_cover":      ["Hydraulic Jack", "Manhole Frame Setter", "Mortar Mix", "Traffic Cones"],
}
_DEFAULT_EQUIPMENT = ["Asphalt Repair Kit", "Traffic Cones", "Safety Barriers"]


def cost_breakdown_for(total_inr: float) -> Dict:
    """
    Split a total INR estimate into material / labor / equipment shares.

    Industry-typical split for Indian road repairs:
      - Material: ~45 %
      - Labour:   ~40 %
      - Equipment: ~15 %

    Args:
        total_inr: Central cost estimate in INR.

    Returns:
        Dict with ``material``, ``labour``, ``equipment`` keys (all INR).
    """
    total = float(total_inr)
    return {
        "material":  round(total * 0.45, 2),
        "labour":    round(total * 0.40, 2),
        "equipment": round(total * 0.15, 2),
    }


def estimate_repair_cost(damage_type: str, severity: str) -> Dict:
    """
    Return an approximate INR repair cost for a (damage_type, severity) pair.

    This is a **deterministic rule-based estimate** — no LLM is used.
    Costs are indicative only and are clearly labelled as approximate.

    Args:
        damage_type: Canonical damage label (e.g. ``"pothole"``).
        severity:    Severity level string: ``"low"``, ``"medium"``,
                     ``"high"``, or ``"critical"``.

    Returns:
        Dict::

            {
                "estimated_repair_cost": float,  # mid-point central estimate (INR)
                "cost_range": {"min": int, "max": int},
                "currency": "INR",
                "disclaimer": str,
                "cost_breakdown": {"material": float, "labour": float, "equipment": float},
                "expected_duration_days": int,
                "equipment": [str, ...],
            }
    """
    damage_type = (damage_type or "other").lower().strip().replace(" ", "_")
    severity = (severity or "low").lower().strip()

    key = (damage_type, severity)
    cost_min, cost_max = _COST_TABLE.get(key, _DEFAULT_COSTS.get(severity, (5_000, 20_000)))
    central = (cost_min + cost_max) / 2.0

    duration_days = _duration_days(severity)
    equipment = _EQUIPMENT_TABLE.get(damage_type, _DEFAULT_EQUIPMENT)

    return {
        "estimated_repair_cost": round(central, 2),
        "cost_range": {"min": cost_min, "max": cost_max},
        "currency": "INR",
        "disclaimer": (
            "This is an approximate indicative estimate based on typical Indian "
            "road repair costs (PWD/NHAI 2023-24 data). Actual costs depend on "
            "location, contractor rates, and site conditions."
        ),
        "cost_breakdown": cost_breakdown_for(central),
        "expected_duration_days": duration_days,
        "equipment": equipment,
    }


def _duration_days(severity: str) -> int:
    """Return a typical repair duration in working days by severity."""
    return {"low": 1, "medium": 2, "high": 5, "critical": 14}.get(severity, 3)
