# PowerShell script to start the RoadSense AI FastAPI backend
# ---------------------------------------------------------------
# Assumptions:
# - A Python virtual environment exists in the project root under either `.venv` or `venv`.
# - The backend entry point is `backend/app/main.py` exposing the FastAPI app as `app`.
# - Required dependencies are already installed in the virtual environment.
# - `.env` located at `backend/.env` contains all configuration (including YOLO model path).

# Resolve the virtual‑environment path (prefer `.venv` over `venv`).
$venvPath = $null
if (Test-Path -Path ".venv\Scripts\Activate.ps1") {
    $venvPath = ".venv\Scripts\Activate.ps1"
} elseif (Test-Path -Path "venv\Scripts\Activate.ps1") {
    $venvPath = "venv\Scripts\Activate.ps1"
} else {
    Write-Error "Could not find a virtual environment. Ensure a .venv or venv folder exists."
    exit 1
}

# Activate the virtual environment.
& $venvPath
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to activate the virtual environment."
    exit $LASTEXITCODE
}

# Ensure we are in the backend directory so that relative paths in `.env` work.
Set-Location "backend"

# Run migrations / create tables if AUTO_CREATE_TABLES is true (handled by fastapi on startup).
# Start uvicorn.  Use the explicit module path `app.main:app`.
# The script runs uvicorn in the foreground – you can stop it with Ctrl+C.
uvicorn app.main:app --host 127.0.0.1 --port 8000
