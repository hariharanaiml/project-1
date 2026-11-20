# PowerShell script to start the RoadSense AI React/Vite frontend
# ---------------------------------------------------------------
# Assumptions:
# - Node.js / npm are installed and available in PATH.
# - The project root contains the `frontend` folder.
# - The environment file `frontend/.env` already defines VITE_API_BASE_URL.
# - The frontend runs on the default Vite port 5173.

# Move to the frontend directory.
Set-Location "frontend"

# Install npm dependencies if node_modules is missing or empty.
if (-Not (Test-Path -Path "node_modules")) {
    Write-Host "Installing frontend dependencies..."
    npm install
} else {
    # Verify that package-lock or node_modules timestamp is older than package.json – reinstall if outdated.
    $pkgJson = Get-Item "package.json"
    $nodeModules = Get-Item "node_modules" -ErrorAction SilentlyContinue
    if ($nodeModules -and $nodeModules.LastWriteTime -lt $pkgJson.LastWriteTime) {
        Write-Host "Package.json changed – reinstalling dependencies..."
        npm install
    }
}

# Start the Vite development server (defaults to http://localhost:5173).
# The script stays in the foreground; stop with Ctrl+C.
npm run dev
