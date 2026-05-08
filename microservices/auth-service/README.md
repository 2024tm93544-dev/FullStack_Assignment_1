# auth-service

Owns user accounts and issues JWTs.

- Port: `8001`
- Database: `scds_auth.users`
- Token: HS256, 120 min TTL by default. The same `JWT_SECRET` must be
  set on this service and on the api-gateway.

## Endpoints

| Method | Path        | Auth   | Notes                              |
|--------|-------------|--------|------------------------------------|
| POST   | /register   | public | role defaults to `driver`          |
| POST   | /login      | public | returns `access_token`, user info  |
| GET    | /me         | bearer | echo of the caller's user record   |
| GET    | /health     | public | `{ status, service }`              |

## Local dev

```
python -m venv .venv
. .venv/Scripts/Activate.ps1   # Windows
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8001
```

Swagger UI: <http://localhost:8001/docs>.
