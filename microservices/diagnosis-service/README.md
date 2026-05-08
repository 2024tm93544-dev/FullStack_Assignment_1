# diagnosis-service

Owns the DTC catalog and per-vehicle diagnostic reports. Hosts the
small rule engine that turns a code or symptoms into a probable cause
and a recommended action.

- Port: `8003`
- Database: `scds_diagnosis.dtc_catalog`, `scds_diagnosis.reports`
- Auth: trusts `X-User-Id` and `X-User-Role` headers from the gateway.

## Endpoints

| Method | Path                              | Who                       |
|--------|-----------------------------------|---------------------------|
| GET    | /dtc                              | any logged-in user        |
| GET    | /dtc/{code}                       | any logged-in user        |
| POST   | /dtc                              | admin                     |
| PUT    | /dtc/{code}                       | admin                     |
| DELETE | /dtc/{code}                       | admin                     |
| POST   | /reports                          | any (owner is the caller) |
| GET    | /reports?vehicle_id=...           | driver: own; mechanic/admin: any |

## Local dev

```
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8003
# seed
python ../scripts/seed_dtc.py
```

Swagger UI: <http://localhost:8003/docs>.
