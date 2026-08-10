"""API route modules.

Exports every router so `app.main` can include them with a single import.
"""

from app.api.routes import (  # noqa: F401
    admin,
    ai,
    analytics,
    auth,
    dashboard,
    reports,
    upload,
)

__all__ = ["admin", "ai", "analytics", "auth", "dashboard", "reports", "upload"]

