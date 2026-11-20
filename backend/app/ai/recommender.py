"""
Repair recommendation generation — Milestone 3 (full implementation).

This module generates structured maintenance recommendations using
**deterministic rules only** — no LLM, no Vercel AI Gateway, no external
service.  It works fully offline.

RECOMMENDATION LOGIC
---------------------
The recommendation is determined by the combination of:
  1. Primary damage type (the highest-risk detection label)
  2. Severity level (low / medium / high / critical)
  3. Detection count (many detections escalate priority)

Each (damage_type, severity) pair maps to a specific:
  - repair_method  — what to physically do
  - priority       — urgency level (low / medium / high / critical / urgent)
  - summary        — brief one-sentence action instruction
  - notes          — safety / operational notes for the repair crew

The system is designed to be easily extended: add a row to
``_RECOMMENDATION_TABLE`` to handle a new case without touching other code.
"""

from __future__ import annotations

from typing import Dict

# ── Priority constants ────────────────────────────────────────────────────────
PRIORITY_LOW      = "low"
PRIORITY_MEDIUM   = "medium"
PRIORITY_HIGH     = "high"
PRIORITY_CRITICAL = "critical"
PRIORITY_URGENT   = "urgent"

# ── Recommendation table ──────────────────────────────────────────────────────
# Key: (damage_type, severity)
# Value: (repair_method, priority, summary, notes)
_RECOMMENDATION_TABLE: Dict[tuple, tuple] = {

    # ── Pothole ───────────────────────────────────────────────────────────────
    ("pothole", "low"): (
        "Temporary cold-mix pothole patching.",
        PRIORITY_MEDIUM,
        "Apply temporary cold-mix patch within 7 days to prevent worsening.",
        "Mark pothole with reflective cones. Ensure traffic diversion during patching.",
    ),
    ("pothole", "medium"): (
        "Partial-depth hot-mix asphalt patching.",
        PRIORITY_HIGH,
        "Schedule partial-depth hot-mix asphalt repair within 48 hours.",
        "Saw-cut the damaged area to clean edges before patching. Use vibratory compactor.",
    ),
    ("pothole", "high"): (
        "Full-depth asphalt repair with base course restoration.",
        PRIORITY_URGENT,
        "Urgent full-depth repair required — road safety risk. Begin within 24 hours.",
        "Close affected lane. Excavate to stable base, apply bituminous prime coat, compact in layers.",
    ),
    ("pothole", "critical"): (
        "Emergency road closure and full-depth reconstruction.",
        PRIORITY_URGENT,
        "CRITICAL: Emergency closure required. Reconstruct road base and surface immediately.",
        "Coordinate with traffic management authority. Deploy safety barriers before repair team.",
    ),

    # ── Alligator crack ───────────────────────────────────────────────────────
    ("alligator_crack", "low"): (
        "Crack sealing with hot-applied bituminous sealant.",
        PRIORITY_MEDIUM,
        "Seal alligator cracking within 14 days to prevent water ingress.",
        "Clean cracks with compressed air before sealant application.",
    ),
    ("alligator_crack", "medium"): (
        "Mill-and-overlay of affected surface layer.",
        PRIORITY_HIGH,
        "Schedule mill-and-overlay to arrest pavement fatigue progression.",
        "Check drainage conditions — standing water accelerates alligator cracking.",
    ),
    ("alligator_crack", "high"): (
        "Full-depth pavement reclamation (FDR) or reconstruction.",
        PRIORITY_URGENT,
        "Urgent structural rehabilitation required — pavement base failure indicated.",
        "Investigate sub-grade bearing capacity before reconstruction. Consider drainage upgrade.",
    ),
    ("alligator_crack", "critical"): (
        "Emergency structural reconstruction with sub-grade investigation.",
        PRIORITY_URGENT,
        "CRITICAL: Immediate road closure. Full structural investigation and reconstruction required.",
        "Do not allow heavy traffic. Engage structural engineer before repair.",
    ),

    # ── Longitudinal crack ────────────────────────────────────────────────────
    ("longitudinal_crack", "low"): (
        "Crack routing and sealing.",
        PRIORITY_LOW,
        "Route and seal longitudinal cracks during next scheduled maintenance cycle.",
        "Use hot-applied rubberised bitumen sealant. Monitor for widening.",
    ),
    ("longitudinal_crack", "medium"): (
        "Crack routing, sealing, and surface treatment.",
        PRIORITY_MEDIUM,
        "Schedule crack sealing within 30 days. Apply surface fog seal after.",
        "Ensure sealant penetrates to full crack depth. Check for edge-drop issues.",
    ),
    ("longitudinal_crack", "high"): (
        "Edge repair and partial resurfacing.",
        PRIORITY_HIGH,
        "Repair edge failures and resurface within 14 days to prevent lane widening.",
        "Check for sub-base erosion adjacent to the crack. May indicate drainage failure.",
    ),
    ("longitudinal_crack", "critical"): (
        "Full lane reconstruction including base course.",
        PRIORITY_URGENT,
        "CRITICAL: Reconstruct full lane section — structural integrity compromised.",
        "Immediate traffic management required. Coordinate with local authority.",
    ),

    # ── Transverse crack ──────────────────────────────────────────────────────
    ("transverse_crack", "low"): (
        "Transverse crack sealing with bituminous sealant.",
        PRIORITY_LOW,
        "Seal transverse cracks in next routine maintenance to prevent water infiltration.",
        "Cracks < 5 mm width can be sealed without routing.",
    ),
    ("transverse_crack", "medium"): (
        "Crack sealing and localised overlay.",
        PRIORITY_MEDIUM,
        "Seal and apply thin overlay to arrest thermal cracking progression.",
        "Check joint spacing — cracks may indicate inadequate expansion joints.",
    ),
    ("transverse_crack", "high"): (
        "Resurfacing with geotextile interlayer.",
        PRIORITY_HIGH,
        "Resurface with geotextile interlayer to reduce reflective cracking.",
        "Address sub-base moisture if thermal cracking is extensive.",
    ),
    ("transverse_crack", "critical"): (
        "Full pavement rehabilitation with joint redesign.",
        PRIORITY_URGENT,
        "CRITICAL: Full rehabilitation required — extensive transverse cracking.",
        "Involve pavement design engineer. Review climate and drainage design.",
    ),

    # ── Patchy road section ───────────────────────────────────────────────────
    ("patchy_road_section", "low"): (
        "Surface patch quality inspection and monitoring.",
        PRIORITY_LOW,
        "Inspect existing patches for bond failure and re-patch as needed.",
        "Document patch locations for lifecycle tracking.",
    ),
    ("patchy_road_section", "medium"): (
        "Re-patching with proper saw-cutting and prime coat.",
        PRIORITY_MEDIUM,
        "Re-patch failed road sections with proper surface preparation within 30 days.",
        "Ensure saw-cut edges are clean and prime coat is applied before patching.",
    ),
    ("patchy_road_section", "high"): (
        "Surface rehabilitation with thin overlay.",
        PRIORITY_HIGH,
        "Rehabilitate heavily patched sections with thin bituminous overlay.",
        "Investigate recurring patch failures — may indicate drainage or base issues.",
    ),
    ("patchy_road_section", "critical"): (
        "Full road surface reconstruction.",
        PRIORITY_URGENT,
        "CRITICAL: Extensive patch failure indicates road end-of-life. Full reconstruction required.",
        "Conduct full pavement condition survey before reconstruction.",
    ),

    # ── Lane line blur ────────────────────────────────────────────────────────
    ("lane_line_blur", "low"): (
        "Thermoplastic road marking renewal.",
        PRIORITY_LOW,
        "Renew faded lane markings during next routine road marking cycle.",
        "Use high-reflectivity glass bead thermoplastic for night visibility.",
    ),
    ("lane_line_blur", "medium"): (
        "Priority lane marking renewal.",
        PRIORITY_MEDIUM,
        "Renew lane markings within 30 days — visibility below safe threshold.",
        "Apply markings during dry weather. Allow 30 minutes curing before traffic.",
    ),
    ("lane_line_blur", "high"): (
        "Immediate lane marking renewal — safety hazard.",
        PRIORITY_HIGH,
        "Renew lane markings urgently — significantly degraded visibility safety risk.",
        "Install temporary reflective lane delineators pending permanent marking.",
    ),
    ("lane_line_blur", "critical"): (
        "Emergency lane delineation and marking renewal.",
        PRIORITY_URGENT,
        "CRITICAL: Marking completely absent — immediate safety hazard. Deploy temporary delineators now.",
        "Install temporary raised pavement markers immediately. Schedule permanent repainting.",
    ),

    # ── Manhole cover ─────────────────────────────────────────────────────────
    ("manhole_cover", "low"): (
        "Manhole frame and cover inspection.",
        PRIORITY_LOW,
        "Inspect manhole cover for rocking, protrusion, or corrosion during next inspection.",
        "Ensure cover is flush with road surface (±5 mm tolerance).",
    ),
    ("manhole_cover", "medium"): (
        "Manhole cover re-setting or replacement.",
        PRIORITY_MEDIUM,
        "Reset or replace manhole cover within 14 days — risk of vehicle damage.",
        "Check frame condition. Use traffic-rated Grade D400 cover for roads.",
    ),
    ("manhole_cover", "high"): (
        "Urgent manhole cover replacement with frame repair.",
        PRIORITY_HIGH,
        "Replace manhole cover urgently — significant vehicle and safety risk.",
        "Inspect chamber walls. Use temporary cover until permanent replacement.",
    ),
    ("manhole_cover", "critical"): (
        "Emergency manhole cover replacement — open hazard.",
        PRIORITY_URGENT,
        "CRITICAL: Open or severely damaged manhole is an immediate public safety hazard.",
        "Barricade area immediately. Emergency cover installation required within 2 hours.",
    ),
}

