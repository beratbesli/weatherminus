from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Query
from backend.app.services.geocode_service import geocode_service
from backend.app.schemas.telemetry import LocationInfo

router = APIRouter()


@router.get("/search")
async def search_city_endpoint(
    q: str = Query(..., min_length=1, max_length=100),
) -> list[dict[str, Any]]:
    return await geocode_service.search_city(q)


@router.get("/auto-ip", response_model=LocationInfo | None)
async def auto_ip_endpoint() -> LocationInfo | None:
    return await geocode_service.get_location_by_ip()
