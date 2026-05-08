# api-gateway

The single public entrypoint to the system. Verifies JWTs once and
forwards a stripped-down request to the right downstream service with
two added headers: `X-User-Id` and `X-User-Role`.

- Port: `8000`
- No database.
- Routes:
  - `/auth/*` -> auth-service (public; register and login do not need a token)
  - `/vehicles*` -> vehicle-service (bearer required)
  - `/diagnosis/*` -> diagnosis-service (bearer required)

## Why this shape

Centralising JWT verification means every downstream service can stay
small and trust two simple headers. Only the gateway has to be hardened
against token forgery or expiry, and only the gateway has to know about
auth.

## Local dev

```
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Health: <http://localhost:8000/health>.
