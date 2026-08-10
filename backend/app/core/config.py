"""
Centralized application configuration.

Reads settings from environment variables / `.env` file using pydantic-settings.
All backend settings live here so components share a single source of truth.
"""

from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ────────────────────────────────────────────────────────────
    app_name: str = "RoadSense AI API"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # ── Database ───────────────────────────────────────────────────────────────
    # Defaults to SQLite so the project runs out of the box. PostgreSQL is fully
    # supported — change DATABASE_URL to a postgresql+psycopg:// URL to switch.
    database_url: str = "sqlite:///./roadsense.db"
    # Keep False so Alembic migrations are the source of truth for the schema.
    auto_create_tables: bool = False

    # ── Security (JWT placeholder — real auth lands in Milestone 2) ────────────
    secret_key: str = "dev-secret-key-change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # ── CORS ───────────────────────────────────────────────────────────────────
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # ── Logging ────────────────────────────────────────────────────────────────
    log_level: str = "INFO"

    # ── Uploads ────────────────────────────────────────────────────────────────
    # Directory where uploaded images are stored (relative to the backend/ root
    # or absolute). A `.gitkeep` keeps the directory in the repo.
    upload_dir: str = "./uploads"
    # URL prefix that serves the uploaded files via StaticFiles.
    upload_url_prefix: str = "/uploads"
    # Maximum accepted upload size in megabytes.
    # Bound from the MAX_UPLOAD_SIZE env key (alias also supports the
    # MAX_UPLOAD_SIZE_MB form). MAX_UPLOAD_SIZE is parsed as megabytes.
    max_upload_size_mb: int = Field(
        default=10,
        validation_alias=AliasChoices("MAX_UPLOAD_SIZE", "MAX_UPLOAD_SIZE_MB"),
    )
    # Comma-separated list of allowed image MIME types (env: ALLOWED_IMAGE_TYPES).
    # Milestone 4 scope: JPG / JPEG / PNG only.
    allowed_image_types: str = "image/jpeg,image/png"

    # ── AI inference (Phase 13 — Real YOLOv8 integration) ─────────────────────
    # Master switch: when True, the real YOLOv8 pipeline is used; when False,
    # the deterministic mock pipeline runs so the app works without a model.
    # (env: AI_INFERENCE_ENABLED)
    ai_inference_enabled: bool = False
    # Path to the YOLOv8 weights file (.pt), e.g. ./models/yolov8n.pt.
    # Must be set (and the file must exist) when AI_INFERENCE_ENABLED=true.
    # (env: AI_MODEL_PATH)
    model_path: str = "./models/yolov8n.pt"
    # Human-readable model name reported to clients (env: AI_MODEL_NAME).
    model_name: str = "yolov8n"
    # Compute device: "auto", "cpu", or "cuda:0" (env: AI_DEVICE).
    device: str = "auto"
    # Confidence threshold (0–1) for a detection to be kept (env: AI_CONF_THRESHOLD).
    conf_threshold: float = 0.25
    # IoU threshold for NMS (env: AI_IOU_THRESHOLD).
    iou_threshold: float = 0.45
    # YOLO input image size (env: AI_IMAGE_SIZE).
    image_size: int = 640
    # Preload & warm the model in the app lifespan (env: AI_PRELOAD_MODEL).
    preload_model: bool = True
    # Directory where annotated images are stored (env: AI_ANNOTATED_DIR).
    annotated_dir: str = "./annotated"
    # URL prefix that serves annotated images via StaticFiles (env: AI_ANNOTATED_URL_PREFIX).
    annotated_url_prefix: str = "/annotated"

    # ── Derived ────────────────────────────────────────────────────────────────
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse the comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def max_upload_size_bytes(self) -> int:
        """Return the maximum upload size in bytes."""
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def max_upload_size(self) -> int:
        """Alias for `max_upload_size_bytes` — mirrors the `MAX_UPLOAD_SIZE` env key."""
        return self.max_upload_size_bytes

    @property
    def allowed_image_types_set(self) -> set:
        """Return the allowed image MIME types as a set."""
        return {item.strip().lower() for item in self.allowed_image_types.split(",") if item.strip()}

    @property
    def upload_dir_path(self) -> Path:
        """Return the upload directory as an absolute Path (created on demand)."""
        path = Path(self.upload_dir)
        if not path.is_absolute():
            # Anchor relative paths to the backend/ package root.
            path = Path(__file__).resolve().parent.parent.parent / self.upload_dir
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def annotated_dir_path(self) -> Path:
        """Return the annotated-images directory as an absolute Path (created on demand)."""
        path = Path(self.annotated_dir)
        if not path.is_absolute():
            # Anchor relative paths to the backend/ package root.
            path = Path(__file__).resolve().parent.parent.parent / self.annotated_dir
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def model_path_path(self) -> Path:
        """Return the model weights path as an absolute Path (anchored to backend/ root)."""
        path = Path(self.model_path)
        if not path.is_absolute():
            path = Path(__file__).resolve().parent.parent.parent / self.model_path
        return path

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, value: str) -> str:
        """Ensure log level is one of the standard logging levels."""
        normalized = value.upper()
        valid = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if normalized not in valid:
            raise ValueError(f"log_level must be one of {valid}")
        return normalized


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (avoids re-reading .env per import)."""
    return Settings()


settings = get_settings()

