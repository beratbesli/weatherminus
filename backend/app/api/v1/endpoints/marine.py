from __future__ import annotations

from fastapi import APIRouter, Query
from backend.app.services.marine_service import marine_service
from backend.app.schemas.telemetry import MarineData

router = APIRouter()


@router.get("", response_model=MarineData)
async def get_marine_endpoint(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
) -> MarineData:
    return await marine_service.fetch_marine_data(lat, lon)
