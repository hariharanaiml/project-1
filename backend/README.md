# RoadSense AI — Backend

FastAPI backend for the RoadSense AI smart infrastructure intelligence platform.

> **Milestone 4 scope:** image upload (`POST /api/v1/upload` + unversioned
> alias `POST /api/upload`, JPG/JPEG/PNG only, max 10 MB) with UUID filenames
> and full metadata, standalone upload utility functions, a `FileUpload`
> Pydantic schema, upload config env keys, and a **mock AI service** that
> returns sample JSON (no YOLOv8 / torch / OpenCV / model loading). The
> backend remains fully functional without any AI model.

---

## Tech Stack

- **FastAPI** — web framework (API versioning via `/api/v1`)
- **SQLAlchemy 2.0** — ORM (fully PostgreSQL compatible)
- **Alembic** — database migrations
- **Pydantic v2** — request/response schemas & validation
- **python-dotenv / pydantic-settings** — configuration
- **Uvicorn** — ASGI server
- **python-multipart** — multipart form parsing (file uploads)

### AI / Inference dependencies (Phase 13)

| Package | Purpose |
| ------- | ------- |
| `ultralytics` | YOLOv8 model loading + inference (no training) |
| `torch` / `torchvision` | Deep-learning runtime (CPU wheel recommended for Docker; CUDA optional) |
| `opencv-python-headless` | Image decode + annotation drawing (headless `cv2`, no GUI deps) |
| `numpy` | Array ops (also pulled in by torch) |
| `Pillow` | EXIF orientation handling + robust image decode |

> Note: `opencv-python-headless` provides the `cv2` module — the same import as
> the GUI `opencv-python` package but without X11/GUI dependencies. This is the
> correct server-side choice.

### AI Inference Configuration (Phase 13)

Real AI inference is controlled by environment variables (in `.env` or the
process environment). They are read by `app/ai/settings.py`.

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `AI_ENABLED` | `false` | Master switch. Set to `true` to enable real YOLOv8 inference. |
| `MODEL_PATH` | *(empty)* | Path to the YOLOv8 weights file (`.pt`). Relative paths are resolved relative to the `backend/` root, e.g. `./models/yolov8n.pt`. |
| `CONFIDENCE_THRESHOLD` | `0.25` | Minimum confidence (0–1) for a detection to be kept. |
| `DEVICE` | `cpu` | Compute device: `cpu`, `auto`, or `cuda` / `cuda:N`. |

**Expected model location:** the YOLOv8 weights file referenced by `MODEL_PATH`.
The recommended convention is `backend/models/<name>.pt` (e.g.
`backend/models/yolov8n.pt`); set `MODEL_PATH=models/yolov8n.pt` in `.env`.

**Graceful degradation:** if `AI_ENABLED` is `false`, or `MODEL_PATH` is unset,
or the model file does not exist, the backend starts normally and logs a warning
— the **mock** AI pipeline is used so the app remains fully functional. Real
inference is only attempted when `AI_ENABLED=true` **and** `MODEL_PATH` points
to an existing file.

Example `.env` block:

```env
AI_ENABLED=false
MODEL_PATH=models/yolov8n.pt
CONFIDENCE_THRESHOLD=0.25
DEVICE=cpu
```

---

## Folder Structure

```
backend/
├── .env                      # Local environment configuration (not committed)
├── .env.example              # Environment template (committed)
├── .gitignore
├── requirements.txt
├── alembic.ini               # Alembic configuration
├── alembic/                  # Migrations (env.py, versions/)
├── uploads/                  # Stored uploaded images (files git-ignored)
├── scripts/
│   └── smoke_test.py         # Automated end-to-end verification script
├── README.md
└── app/
    ├── main.py               # FastAPI app entry point (CORS, routers, lifespan, static mount)
    ├── api/
    │   ├── deps.py           # get_db, auth placeholder dependencies
    │   └── routes/           # auth, reports, upload, uploads, dashboard, analytics, ai, admin
    ├── core/                 # config, logging, exceptions, responses
    ├── db/                   # session, base, init_db
    ├── models/               # SQLAlchemy ORM models + enums
    ├── schemas/              # Pydantic v2 schemas
    ├── services/             # Business logic (health, report, file_storage, ai — mock)
    ├── repositories/         # Data-access layer (base + report repository)
    └── utils/                # Helpers (report numbers, upload_utils, timestamps, etc.)
```

---

## Setup

### 1. Create a virtual environment

```bash
# Windows (PowerShell / cmd)
cd backend
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

> If you plan to use PostgreSQL, also run: `pip install "psycopg[binary]"`

### 3. Configure environment

```bash
cp .env.example .env        # macOS / Linux
copy .env.example .env      # Windows
```

The default `.env` uses **SQLite** (`sqlite:///./roadsense.db`) so the project
runs immediately with zero external services.

### 4. Run Alembic migrations

```bash
# Apply all migrations (creates roadsense.db + tables automatically)
alembic upgrade head

# Generate a new migration after model changes (advanced)
alembic revision --autogenerate -m "describe change"
```

### 5. Start the FastAPI server

```bash
uvicorn app.main:app --reload --port 8000
```

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/api/health

---

## Switching to PostgreSQL

PostgreSQL is fully supported — **no code changes needed**. The SQLAlchemy
models, schemas, and Alembic migrations are DB-agnostic (no SQLite-specific SQL
is used anywhere).

1. Install the driver: `pip install "psycopg[binary]"`
2. Create a database, then update `.env`:

   ```env
   DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/roadsense
   ```

3. Re-run migrations: `alembic upgrade head`

That's it — the only requirement to switch is changing `DATABASE_URL`.

---

## API Endpoints (Milestone 1)

