"""
Repair cost estimation.

Responsibilities (Milestone 3):
    - Given a primary damage type + severity, return a deterministic cost
      estimate (matching the current mock's cost_breakdown contract):
      ``estimated_repair_cost``, ``currency``, ``cost_breakdown``,
      ``expected_duration_days``, ``equipment``.
    - Cost tables keyed by (DamageType x SeverityLevel).

Scaffold only — full implementation lands in Milestone 3.
"""

from __future__ import annotations

from typing import Dict


def estimate_repair_cost(damage_type: str, severity: str) -> Dict:
    """
    Estimate repair cost for a damage type/severity pair.

    Returns a dict matching the mock contract:
    ``{estimated_repair_cost, currency, cost_breakdown, expected_duration_days, equipment}``.
    """
    raise NotImplementedError("Implemented in Milestone 3.")


def cost_breakdown_for(total: float) -> Dict:
    """Split a total cost into material/labor/equipment shares."""
    raise NotImplementedError("Implemented in Milestone 3.")

