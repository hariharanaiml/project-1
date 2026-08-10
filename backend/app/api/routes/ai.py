"""
AI analysis endpoints — Milestone 5.

Exposes the AI damage-analysis API surface and delegates to the **mock**
AIService (orchestrated through `AIAnalysisService`), so the backend remains
fully functional without any AI model.

Endpoints (defined once, mounted at both prefixes):
  * `POST /api/v1/ai/analyze`  (primary, versioned)
  * `POST /api/ai/analyze`     (unversioned alias)
  * `GET  /api/v1/ai/models`   (mock model registry)
  * `GET  /api/ai/models`      (unversioned alias)

YOLOv8 / Torch / OpenCV / model loading / Roboflow / WebSockets are
explicitly out of scope for this milestone.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.ai import AIDetectionRequest
from app.schemas.ai_analysis import AIResponse, AIResponseEnvelope
from app.services.ai_analysis_service import AIAnalysisService

# Versioned router (primary) — mounted under `/api/v1` in main.py.
router = APIRouter(prefix="/ai", tags=["AI"])

# Unversioned alias router — mounted under `/api` in main.py so
# `/api/ai/analyze` and `/api/ai/models` work as well.
alias_router = APIRouter(prefix="/ai", tags=["AI (Unversioned Alias)"])


def _get_service(db: Session) -> AIAnalysisService:
    """Build an AIAnalysisService bound to the request session."""
    return AIAnalysisService(db)


def _register_ai_routes(target: APIRouter) -> None:
    """Attach the AI handlers to a router (single source of truth)."""

    @target.post(
        "/analyze",
        summary="Run AI damage analysis (mock)",
        description=(
            "Accepts a report_id (and optional image_path), runs the **mock** "
            "analysis pipeline, and returns a structured AI response. No real "
            "inference is performed in this milestone."
        ),
        status_code=status.HTTP_200_OK,
        response_model=AIResponseEnvelope,
    )
    async def analyze_damage(
        payload: AIDetectionRequest,
        db: Session = Depends(get_db),
    ) -> AIResponseEnvelope:
        """
        Analyze a report's road-damage image.

        Raises 404 (NOT_FOUND) if the report does not exist. The returned
        payload matches the `AIResponse` contract (damage_detected, severity,
        confidence, estimated_repair_cost, repair_method, priority, ...).
        """
        service = _get_service(db)
        result = service.analyze_report(
            report_id=payload.report_id,
            image_path=payload.image_path,
        )
        return AIResponseEnvelope(data=AIResponse.model_validate(result))

    @target.get(
        "/models",
        summary="List available AI models (mock)",
        description="Returns the registered detection model versions (placeholder list).",
    )
    async def list_models() -> dict:
        """Return the registered detection model versions (placeholder list)."""
        from app.core.responses import ok_response

        return ok_response(
            {
                "message": "Mock model registry — YOLOv8 model registration lands in a later milestone.",
                "models": [],
            }
        )

    @target.get(
        "/analyses/latest",
        summary="Get the latest AI analysis",
        description="Returns the most recent persisted AI analysis with its report context.",
    )
    async def get_latest_analysis(
        db: Session = Depends(get_db),
    ) -> dict:
        """Return the most recent AI analysis (404 if none has run yet)."""
        from app.core.responses import ok_response

        return ok_response(_get_service(db).get_latest_analysis())

    @target.get(
        "/analyses",
        summary="List AI analyses",
        description="Returns recent AI analyses, optionally filtered by report_id.",
    )
    async def list_analyses(
        report_id: str | None = None,
        limit: int = 20,
        db: Session = Depends(get_db),
    ) -> dict:
        """Return a list of AI analyses (recent first)."""
        from app.core.responses import ok_list_response

        items = _get_service(db).list_analyses(report_id=report_id, limit=limit)
        return ok_list_response(items, total=len(items), page=1, page_size=limit)

    @target.get(
        "/analyses/{analysis_id}",
        summary="Get a single AI analysis",
        description="Returns one persisted AI analysis by id with report context.",
    )
    async def get_analysis(
        analysis_id: str,
        db: Session = Depends(get_db),
    ) -> dict:
        """Return a single AI analysis by id (404 if not found)."""
        from app.core.responses import ok_response

        return ok_response(_get_service(db).get_analysis(analysis_id))


# Register the same handlers on both routers (single source of truth).
_register_ai_routes(router)
_register_ai_routes(alias_router)

