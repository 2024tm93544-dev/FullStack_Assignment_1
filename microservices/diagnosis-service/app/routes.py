from fastapi import APIRouter, Depends, HTTPException, status

from .db import dtc_catalog
from .models import DTCIn, DTCOut
from .security import require_user

router = APIRouter()


def _dtc_out(doc) -> DTCOut:
    return DTCOut(
        code=doc["code"],
        title=doc["title"],
        probable_cause=doc["probable_cause"],
        recommended_action=doc["recommended_action"],
    )


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
