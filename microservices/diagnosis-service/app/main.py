from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from .db import dtc_catalog  # noqa: E402
from .routes import router  # noqa: E402

app = FastAPI(title="diagnosis-service", version="0.1.0")
app.include_router(router)


@app.on_event("startup")
async def ensure_indexes():
    await dtc_catalog().create_index("code", unique=True)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "diagnosis-service"}
