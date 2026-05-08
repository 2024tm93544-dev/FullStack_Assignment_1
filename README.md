# Smart Car Diagnosis System

A full-stack web application where a vehicle owner registers a car, submits either an OBD-II trouble code (e.g. `P0301`) or a description of symptoms, and gets back a probable cause and a recommended action. A history of reports is kept per vehicle.

---

## Architecture

The React client talks to a single **API Gateway** (port 8000), which is the only publicly exposed endpoint. The gateway verifies the JWT and forwards the user identity to three internal services:

- **Auth Service** (8001) — handles registration and login
- **Vehicle Service** (8002) — manages vehicle records
- **Diagnosis Service** (8003) — runs the rule engine and stores reports

Each service has its own MongoDB database (`scds_auth`, `scds_vehicle`, `scds_diagnosis`) all running on the same MongoDB instance at port 27017.

Each service owns its own data and only the gateway is meant to be publicly exposed. The downstream services trust two identity headers the gateway sets after JWT verification.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.11, FastAPI, Motor, PyJWT, passlib[bcrypt], httpx |
| **Database** | MongoDB Community on `localhost:27017` |
| **Frontend** | React 18, Vite, TypeScript, axios, react-router-dom |

---

## Repository Layout

```
client/                  React frontend (port 5173)
microservices/
  api-gateway/           public entrypoint (8000)
  auth-service/          users, JWT (8001)
  vehicle-service/       vehicle CRUD (8002)
  diagnosis-service/     DTC catalog, reports, rule engine (8003)
  scripts/               run_all.ps1, run_all.sh, seed_dtc.py
INSTRUCTIONS.md          install / run guide
documentation.md         assignment write-up
workingsteps.md          commit-by-commit walkthrough
```

---

