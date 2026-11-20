"""
Configurable AI settings module (Phase 13 — Milestone 2).

Reads the real-AI inference configuration from environment variables / `.env`
so the pipeline can be toggled without code changes. This module is deliberately
**import-safe** — it only depends on ``pydantic-settings`` (already a core
dependency) and does NOT import ``ultralytics`` / ``torch`` / ``cv2``, so the
application always boots even when the heavy AI dependencies or a model file are
unavailable.

Environment variables
---------------------
``MODEL_PATH`` (optional, default ``""``)
    Absolute or backend-relative path to the YOLOv8 weights file (``.pt``).
    When unset, real inference stays disabled and ``/ai/predict`` reports that
    the model is unavailable.

``AI_ENABLED`` (optional, default ``"false"``)
    Master switch. Must be ``"true"`` (case-insensitive) for real inference to
    be allowed. When ``false`` or unset, ``/ai/predict`` is unavailable.

``CONFIDENCE_THRESHOLD`` (optional, default ``"0.25"``)
    Minimum confidence (0–1) for a detection to be kept.

``DEVICE`` (optional, default ``"cpu"``)
    Compute device: ``"cpu"``, ``"auto"``, or ``"cuda"`` / ``"cuda:0"``.

The effective behaviour is exposed via :attr:`AISettings.enabled` — which is
``True`` only when ``AI_ENABLED=true`` **and** ``MODEL_PATH`` is non-empty.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AISettings(BaseSettings):
    """AI inference settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Path to the YOLOv8 weights file (e.g. ./models/yolov8n.pt).
    # Empty by default → real inference disabled until explicitly configured.
    model_path: str = Field(default="", description="Path to the YOLOv8 weights file (.pt).")
    # Master switch for real inference (env: AI_ENABLED).
    ai_enabled: bool = Field(default=False, description="Enable real YOLOv8 inference.")
    # Minimum confidence for a detection to be kept (0–1).
    confidence_threshold: float = Field(default=0.25, ge=0.0, le=1.0)
    # Compute device: "cpu", "auto", or "cuda"/"cuda:N".
    device: str = Field(default="cpu", description="Compute device for inference.")
    # Optional LLM feature gate (env: LLM_ENABLED).
    # When False, the YOLO pipeline runs completely independently of any LLM
    # provider (Vercel AI Gateway, LiteLLM, OpenAI, etc.).
    llm_enabled: bool = Field(default=False, description="Enable optional LLM recommendations.")

    # ── Derived helpers ──────────────────────────────────────────────────────

    @property
    def enabled(self) -> bool:
        """True only when real inference is switched on AND a model path exists."""
        return self.ai_enabled and bool(self.model_path.strip())

    @property
    def model_path_path(self) -> Path | None:
        """
        Resolve the model path to an absolute Path anchored to the backend/ root.

        Returns ``None`` when no model path is configured.
        """
        raw = self.model_path.strip()
        if not raw:
            return None
        path = Path(raw)
        if not path.is_absolute():
            # Anchor relative paths to the backend/ package root.
            path = Path(__file__).resolve().parent.parent.parent / raw
        return path

    @property
    def model_path_exists(self) -> bool:
        """True when a model path is configured and the file exists on disk."""
        resolved = self.model_path_path
        return resolved is not None and resolved.is_file()


@lru_cache
def get_ai_settings() -> AISettings:
    """Return a cached AISettings instance (avoids re-reading .env per import)."""
    return AISettings()


# Module-level singleton for convenient imports.
ai_settings = get_ai_settings()
