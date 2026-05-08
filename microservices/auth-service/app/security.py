import os
from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return _pwd.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd.verify(plain, hashed)


def make_token(user_id: str, role: str, name: str) -> str:
    secret = os.getenv("JWT_SECRET", "change-me-in-prod")
    alg = os.getenv("JWT_ALG", "HS256")
    ttl = int(os.getenv("JWT_TTL_MIN", "120"))
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "role": role,
        "name": name,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=ttl)).timestamp()),
    }
    return jwt.encode(payload, secret, algorithm=alg)


def decode_token(token: str) -> dict:
    secret = os.getenv("JWT_SECRET", "change-me-in-prod")
    alg = os.getenv("JWT_ALG", "HS256")
    return jwt.decode(token, secret, algorithms=[alg])
