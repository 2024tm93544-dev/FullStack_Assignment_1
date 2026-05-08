# vehicle-service

Owns vehicles. Each vehicle belongs to one user.

- Port: `8002`
- Database: `scds_vehicle.vehicles`
- Auth: trusts `X-User-Id` and `X-User-Role` headers from the gateway.
  This service does not verify JWTs.

## Endpoints (all require gateway-set identity headers)

| Method | Path             | Who                         |
|--------|------------------|-----------------------------|
| POST   | /vehicles        | any driver/mechanic/admin   |
| GET    | /vehicles        | any (returns own only)      |
| GET    | /vehicles/{id}   | owner, mechanic, or admin   |
| PUT    | /vehicles/{id}   | owner only                  |
| DELETE | /vehicles/{id}   | owner only                  |

## Local dev

```
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8002
```

Swagger UI: <http://localhost:8002/docs>.
