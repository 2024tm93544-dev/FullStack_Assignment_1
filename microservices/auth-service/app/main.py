from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from .db import users  # noqa: E402
from .routes import router  # noqa: E402

app = FastAPI(title="auth-service", version="0.1.0")
app.include_router(router)


@app.on_event("startup")
async def ensure_indexes():
    await users().create_index("email", unique=True)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "auth-service"}
