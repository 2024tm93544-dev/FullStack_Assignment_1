from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class DTCIn(BaseModel):
    code: str = Field(min_length=3, max_length=10)
    title: str = Field(min_length=1, max_length=120)
    probable_cause: str = Field(min_length=1, max_length=500)
    recommended_action: str = Field(min_length=1, max_length=500)


class DTCOut(BaseModel):
    code: str
    title: str
    probable_cause: str
    recommended_action: str


class ReportIn(BaseModel):
    vehicle_id: str = Field(min_length=1)
    dtc: Optional[str] = Field(default=None, max_length=10)
    symptoms: Optional[str] = Field(default=None, max_length=500)


class ReportOut(BaseModel):
    id: str
    vehicle_id: str
    owner_id: str
    dtc: Optional[str] = None
    symptoms: Optional[str] = None
    probable_cause: str
    recommended_action: str
    created_at: datetime
