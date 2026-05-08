import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from .proxy import forward  # noqa: E402
from .security import require_user  # noqa: E402

app = FastAPI(title="api-gateway", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CLIENT_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "api-gateway"}


@app.api_route("/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def auth_route(path: str, request: Request):
    return await forward(request, "auth", path)


def _identity_headers(claims: dict) -> dict[str, str]:
    return {
        "X-User-Id": str(claims.get("sub", "")),
        "X-User-Role": str(claims.get("role", "")),
    }


@app.api_route("/vehicles{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def vehicles_route(path: str, request: Request):
    claims = require_user(request)
    return await forward(request, "vehicles", "/vehicles" + path, _identity_headers(claims))
