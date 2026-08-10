"""
RoadSense AI inference package (Phase 13 — Real YOLOv8 integration).

Pure inference layer, deliberately decoupled from FastAPI/DB concerns so it can
be unit-tested and reused independently of the web layer.

Modules:
    settings        — configurable AI settings from env vars (MODEL_PATH, AI_ENABLED, ...)
    model_manager   — lazy singleton model loader + device selection + warmup
    preprocessing    — image path resolution, EXIF orientation, decode validation
    detector         — YOLOv8 predict → normalized detections
    postprocess      — confidence filtering, box normalization, class-id mapping
    schemas          — inference data contracts (Detection, InferenceResult)
    utils            — shared helpers (box math, device selection)
    annotator        — draw detection boxes on the original image, save annotated JPG
    severity         — detection → severity level, risk score, damage score
    cost_estimator   — (damage_type, severity) → cost breakdown + duration + equipment
    recommender      — severity + cost → repair method, priority, summary, notes
    pipeline         — RoadDamagePipeline.run() orchestrating the full flow

The pipeline is consumed by :mod:`app.services.ai_service` (facade). The mock
pipeline remains the default unless ``AI_ENABLED=true`` and ``MODEL_PATH`` is set.
"""

# Imported lazily inside services/agency so the app boots without torch/ultralytics
# installed. This package itself must remain import-safe with no heavy deps.

