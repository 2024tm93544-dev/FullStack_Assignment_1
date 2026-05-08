from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class VehicleIn(BaseModel):
    vin: str = Field(min_length=5, max_length=32)
    make: str = Field(min_length=1, max_length=40)
    model: str = Field(min_length=1, max_length=40)
    year: int = Field(ge=1950, le=2100)


class VehicleUpdate(BaseModel):
    vin: Optional[str] = Field(default=None, min_length=5, max_length=32)
    make: Optional[str] = Field(default=None, min_length=1, max_length=40)
    model: Optional[str] = Field(default=None, min_length=1, max_length=40)
    year: Optional[int] = Field(default=None, ge=1950, le=2100)


class VehicleOut(BaseModel):
    id: str
    owner_id: str
    vin: str
    make: str
    model: str
    year: int
    created_at: datetime
