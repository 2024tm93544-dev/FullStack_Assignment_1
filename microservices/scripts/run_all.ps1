# Starts each service in its own PowerShell window.
# Assumes MongoDB is already running on localhost:27017 and that
# pip install -r requirements.txt has been done in each service folder.

$root = Split-Path -Parent $PSScriptRoot

function Start-Service-Window($name, $port) {
    $path = Join-Path $root $name
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$path'; uvicorn app.main:app --reload --port $port"
    )
}

Start-Service-Window "auth-service"      8001
Start-Service-Window "vehicle-service"   8002
Start-Service-Window "diagnosis-service" 8003
Start-Service-Window "api-gateway"       8000

Write-Host "Started 4 services. Gateway: http://localhost:8000"
