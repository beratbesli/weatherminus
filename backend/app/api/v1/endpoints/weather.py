from __future__ import annotations

from fastapi import APIRouter, Query, HTTPException
from backend.app.services.weather_service import weather_service
from backend.app.schemas.telemetry import WeatherData

router = APIRouter()


@router.get("", response_model=WeatherData)
async def get_weather_endpoint(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
    units: str = Query("metric", pattern="^(metric|imperial)$"),
    lang: str = Query("en", max_length=5),
) -> WeatherData:
    result = await weather_service.fetch_weather(lat, lon, units=units, lang=lang)
    if not result:
        raise HTTPException(status_code=503, detail="Weather telemetry service unavailable.")
    return result