### System
| Method | Path           | Description                    |
| ------ | -------------- | ------------------------------ |
| GET    | `/`            | API info                       |
| GET    | `/api/health`  | Health check (API + DB)        |

`GET /api/health` returns exactly:

```json
{ "status": "ok", "database": "connected" }
```

### Reports (full CRUD)

Versioned (primary): `/api/v1/reports`
Unversioned alias (Milestone 3, backward-compatible): `/api/reports`

| Method | Path                              | Description                                    |
| ------ | --------------------------------- | ---------------------------------------------- |
| GET    | `/api/v1/reports`                 | List (filters: `status`, `severity`, `road_name`; pagination: `page`, `page_size`) |
| POST   | `/api/v1/reports`                 | Create (auto-generates `RS-YYYY-NNNNNN`)       |
| GET    | `/api/v1/reports/{id}`            | Get by UUID                                    |
| PUT    | `/api/v1/reports/{id}`            | **Full replace** (all mutable fields)          |
| PATCH  | `/api/v1/reports/{id}`            | Partial update                                 |
| PATCH  | `/api/v1/reports/{id}/status`     | Status transition (sets/clears `resolved_at`)  |
| DELETE | `/api/v1/reports/{id}`            | Delete (204 No Content)                        |

The unversioned alias exposes the **same handlers** at `/api/reports` and
`/api/reports/{id}` (list, create, get, PUT, PATCH, status, delete) — no
duplicated business logic.

### Uploads (Milestone 4)

Primary (versioned): `/api/v1/upload`
Unversioned alias: `/api/upload`

| Method | Path                          | Description                                 |
| ------ | ----------------------------- | ------------------------------------------- |
| POST   | `/api/v1/upload`              | Upload image (JPG/JPEG/PNG, max 10 MB)      |
| POST   | `/api/upload`                 | Unversioned alias (same handler)            |
| POST   | `/api/v1/uploads/images`      | Legacy upload (kept for backward compat)    |
| GET    | `/uploads/{filename}`         | Serve uploaded files (StaticFiles)          |

`POST /api/v1/upload` returns `FileUpload` metadata:
`filename` (UUID), `original_filename`, `uploaded_at`, `size`, `mime_type`,
`url`, and `path`. Files are stored in `backend/uploads/`.

### Placeholders (implemented in later milestones)
| Method | Path                                     | Module      |
| ------ | ---------------------------------------- | ----------- |
| POST   | `/api/v1/auth/register`                  | Auth        |
| POST   | `/api/v1/auth/login`                     | Auth        |
| GET    | `/api/v1/dashboard/overview`             | Dashboard   |
| GET    | `/api/v1/dashboard/recent-activity`      | Dashboard   |
| GET    | `/api/v1/analytics/overview`             | Analytics   |
| GET    | `/api/v1/analytics/trends`               | Analytics   |
| GET    | `/api/v1/analytics/distributions`        | Analytics   |
| POST   | `/api/v1/ai/analyze`                     | AI          |
| GET    | `/api/v1/ai/models`                      | AI          |
| GET    | `/api/v1/admin/overview`                 | Admin       |
| GET    | `/api/v1/admin/users`                    | Admin       |
| GET    | `/api/v1/admin/system-health`            | Admin       |

---

## Response Envelopes

All endpoints return a consistent JSON envelope:

```json
{ "success": true, "data": { ... }, "meta": null }
```

Paginated list responses include metadata:

```json
{
  "success": true,
  "data": [ ... ],
  "total": 42,
  "page": 1,
  "page_size": 20
}
```

Errors use a matching envelope:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Report abc-123 not found",
    "status_code": 404,
    "details": null
  }
}
```

---

## Image Upload Flow (Milestone 4)

1. Client sends `multipart/form-data` with a file field named `file` to
   `POST /api/v1/upload` (or the `/api/upload` alias).
2. `validate_image()` checks the MIME type against `ALLOWED_IMAGE_TYPES`
   (`image/jpeg,image/png`) and the size against `MAX_UPLOAD_SIZE` (10 MB).
   Unsupported types / oversized files are rejected with HTTP 422.
3. `generate_unique_filename()` builds a UUID-based filename (e.g.
   `d4f2a1c9….jpg`) and `save_uploaded_file()` writes it to `backend/uploads/`.
4. The response returns full `FileUpload` metadata: `filename`,
   `original_filename`, `uploaded_at`, `size`, `mime_type`, `url`, `path`.

## Mock AI Service (Milestone 4)

`app/services/ai_service.py` exposes the future YOLOv8 pipeline surface as a
pure mock so the backend works end-to-end with zero AI dependencies:

- `AIService.analyze_image(image_path, report_id)` — full mock analysis payload
- `AIService.detect_damage(image_path)` — mock detections (bboxes + labels)
- `AIService.estimate_severity(detections)` — mock severity summary
- `AIService.generate_repair_recommendation(severity)` — mock repair
  recommendation (urgency, action, cost estimate)

`POST /api/v1/ai/analyze` returns this sample JSON (no model, no inference),
including the `repair_recommendation` block:

---

## Smoke Test

An automated verification script exercises the full API surface:

```bash
python scripts/smoke_test.py
```

It verifies: health check → report CRUD (create/list/get/patch/PUT/status/
delete) → image upload (`/api/v1/upload` + `/api/upload` alias) → metadata
response → invalid-type rejection → static file serving → unversioned report
aliases → request validation (422) → mock AI service JSON.

---

## Roadmap

- **Milestone 5:** YOLOv8 damage-detection pipeline + AI analysis + repair
  recommendations (replacing the mock AI service behind the same interface).
- **Milestone 6:** Frontend integration (Axios) — connect the React app to
  these endpoints.

