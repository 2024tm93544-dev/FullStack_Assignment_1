from fastapi import Header, HTTPException, status


def require_user(
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
    x_user_role: str | None = Header(default=None, alias="X-User-Role"),
) -> dict:
    if not x_user_id or not x_user_role:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "missing identity headers")
    return {"id": x_user_id, "role": x_user_role}
