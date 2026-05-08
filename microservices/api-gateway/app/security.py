import os

import jwt
from fastapi import HTTPException, Request, status


def decode(token: str) -> dict:
    secret = os.getenv("JWT_SECRET", "change-me-in-prod")
    alg = os.getenv("JWT_ALG", "HS256")
    return jwt.decode(token, secret, algorithms=[alg])


def require_user(request: Request) -> dict:
    auth = request.headers.get("authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "missing bearer token")
    token = auth.split(" ", 1)[1].strip()
    try:
        return decode(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "token expired")
    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid token")
