from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional


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
    before_photo: Optional[str] = None


class RepairStatus(str, Enum):
    PENDING = "pending"
    MECHANIC_ASSIGNED = "mechanic_assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class ReportUpdate(BaseModel):
    status: Optional[RepairStatus] = None
    mechanic_id: Optional[str] = None
    before_photo: Optional[str] = None  
    after_photo: Optional[str] = None   
    mechanic_notes: Optional[str] = None


class ReportOut(BaseModel):
    id: str
    vehicle_id: str
    owner_id: str
    dtc: Optional[str] = None
    symptoms: Optional[str] = None
    probable_cause: str
    recommended_action: str
    status: RepairStatus = RepairStatus.PENDING
    mechanic_id: Optional[str] = None
    before_photo: Optional[str] = None
    after_photo: Optional[str] = None
    mechanic_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
