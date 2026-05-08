from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status

from .db import dtc_catalog, reports
from .models import DTCIn, DTCOut, ReportIn, ReportOut
from .rules import diagnose
from .security import require_user

router = APIRouter()


def _dtc_out(doc) -> DTCOut:
    return DTCOut(
        code=doc["code"],
        title=doc["title"],
        probable_cause=doc["probable_cause"],
        recommended_action=doc["recommended_action"],
    )


def _report_out(doc) -> ReportOut:
    return ReportOut(
        id=str(doc["_id"]),
        vehicle_id=doc["vehicle_id"],
        owner_id=doc["owner_id"],
        dtc=doc.get("dtc"),
        symptoms=doc.get("symptoms"),
        probable_cause=doc["probable_cause"],
        recommended_action=doc["recommended_action"],
        created_at=doc["created_at"],
    )


# ------------ DTC catalog (admin manages, anyone can read) ------------

@router.get("/dtc", response_model=list[DTCOut])
async def list_dtc(user=Depends(require_user)):
    cur = dtc_catalog().find().sort("code", 1)
    return [_dtc_out(d) async for d in cur]


@router.get("/dtc/{code}", response_model=DTCOut)
async def get_dtc(code: str, user=Depends(require_user)):
    doc = await dtc_catalog().find_one({"code": code.upper()})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "code not found")
    return _dtc_out(doc)


@router.post("/dtc", response_model=DTCOut, status_code=201)
async def create_dtc(body: DTCIn, user=Depends(require_user)):
    if user["role"] != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "admin only")
    doc = body.model_dump()
    doc["code"] = doc["code"].upper()
    existing = await dtc_catalog().find_one({"code": doc["code"]})
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "code already exists")
    await dtc_catalog().insert_one(doc)
    return _dtc_out(doc)


@router.put("/dtc/{code}", response_model=DTCOut)
async def update_dtc(code: str, body: DTCIn, user=Depends(require_user)):
    if user["role"] != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "admin only")
    upd = body.model_dump()
    upd["code"] = upd["code"].upper()
    res = await dtc_catalog().update_one({"code": code.upper()}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "code not found")
    return _dtc_out(upd)


@router.delete("/dtc/{code}", status_code=204)
async def delete_dtc(code: str, user=Depends(require_user)):
    if user["role"] != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "admin only")
    res = await dtc_catalog().delete_one({"code": code.upper()})
    if res.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "code not found")
    return None


# ------------ Reports ------------

@router.post("/reports", response_model=ReportOut, status_code=201)
async def submit_report(body: ReportIn, user=Depends(require_user)):
    if not body.dtc and not body.symptoms:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "provide dtc or symptoms")
    cause, action = await diagnose(dtc_catalog(), body.dtc, body.symptoms)
    doc = {
        "vehicle_id": body.vehicle_id,
        "owner_id": user["id"],
        "dtc": body.dtc.upper().strip() if body.dtc else None,
        "symptoms": body.symptoms,
        "probable_cause": cause,
        "recommended_action": action,
        "created_at": datetime.now(timezone.utc),
    }
    res = await reports().insert_one(doc)
    doc["_id"] = res.inserted_id
    return _report_out(doc)


@router.get("/reports", response_model=list[ReportOut])
async def list_reports(
    vehicle_id: str = Query(..., min_length=1),
    user=Depends(require_user),
):
    # Drivers see their own; mechanics and admins can read any vehicle.
    query: dict = {"vehicle_id": vehicle_id}
    if user["role"] == "driver":
        query["owner_id"] = user["id"]
    cur = reports().find(query).sort("created_at", -1)
    return [_report_out(d) async for d in cur]
