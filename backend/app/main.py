"""
RoadSense AI — FastAPI application entry point (Milestone 1).

Wires together configuration, logging, CORS, exception handlers, database
initialization, and all placeholder API routers.

Run locally:
    uvicorn app.main:app --reload
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.ai.settings import ai_settings
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.db.init_db import init_db
from app.api.routes import auth, reports, dashboard, analytics, ai, admin, upload, users

logger = get_logger(__name__)


def _log_ai_inference_status() -> None:
    """Log the real-AI inference status at startup (non-fatal)."""
    if ai_settings.enabled:
        if ai_settings.model_path_exists:
            logger.info(
                "Real AI inference ENABLED — model=%s device=%s conf=%.2f",
                ai_settings.model_path,
                ai_settings.device,
                ai_settings.confidence_threshold,
            )
        else:
            logger.warning(
                "AI_ENABLED=true but MODEL_PATH is set to a missing file (%s). "
                "Real inference disabled; the mock pipeline will be used until the "
                "model file is provided.",
                ai_settings.model_path,
            )
    else:
        logger.warning(
            "Real AI inference DISABLED (AI_ENABLED=%s, MODEL_PATH=%r). "
            "Running with the mock pipeline. Set AI_ENABLED=true and MODEL_PATH "
            "to enable real YOLOv8 inference.",
            ai_settings.ai_enabled,
            ai_settings.model_path,
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown lifecycle."""
    configure_logging()
    logger.info("Starting %s v%s (%s)", settings.app_name, settings.app_version, settings.environment)
    logger.info("Database: %s", settings.database_url.split("://")[0])
    init_db()
    _log_ai_inference_status()
    logger.info("Application startup complete.")
    yield
    logger.info("Application shutdown.")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "RoadSense AI — Smart Infrastructure Intelligence Platform API. "
        "Milestone 5: production-ready image upload module "
        "(`POST /api/v1/upload` + unversioned alias `POST /api/upload`; "
        "JPG/JPEG/PNG only, max 10 MB, UUID storage, static file serving at "
        "`/uploads/{filename}`), full Report CRUD, and a structured **mock AI "
        "damage-analysis pipeline** (`POST /api/v1/ai/analyze` + alias "
        "`POST /api/ai/analyze`) that persists `AIAnalysis` records and updates "
        "reports — no YOLOv8 / torch / OpenCV / model loading. Real inference "
        "lands in a later milestone."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# ── Centralized exception handlers ────────────────────────────────────────────
register_exception_handlers(app)


# ── Static files (uploaded images) ────────────────────────────────────────────
# Serves files from the configured uploads/ directory at /uploads/<file>.
app.mount(
    settings.upload_url_prefix,
    StaticFiles(directory=str(settings.upload_dir_path)),
    name="uploads",
)


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["System"])
async def root() -> dict:
    """Root endpoint — basic API information."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "docs": "/docs",
        "health": "/api/health",
        "api_prefix": settings.api_v1_prefix,
    }


# ── Health check (outside the versioned prefix) ───────────────────────────────
@app.get("/api/health", tags=["System"], summary="Health check")
async def health_check() -> dict:
    """Health check endpoint — verifies the API and database connectivity."""
    from app.services.health_service import build_health_status

    return build_health_status()


# ── Versioned API routers ─────────────────────────────────────────────────────
API_PREFIX = settings.api_v1_prefix

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(reports.router, prefix=API_PREFIX)
app.include_router(upload.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)
app.include_router(analytics.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)

# ── Unversioned alias routers (Milestones 3–5) ────────────────────────────────
# Backward-compatible aliases so the milestone-spec paths also work:
#   /api/reports*, /api/upload, /api/ai/*
# Same handlers as the versioned routers — no duplicated business logic.
# Registered AFTER the versioned routers so the versioned paths take
# precedence; the unversioned aliases fall through.
app.include_router(reports.alias_router, prefix="/api")
app.include_router(upload.alias_router, prefix="/api")
app.include_router(ai.alias_router, prefix="/api")

