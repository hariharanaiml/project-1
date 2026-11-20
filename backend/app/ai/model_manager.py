"""
ModelManager — loads and owns the YOLOv8 model instance (Phase 13, Milestone 2).

Responsibilities (Milestone 2):
    - Resolve the configured weights path from :mod:`app.ai.settings`.
    - Select the compute device (cpu / auto / cuda:N).
    - Lazily load ``ultralytics.YOLO`` on first use via ``get_model()``.
    - Expose the model registry (name, version, device, classes, loaded) used
      by ``GET /api/v1/ai/models``.
    - Guarantee thread safety with a single global inference lock.

``get_model()`` handles model loading only; detection is performed by
``YOLODetector`` after the model is loaded.

Graceful-degradation behaviour:
    - If ``AI_ENABLED=false`` or ``MODEL_PATH`` is unset, ``get_model()``
      returns ``None`` and ``is_loaded()`` stays ``False`` — the app runs
      normally while the real ``/ai/predict`` endpoint reports the unavailable
      model rather than returning mock detections.
    - If ``MODEL_PATH`` is set but the file does not exist, a warning is
      logged and ``get_model()`` returns ``None`` instead of crashing.
    - The heavy ``ultralytics`` import is deferred until the first call, so
      the app boots even if the AI dependencies are not installed.
"""

from __future__ import annotations

import threading
from typing import Any, Dict, List, Optional

from app.ai.settings import ai_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class ModelManager:
    """Singleton that lazily loads and holds the YOLOv8 model."""

    _instance: Optional["ModelManager"] = None
    _instance_lock = threading.Lock()

    def __init__(self) -> None:
        self._model: Optional[Any] = None
        self._device: str = "cpu"
        self._loaded: bool = False
        self._load_error: Optional[str] = None
        # Serializes inference calls (Milestone 1 thread safety).
        self._inference_lock = threading.Lock()
        # Guards lazy loading so concurrent first calls don't double-load.
        self._load_lock = threading.Lock()

    # ── Singleton ─────────────────────────────────────────────────────────────

    @classmethod
    def get_instance(cls) -> "ModelManager":
        """Return the process-wide ModelManager singleton (thread-safe)."""
        if cls._instance is None:
            with cls._instance_lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    # ── Public surface (Milestone 2) ──────────────────────────────────────────

    def get_model(self) -> Optional[Any]:
        """
        Return the loaded YOLO model, loading it lazily on first call.

        Returns ``None`` when real inference is disabled (``AI_ENABLED=false``
        or ``MODEL_PATH`` unset) or when the model file cannot be loaded. Logs
        a warning instead of raising in those cases.
        """
        if self._loaded:
            return self._model

        with self._load_lock:
            if self._loaded:
                return self._model

            # Real inference must be enabled and a model path configured.
            if not ai_settings.enabled:
                logger.warning(
                    "Real AI inference disabled (AI_ENABLED=%s, MODEL_PATH=%r). "
                    "Real /ai/predict requests will be unavailable.",
                    ai_settings.ai_enabled,
                    ai_settings.model_path,
                )
                return None

            model_path = ai_settings.model_path_path
            if model_path is None:
                logger.warning("MODEL_PATH is missing — real AI inference disabled.")
                return None

            if not model_path.exists():
                logger.warning(
                    "Model file not found at %s — real AI inference disabled.",
                    model_path,
                )
                self._load_error = f"Model file not found: {model_path}"
                return None

            try:
                # Deferred heavy import so the app boots without ultralytics.
                from ultralytics import YOLO

                self._device = self._resolve_device(ai_settings.device)
                logger.info("Loading YOLO model from %s (device=%s)...", model_path, self._device)
                self._model = YOLO(str(model_path))
                self._model.to(self._device)
                self._loaded = True
                self._load_error = None
                logger.info("YOLO model loaded successfully: %s", self.model_name)
            except Exception as exc:  # noqa: BLE001 - report any load failure gracefully
                self._load_error = str(exc)
                self._model = None
                self._loaded = False
                logger.exception("Failed to load YOLO model from %s", model_path)

        return self._model

    def warmup(self) -> None:
        """Ensure the model is loaded (no inference warmup in this milestone)."""
        self.get_model()

    def is_loaded(self) -> bool:
        """Return True if the model is currently loaded in memory."""
        return self._loaded

    def device(self) -> str:
        """Return the active compute device string (e.g. 'cpu')."""
        return self._device

    @property
    def model_name(self) -> str:
        """Return the weights file stem (e.g. 'yolov8n') or 'unavailable'."""
        path = ai_settings.model_path_path
        return path.stem if path is not None else "unavailable"

    def model_info(self) -> Dict[str, Any]:
        """Return registry info for the loaded model (name, version, classes)."""
        if not self._loaded or self._model is None:
            return {
                "name": self.model_name,
                "loaded": False,
                "device": self._device,
                "error": self._load_error,
            }
        model = self._model
        names = getattr(model, "names", None)
        return {
            "name": self.model_name,
            "loaded": True,
            "device": self._device,
            "classes": list(names.values()) if isinstance(names, dict) else None,
            "error": None,
        }

    def list_models(self) -> List[Dict[str, Any]]:
        """Return the registered model list for GET /api/v1/ai/models."""
        return [{"name": self.model_name, "path": str(ai_settings.model_path_path)}] if ai_settings.enabled else []

    # ── Internals ─────────────────────────────────────────────────────────────

    @staticmethod
    def _resolve_device(preferred: str) -> str:
        """Resolve a preferred device string to a concrete device."""
        preferred = (preferred or "").strip().lower()
        if preferred in ("", "cpu"):
            return "cpu"
        if preferred == "auto":
            try:
                import torch

                return "cuda:0" if torch.cuda.is_available() else "cpu"
            except Exception:  # noqa: BLE001 - torch unavailable → cpu
                return "cpu"
        return preferred


# Module-level singleton for convenient imports.
model_manager = ModelManager()
