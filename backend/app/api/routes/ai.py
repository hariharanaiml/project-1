"""YOLO damage-analysis endpoints and the backward-compatible mock analyze API."""

from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.ai.settings import ai_settings
from app.api.deps import get_db
from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.ai import AIDetectionRequest
from app.schemas.ai_analysis import AIResponse, AIResponseEnvelope
from app.services.ai_analysis_service import AIAnalysisService
from app.services.inspection_persistence_service import InspectionPersistenceService
from app.utils.upload_utils import validate_image_content

logger = get_logger(__name__)

# Versioned router (primary) — mounted under `/api/v1` in main.py.
router = APIRouter(prefix="/ai", tags=["AI"])

# Unversioned alias router — mounted under `/api` in main.py so
# `/api/ai/analyze` and `/api/ai/models` work as well.
alias_router = APIRouter(prefix="/ai", tags=["AI (Unversioned Alias)"])


def _get_service(db: Session) -> AIAnalysisService:
    """Build an AIAnalysisService bound to the request session."""
    return AIAnalysisService(db)


def _run_yolo_predict(image_bytes: bytes, filename: str, report_id: str | None = None) -> dict:
    """
    Run the full RoadSense AI pipeline on an uploaded image.

    Pipeline:  bytes → temp file → RoadDamagePipeline
                → YOLO detection → postprocess → severity → cost → recommendation
                → annotated image → structured JSON response

    Entirely isolated from LLM / Vercel / LiteLLM — works offline.
    Never raises — returns an error dict when the model is unavailable.

    Args:
        image_bytes: Raw bytes of the uploaded image.
        filename:    Original filename (for traceability only).
        report_id:   Optional associated report UUID.

    Returns:
        Full pipeline result dict with: success, detections, detection_count,
        severity, cost_range, recommendation, annotated_image_url, processing_time_ms.
    """
    import tempfile
    import os
    from pathlib import Path

    # Save bytes to a temporary file so the pipeline can resolve/decode it.
    suffix = Path(filename).suffix or ".jpg"
    tmp_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(
            suffix=suffix, delete=False, prefix="roadsense_upload_"
        ) as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name

        from app.ai.pipeline import pipeline
        result = pipeline.run(image_path=tmp_path, report_id=report_id, analysis_id=None)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to prepare YOLO analysis for %s", filename)
        result = {
            "success": False,
            "image": filename,
            "detections": [],
            "detection_count": 0,
            "model_loaded": False,
            "llm_available": False,
            "recommendation": None,
            "error": str(exc),
        }
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    # Normalize to a consistent API envelope.
    if "error" not in result:
        result["success"] = True
        result["image"] = filename
        result["detection_count"] = len(result.get("detections") or [])
        result["model_loaded"] = True
        if "recommendation" not in result:
            result["recommendation"] = result.get("summary") or result.get("repair_method")
        if report_id:
            result["report_id"] = report_id
    # Temporary filesystem paths are implementation details and must never be
    # returned to the browser.
    result.pop("image_path", None)
    return result



def _register_ai_routes(target: APIRouter) -> None:
    """Attach the AI handlers to a router (single source of truth)."""

    @target.post(
        "/predict",
        summary="Run real-time YOLO damage detection",
        description=(
            "Uploads an image, runs YOLOv8 inference, and returns detection results. "
            "A successful inference is persisted as an inspection (AIAnalysis) and "
            "backfills the owning Report when a report_id is supplied."
        ),
        status_code=status.HTTP_200_OK,
    )
    async def predict_damage(
        file: UploadFile = File(...),
        report_id: Optional[str] = Form(
            default=None,
            description="Optional report id used to attach this inspection.",
        ),
        db: Session = Depends(get_db),
    ) -> dict:
        """Validate an image and run YOLO inference without exposing internals."""
        content = await file.read(settings.max_upload_size_bytes + 1)
        validate_image_content(content, file.content_type)

        # If a report_id was supplied, verify the report exists up front so a
        # malformed reference fails fast (before expensive inference).
        if report_id:
            from app.repositories.report_repository import ReportRepository

            report = ReportRepository(db).get(report_id)
            if not report:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail='Report not found.',
                )

        result = _run_yolo_predict(content, file.filename or 'upload.jpg', report_id=report_id)
        if result.get("error"):
            from app.ai.model_manager import model_manager

            logger.error("YOLO analysis failed for %s: %s", file.filename, result["error"])
            if not model_manager.is_loaded():
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"AI detection service is unavailable: {result['error']}",
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI detection failed: {result['error']}",
            )

        # ── Persist the successful inspection ──────────────────────────────────
        # The pipeline result is stored as an AIAnalysis row and the owning
        # Report is backfilled with AI-derived fields. Failures are never
        # recorded as successful inspections (persist_result skips errors).
        if report_id:
            try:
                persistence = InspectionPersistenceService(db)
                persistence.persist_result(
                    result=result,
                    report_id=report_id,
                )
            except Exception:  # noqa: BLE001
                # Persistence failures must never mask a successful detection.
                logger.exception(
                    "Failed to persist AI inspection for report %s", report_id
                )

        return result

    @target.get(
        "/status",
        summary="Check AI model status",
        description="Verifies if the YOLO model is loaded and ready.",
    )
    async def check_status() -> dict:
        """Return model load status."""
        from app.ai.model_manager import model_manager
        model = model_manager.get_model()
        return {
            "model_loaded": model is not None,
            "ai_enabled": ai_settings.ai_enabled,
        }

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
