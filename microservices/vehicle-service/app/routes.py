from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status

from .db import vehicles
from .models import VehicleIn, VehicleOut, VehicleUpdate
from .security import require_user

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


def _to_out(doc) -> VehicleOut:
    return VehicleOut(
        id=str(doc["_id"]),
        owner_id=doc["owner_id"],
        vin=doc["vin"],
        make=doc["make"],
        model=doc["model"],
        year=doc["year"],
        created_at=doc["created_at"],
    )


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except InvalidId:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "invalid id")


def _can_read(doc, user) -> bool:
    # Owner always; mechanics and admins can read any vehicle.
    return (
        doc["owner_id"] == user["id"]
        or user["role"] in ("mechanic", "admin")
    )


@router.post("", response_model=VehicleOut, status_code=201)
async def create(body: VehicleIn, user=Depends(require_user)):
    doc = body.model_dump()
    doc["owner_id"] = user["id"]
    doc["created_at"] = datetime.now(timezone.utc)
    res = await vehicles().insert_one(doc)
    doc["_id"] = res.inserted_id
    return _to_out(doc)


@router.get("", response_model=list[VehicleOut])
async def list_mine(user=Depends(require_user)):
    cur = vehicles().find({"owner_id": user["id"]}).sort("created_at", -1)
    return [_to_out(d) async for d in cur]


@router.get("/{vehicle_id}", response_model=VehicleOut)
async def get_one(vehicle_id: str, user=Depends(require_user)):
    doc = await vehicles().find_one({"_id": _oid(vehicle_id)})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "vehicle not found")
    if not _can_read(doc, user):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not your vehicle")
    return _to_out(doc)


@router.put("/{vehicle_id}", response_model=VehicleOut)
async def update(vehicle_id: str, body: VehicleUpdate, user=Depends(require_user)):
    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    if not patch:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "nothing to update")
    doc = await vehicles().find_one({"_id": _oid(vehicle_id)})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "vehicle not found")
    # Writes are owner-only even for mechanics.
    if doc["owner_id"] != user["id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not your vehicle")
    await vehicles().update_one({"_id": doc["_id"]}, {"$set": patch})
    doc.update(patch)
    return _to_out(doc)


@router.delete("/{vehicle_id}", status_code=204)
async def delete(vehicle_id: str, user=Depends(require_user)):
    doc = await vehicles().find_one({"_id": _oid(vehicle_id)})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "vehicle not found")
    if doc["owner_id"] != user["id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not your vehicle")
    await vehicles().delete_one({"_id": doc["_id"]})
    return None
