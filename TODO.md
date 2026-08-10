# Phase 13 — Real AI Integration (Milestone 2) — IN PROGRESS

## Milestone 2 — Model loading & AI settings (approved plan)

- [x] 1. Verify required AI dependencies (ultralytics, opencv, pillow, numpy) — all present.
- [x] 2. Confirm requirements.txt already lists all AI deps (no missing). Add clarifying comment.
- [x] 3. Create `backend/app/ai/settings.py` (env vars: MODEL_PATH, AI_ENABLED, CONFIDENCE_THRESHOLD, DEVICE).
- [x] 4. Create `backend/app/ai/postprocess.py` (import-safe scaffold).
- [x] 5. Create `backend/app/ai/schemas.py` (import-safe scaffold).
- [x] 6. Create `backend/app/ai/utils.py` (import-safe scaffold).
- [x] 7. Implement `model_manager.py` ModelManager (lazy singleton model loading, no inference).
- [x] 8. Update `preprocessing.py` to be the official preprocessing module (align with settings).
- [x] 9. Add startup warning in `main.py` when MODEL_PATH missing / AI_ENABLED false.
- [x] 10. Update `README.md` (new deps, env vars, expected model location).
- [x] 11. Verify: backend starts, /docs loads, smoke test passes (120/120), no API broken.
