from fastapi import Header, HTTPException, status
from typing import Optional

def require_user(
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(default=None, alias="X-User-Role"),
) -> dict:
    if not x_user_id or not x_user_role:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "missing identity headers")
    return {"id": x_user_id, "role": x_user_role}
