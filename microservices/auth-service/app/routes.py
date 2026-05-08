from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, Header, HTTPException, status

from .db import users
from .models import LoginRequest, RegisterRequest, TokenResponse, UserOut
from .security import decode_token, hash_password, make_token, verify_password

router = APIRouter()


def _to_user_out(doc) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        email=doc["email"],
        name=doc["name"],
        role=doc["role"],
        created_at=doc.get("created_at"),
    )


async def current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    try:
        return decode_token(token)
    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid token")


@router.post("/register", response_model=UserOut, status_code=201)
async def register(body: RegisterRequest):
    existing = await users().find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "email already registered")
    doc = {
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "name": body.name,
        "role": body.role,
        "created_at": datetime.now(timezone.utc),
    }
    res = await users().insert_one(doc)
    doc["_id"] = res.inserted_id
    return _to_user_out(doc)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    doc = await users().find_one({"email": body.email.lower()})
    if not doc or not verify_password(body.password, doc["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid credentials")
    uid = str(doc["_id"])
    token = make_token(uid, doc["role"], doc["name"])
    return TokenResponse(access_token=token, user_id=uid, role=doc["role"], name=doc["name"])


@router.get("/me", response_model=UserOut)
async def me(claims: dict = Depends(current_user)):
    try:
        oid = ObjectId(claims["sub"])
    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid subject")
    doc = await users().find_one({"_id": oid})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "user not found")
    return _to_user_out(doc)
