from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from .db import dtc_catalog, reports  # noqa: E402
from .routes import router  # noqa: E402

app = FastAPI(title="diagnosis-service", version="0.2.0")
app.include_router(router)


@app.on_event("startup")
async def ensure_indexes():
    await dtc_catalog().create_index("code", unique=True)
    await reports().create_index("vehicle_id")
    await reports().create_index("owner_id")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "diagnosis-service"}
