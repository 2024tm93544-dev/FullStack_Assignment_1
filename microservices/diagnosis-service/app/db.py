import os
from motor.motor_asyncio import AsyncIOMotorClient

_client: AsyncIOMotorClient | None = None


def get_db():
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
    return _client[os.getenv("MONGO_DB", "scds_diagnosis")]


def dtc_catalog():
    return get_db()["dtc_catalog"]


def reports():
    return get_db()["reports"]
