import os

import httpx
from fastapi import HTTPException, Request, Response, status

# Hop-by-hop headers we should not forward upstream or back to the client.
_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
}


def _service_url(prefix: str) -> str:
    mapping = {
        "auth": os.getenv("AUTH_SERVICE_URL", "http://localhost:8001"),
        "vehicles": os.getenv("VEHICLE_SERVICE_URL", "http://localhost:8002"),
        "diagnosis": os.getenv("DIAGNOSIS_SERVICE_URL", "http://localhost:8003"),
    }
    if prefix not in mapping:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"unknown route prefix: {prefix}")
    return mapping[prefix]


async def forward(
    request: Request,
    prefix: str,
    downstream_path: str,
    extra_headers: dict[str, str] | None = None,
) -> Response:
    url = _service_url(prefix).rstrip("/") + "/" + downstream_path.lstrip("/")
    headers = {
        k: v for k, v in request.headers.items()
        if k.lower() not in _HOP_HEADERS
    }
    if extra_headers:
        headers.update(extra_headers)
    body = await request.body()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.request(
                request.method,
                url,
                content=body,
                headers=headers,
                params=request.query_params,
            )
    except httpx.ConnectError:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, f"{prefix} service unavailable")
    except httpx.TimeoutException:
        raise HTTPException(status.HTTP_504_GATEWAY_TIMEOUT, f"{prefix} service timed out")

    response_headers = {
        k: v for k, v in r.headers.items()
        if k.lower() not in _HOP_HEADERS
    }
    return Response(content=r.content, status_code=r.status_code, headers=response_headers)
