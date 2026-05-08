"""Seed the DTC catalog. Idempotent: upserts each entry.

Run from the repo root:
    python microservices/scripts/seed_dtc.py
"""

import asyncio
import os
import sys
from pathlib import Path

# Make the diagnosis-service package importable so we reuse the seed list.
HERE = Path(__file__).resolve().parent
SVC = HERE.parent / "diagnosis-service"
sys.path.insert(0, str(SVC))

from dotenv import load_dotenv  # noqa: E402
from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402

load_dotenv(SVC / ".env")
load_dotenv(SVC / ".env.example")  # fallback so something is always set

from app.rules import DTC_SEED  # noqa: E402


async def main():
    url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    name = os.getenv("MONGO_DB", "scds_diagnosis")
    client = AsyncIOMotorClient(url)
    coll = client[name]["dtc_catalog"]
    await coll.create_index("code", unique=True)
    inserted = 0
    updated = 0
    for entry in DTC_SEED:
        res = await coll.update_one(
            {"code": entry["code"]},
            {"$set": entry},
            upsert=True,
        )
        if res.upserted_id is not None:
            inserted += 1
        elif res.modified_count:
            updated += 1
    print(f"seeded dtc_catalog: inserted={inserted} updated={updated} total={len(DTC_SEED)}")


if __name__ == "__main__":
    asyncio.run(main())