# Safety notes applied to all repair operations.
_UNIVERSAL_SAFETY_NOTES = (
    "Wear PPE (reflective vest, steel-toe boots, hard hat). "
    "Maintain proper traffic control and signage at all times. "
    "Ensure compliance with local road authority safety regulations."
)


def priority_for(severity: str, damage_score: float = 50.0) -> str:
    """
    Map severity + optional damage score to a PriorityLevel string.

    This is a deterministic function — no LLM is consulted.

    Args:
        severity:     Severity label: ``"low"``, ``"medium"``, ``"high"``, ``"critical"``.
        damage_score: Overall damage score (0–100) for fine-grained escalation.

    Returns:
        Priority string: ``"low"`` | ``"medium"`` | ``"high"`` | ``"critical"`` | ``"urgent"``.
    """
    severity = (severity or "low").lower()
    if severity == "critical":
        return PRIORITY_URGENT
    if severity == "high":
        return PRIORITY_URGENT if damage_score >= 80.0 else PRIORITY_HIGH
    if severity == "medium":
        return PRIORITY_HIGH if damage_score >= 50.0 else PRIORITY_MEDIUM
    return PRIORITY_MEDIUM if damage_score >= 30.0 else PRIORITY_LOW


def generate_recommendation(severity_dict: Dict, cost_dict: Dict) -> Dict:
    """
    Build a repair-recommendation payload from severity and cost analysis.

    Uses a deterministic rule table keyed by (primary_damage_type, severity).
    **No LLM, Vercel, or external network call is made.**

    Args:
        severity_dict: Output of :func:`app.ai.severity.classify_severity`.
                       Expected keys: ``severity``, ``primary_damage_type``,
                       ``overall_score``, ``detection_count``.
        cost_dict:     Output of :func:`app.ai.cost_estimator.estimate_repair_cost`.
                       Expected keys: ``estimated_repair_cost``, ``equipment``,
                       ``expected_duration_days``.

    Returns:
        Dict matching the mock AIService recommendation contract::

            {
                "repair_method":          str,
                "priority":               str,
                "summary":                str,
                "notes":                  str,
                "expected_duration_days": int,
                "equipment":              list[str],
                "mock":                   False,
            }
    """
    severity = (severity_dict.get("severity") or "low").lower().strip()
    primary = (severity_dict.get("primary_damage_type") or "other").lower().strip().replace(" ", "_")
    damage_score = float(severity_dict.get("overall_score") or 0.0)
    detection_count = int(severity_dict.get("detection_count") or 0)

    # Lookup the recommendation from the table.
    key = (primary, severity)
    if key in _RECOMMENDATION_TABLE:
        repair_method, priority, summary, notes = _RECOMMENDATION_TABLE[key]
    else:
        # Fallback for unrecognized combinations.
        priority = priority_for(severity, damage_score)
        repair_method = f"Inspect and repair {primary.replace('_', ' ')} ({severity} severity)."
        summary = f"Schedule road maintenance for detected {primary.replace('_', ' ')}."
        notes = "Consult local road authority for appropriate repair specification."

    # Escalation: many detections → bump priority.
    if detection_count >= 5 and priority in (PRIORITY_LOW, PRIORITY_MEDIUM):
        priority = PRIORITY_HIGH
        summary = f"[Multiple detections] {summary}"

    # Append universal safety notes.
    full_notes = f"{notes} {_UNIVERSAL_SAFETY_NOTES}"

    return {
        "repair_method":          repair_method,
        "priority":               priority,
        "summary":                summary,
        "notes":                  full_notes,
        "expected_duration_days": cost_dict.get("expected_duration_days") or 3,
        "equipment":              cost_dict.get("equipment") or _DEFAULT_EQUIPMENT,
        "mock":                   False,
    }


_DEFAULT_EQUIPMENT = ["Asphalt Repair Kit", "Traffic Cones", "Safety Barriers"]
