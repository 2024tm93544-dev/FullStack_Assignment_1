from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from .db import vehicles  # noqa: E402
from .routes import router  # noqa: E402

app = FastAPI(title="vehicle-service", version="0.1.0")
app.include_router(router)


@app.on_event("startup")
async def ensure_indexes():
    await vehicles().create_index("owner_id")
    await vehicles().create_index("vin")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "vehicle-service"}
