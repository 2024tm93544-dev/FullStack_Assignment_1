import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from .proxy import forward  # noqa: E402

app = FastAPI(title="api-gateway", version="0.2.0")

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


# Auth routes are public: register and login do not require a token.
@app.api_route("/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def auth_route(path: str, request: Request):
    return await forward(request, "auth", path)
