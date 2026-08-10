"""General utility helpers."""

import re
from datetime import datetime, timezone
from typing import Optional

_REPORT_NUMBER_RE = re.compile(r"^RS-\d{4}-(\d{6})$")


def utcnow() -> datetime:
    """Return the current UTC timestamp (timezone-aware)."""
    return datetime.now(timezone.utc)


def generate_report_number(max_sequence: int = 0) -> str:
    """
    Generate a human-readable report number.

    Format: RS-YYYY-NNNNNN (e.g., RS-2026-000001).

    Args:
        max_sequence: The highest existing sequence number (pass 0 for the
            first report of the year, or compute from the DB in the service).
    """
    year = utcnow().year
    return f"RS-{year}-{max_sequence + 1:06d}"


def parse_report_number(report_number: str) -> Optional[dict]:
    """Parse a report number into its year and sequence parts."""
    match = _REPORT_NUMBER_RE.match(report_number)
    if not match:
        return None
    return {"year": int(report_number[3:7]), "sequence": int(match.group(1))}


def extract_report_sequence(report_number: str) -> int:
    """Extract the numeric sequence from a report number (0 if unparsable)."""
    parsed = parse_report_number(report_number)
    return parsed["sequence"] if parsed else 0

