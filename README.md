# Smart Car Diagnosis System

A small full-stack web app where a vehicle owner can register a car, submit
either an OBD-II trouble code or a description of symptoms, and get back a
probable cause and a recommended action. A history of reports is kept for
each vehicle.

The backend is split into independent microservices that sit behind a single
API gateway. The frontend is a small React single-page app that only ever
talks to the gateway.

## Tech

- Python 3.11, FastAPI, Motor (async MongoDB driver), PyJWT, passlib[bcrypt], httpx
- MongoDB Community on `localhost:27017`
- React 18, Vite, TypeScript, axios, react-router-dom

## Layout

```
client/           React frontend (port 5173)
microservices/
  api-gateway/    single public entrypoint (port 8000)
```

This is the **scaffold** commit. Only the gateway and the React shell exist
at this point. The shell pings `/health` on the gateway so the integration
between the two halves is verified end-to-end before any feature lands.

See [INSTRUCTIONS.md](../../INSTRUCTIONS.md) at the repo root for full setup
and run instructions.
