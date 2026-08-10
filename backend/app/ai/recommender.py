"""
Repair recommendation generation.

Responsibilities (Milestone 3):
    - Given severity + cost estimates, generate a repair recommendation matching
      the mock contract:
      ``repair_method``, ``priority``, ``summary``, ``notes``,
      ``expected_duration_days``, ``equipment``.

Scaffold only — full implementation lands in Milestone 3.
"""

from __future__ import annotations

from typing import Dict


def generate_recommendation(severity: Dict, cost: Dict) -> Dict:
    """
    Build a repair-recommendation payload from the severity and cost dicts.

    Returns a dict matching the mock contract (see ai_service docs).
    """
    raise NotImplementedError("Implemented in Milestone 3.")


def priority_for(severity: str, damage_score: float) -> str:
    """Map severity + damage score to a PriorityLevel string."""
    raise NotImplementedError("Implemented in Milestone 3.")

