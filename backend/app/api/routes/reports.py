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

from app.api.deps import get_db
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
    ) -> ReportListResponse:
        """
        List reports with optional filtering and pagination.

        Returns the standard list envelope:
          { "success": true, "data": [...], "total": N, "page": 1, "page_size": 20 }
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
    ) -> ReportResponse:
        """
        Create a new report.

        The report number (RS-YYYY-NNNNNN) is generated automatically.
        Returns the persisted report in the standard success envelope.
        """
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
    ) -> ReportResponse:
        """
        Fetch a single report by its UUID.

        Raises 404 (NOT_FOUND) when the report does not exist.
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
    ) -> ReportResponse:
        """
        Fully replace a report's mutable fields (PUT semantics).

        Unlike PATCH, every mutable field is overwritten with the supplied
        values; `road_name` and `description` are required. The report id,
        report number, status, and timestamps are preserved.

        Raises 404 when the report does not exist.
        """
        service = _get_service(db)
        report = service.replace_report(report_id, payload)
        return ReportResponse(data=ReportRead.model_validate(report))

    @target.patch(
        "/{report_id}",
        summary="Update a report (partial)",
        response_model=ReportResponse,
    )
    async def update_report(
        report_id: str,
        payload: ReportUpdate,
        db: Session = Depends(get_db),
    ) -> ReportResponse:
        """
        Partially update a report's mutable fields.

        Fields not provided in the body are left unchanged (exclude_unset).
        """
        service = _get_service(db)
        report = service.update_report(report_id, payload)
        return ReportResponse(data=ReportRead.model_validate(report))

    @target.patch(
        "/{report_id}/status",
        summary="Update report status",
        response_model=ReportResponse,
    )
    async def update_report_status(
        report_id: str,
        payload: ReportStatusUpdate,
        db: Session = Depends(get_db),
    ) -> ReportResponse:
        """
        Transition a report's lifecycle status.

        Setting status to `resolved` records `resolved_at`; moving away from
        `resolved` clears it.
        """
        service = _get_service(db)
        report = service.update_status(report_id, payload.status)
        return ReportResponse(data=ReportRead.model_validate(report))

    @target.delete(
        "/{report_id}",
        summary="Delete a report",
        status_code=status.HTTP_204_NO_CONTENT,
    )
    async def delete_report(
        report_id: str,
        db: Session = Depends(get_db),
    ) -> None:
        """
        Delete a report by its UUID.

        Returns 204 No Content on success; 404 if the report does not exist.
        """
        service = _get_service(db)
        service.delete_report(report_id)


# Register the same handlers on both routers (single source of truth).
_register_report_routes(router)
_register_report_routes(alias_router)

