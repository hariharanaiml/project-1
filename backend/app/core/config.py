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
    database_url: str = "sqlite:///./roadsense.db"
    auto_create_tables: bool = False

    # ── Security ───────────────────────────────────────────────────────────────
    secret_key: str = "dev-secret-key-change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # ── CORS ───────────────────────────────────────────────────────────────────
    cors_origins: str = (
        "http://localhost:3000,http://localhost:3001,http://localhost:5173,"
        "http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:5173"
    )

    # ── Logging ────────────────────────────────────────────────────────────────
    log_level: str = "INFO"

    # ── Uploads ────────────────────────────────────────────────────────────────
    upload_dir: str = "./uploads"
    upload_url_prefix: str = "/uploads"
    max_upload_size_mb: int = Field(
        default=10,
        validation_alias=AliasChoices("MAX_UPLOAD_SIZE", "MAX_UPLOAD_SIZE_MB"),
    )
    allowed_image_types: str = "image/jpeg,image/png,image/webp"

    # ── AI inference ──────────────────────────────────────────────────────────
    ai_inference_enabled: bool = False
    model_path: str = "./models/yolov8n.pt"
    model_name: str = "yolov8n"
    device: str = "auto"
    conf_threshold: float = 0.25
    iou_threshold: float = 0.45
    image_size: int = 640
    preload_model: bool = True
    annotated_dir: str = "./annotated"
    annotated_url_prefix: str = "/annotated"

    # ── Derived properties ─────────────────────────────────────────────────────
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
        """Alias for `max_upload_size_bytes`."""
        return self.max_upload_size_bytes

    @property
    def allowed_image_types_set(self) -> set:
        """Return the allowed image MIME types as a set."""
        configured = {
            item.strip().lower()
            for item in self.allowed_image_types.split(",")
            if item.strip()
        }
        # These are the image formats supported by the upload and inference
        # pipelines; include them when older .env files omit WebP.
        return configured | {"image/jpeg", "image/png", "image/webp"}

    @property
    def MODEL_PATH(self) -> str:
        """Alias for `model_path` backward compatibility."""
        return self.model_path

    @property
    def AI_ENABLED(self) -> bool:
        """Alias for `ai_inference_enabled` backward compatibility."""
        return self.ai_inference_enabled

    @property
    def upload_dir_path(self) -> Path:
        """Return the upload directory as an absolute Path."""
        path = Path(self.upload_dir)
        if not path.is_absolute():
            path = Path(__file__).resolve().parent.parent.parent / self.upload_dir
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def annotated_dir_path(self) -> Path:
        """Return the annotated-images directory as an absolute Path."""
        path = Path(self.annotated_dir)
        if not path.is_absolute():
            path = Path(__file__).resolve().parent.parent.parent / self.annotated_dir
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def model_path_path(self) -> Path:
        """Return the model weights path as an absolute Path."""
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
    """Return a cached Settings instance."""
    return Settings()


settings = get_settings()
