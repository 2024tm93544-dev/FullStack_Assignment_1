from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field

Role = Literal["driver", "mechanic", "admin"]


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=80)
    role: Role = "driver"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: Role
    name: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: Role
    created_at: Optional[datetime] = None
