#!/usr/bin/env bash
# Starts each service in the background. Logs go to ./logs/<service>.log.
# Assumes MongoDB is already running on localhost:27017 and that
# pip install -r requirements.txt has been done in each service folder.

set -e
root="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$root/logs"

start() {
    local name="$1"
    local port="$2"
    (
        cd "$root/$name"
        nohup uvicorn app.main:app --reload --port "$port" \
            >"$root/logs/$name.log" 2>&1 &
        echo "$!" >"$root/logs/$name.pid"
    )
    echo "started $name on $port (pid $(cat "$root/logs/$name.pid"))"
}

start auth-service      8001
start vehicle-service   8002
start diagnosis-service 8003
start api-gateway       8000

echo "Gateway: http://localhost:8000"
