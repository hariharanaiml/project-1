"""
Report CRUD endpoints.

Implements the full report lifecycle against the database:
  - list with filters + pagination,
  - create (auto-generates a human-readable report number),
  - get by ID,
  - full replace (PUT),
  - partial update (PATCH),
  - status transition (with resolved_at bookkeeping),
  - delete.

Business rules live in `app/services/report_service.py`; the routes here
stay thin and focus on request/response mapping.

The same handlers are registered on two routers:
  * `router`       → mounted at `/api/v1` (primary, versioned design)
  * `alias_router` → mounted at `/api`   (unversioned backward-compat alias)

Both route groups call the exact same service layer — no duplicated business
logic, single source of truth.
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.exceptions import ForbiddenError
from app.models.enums import UserRole
from app.models.report import Report
from app.models.user import User
from app.schemas.report import (
    ReportCreate,
    ReportListResponse,
    ReportRead,
    ReportReplace,
    ReportResponse,
    ReportStatusUpdate,
    ReportUpdate,
)
from app.services.report_service import ReportService

# Versioned router (primary) — mounted under the `/api/v1` prefix in main.py.
router = APIRouter(prefix="/reports", tags=["Reports"])

# Unversioned alias router — mounted under the `/api` prefix in main.py so the
# milestone spec paths (`/api/reports`, `/api/reports/{id}`) work as well.
alias_router = APIRouter(prefix="/reports", tags=["Reports (Unversioned Alias)"])


def _get_service(db: Session) -> ReportService:
    """Build a ReportService instance bound to the request session."""
    return ReportService(db)


def _check_ownership(report: Report, user: User) -> None:
    """Ensure user is an admin or the owner of the report."""
    if user.role == UserRole.ADMIN or user.is_superuser:
        return
    if report.user_id and report.user_id != user.id:
        raise ForbiddenError("You do not have permission to perform this action on this report")


def _register_report_routes(target: APIRouter) -> None:
    """
    Attach the report CRUD handlers to a router.

    Both `router` and `alias_router` are populated from this single function
    so the handlers are defined exactly once (no business-logic duplication).
    """

    @target.get("", summary="List reports", response_model=ReportListResponse)
    async def list_reports(
        status_filter: Optional[str] = Query(
            default=None,
            alias="status",
            description="Filter by report status value",
        ),
        severity: Optional[str] = Query(
            default=None, description="Filter by severity value"
        ),
        road_name: Optional[str] = Query(
            default=None,
            description="Filter by road name (substring, case-insensitive)",
        ),
        page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
        page_size: int = Query(
            default=20, ge=1, le=100, description="Items per page"
        ),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ) -> ReportListResponse:
        """
        List reports with optional filtering and pagination. Requires authentication.
        """
        service = _get_service(db)
        result = service.list_reports(
            status=status_filter,
            severity=severity,
            road_name=road_name,
            page=page,
            page_size=page_size,
        )
        items = [ReportRead.model_validate(item) for item in result["items"]]
        return ReportListResponse(
            success=True,
            data=items,
            total=result["total"],
            page=page,
            page_size=page_size,
        )

    @target.post(
        "",
        summary="Create a report",
        status_code=status.HTTP_201_CREATED,
        response_model=ReportResponse,
    )
    async def create_report(
        payload: ReportCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ) -> ReportResponse:
        """
        Create a new report for the authenticated user.
        """
        if not payload.user_id:
            payload.user_id = current_user.id
        service = _get_service(db)
        report = service.create_report(payload)
        return ReportResponse(data=ReportRead.model_validate(report))

    @target.get(
        "/{report_id}",
        summary="Get a report by ID",
        response_model=ReportResponse,
    )
    async def get_report(
        report_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ) -> ReportResponse:
        """
        Fetch a single report by its UUID. Requires authentication.
        """
        service = _get_service(db)
        report = service.get_report(report_id)
        return ReportResponse(data=ReportRead.model_validate(report))

    @target.put(
        "/{report_id}",
        summary="Replace a report (full update)",
        response_model=ReportResponse,
    )
    async def replace_report(
        report_id: str,
        payload: ReportReplace,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ) -> ReportResponse:
        """
        Fully replace a report's mutable fields. Requires ownership or admin role.
        """
        service = _get_service(db)
        report = service.get_report(report_id)
        _check_ownership(report, current_user)
        updated_report = service.replace_report(report_id, payload)
        return ReportResponse(data=ReportRead.model_validate(updated_report))

    @target.patch(
        "/{report_id}",
        summary="Update a report (partial)",
        response_model=ReportResponse,
    )
    async def update_report(
        report_id: str,
        payload: ReportUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ) -> ReportResponse:
        """
        Partially update a report's mutable fields. Requires ownership or admin role.
        """
        service = _get_service(db)
        report = service.get_report(report_id)
        _check_ownership(report, current_user)
        updated_report = service.update_report(report_id, payload)
        return ReportResponse(data=ReportRead.model_validate(updated_report))

    @target.patch(
        "/{report_id}/status",
        summary="Update report status",
        response_model=ReportResponse,
    )
    async def update_report_status(
        report_id: str,
        payload: ReportStatusUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ) -> ReportResponse:
        """
        Transition a report's status. Requires ownership or admin role.
        """
        service = _get_service(db)
        report = service.get_report(report_id)
        _check_ownership(report, current_user)
        updated_report = service.update_status(report_id, payload.status)
        return ReportResponse(data=ReportRead.model_validate(updated_report))

    @target.delete(
        "/{report_id}",
        summary="Delete a report",
        status_code=status.HTTP_204_NO_CONTENT,
    )
    async def delete_report(
        report_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ) -> None:
        """
        Delete a report by its UUID. Requires ownership or admin role.
        """
        service = _get_service(db)
        report = service.get_report(report_id)
        _check_ownership(report, current_user)
        service.delete_report(report_id)


# Register the same handlers on both routers (single source of truth).
_register_report_routes(router)
_register_report_routes(alias_router)

