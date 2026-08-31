from __future__ import annotations

import asyncio
from fastapi import APIRouter, Query, HTTPException
from backend.app.core.spatial import calculate_antipode, is_land
from backend.app.services.weather_service import weather_service
from backend.app.services.marine_service import marine_service
from backend.app.schemas.telemetry import (
    FullTelemetryResponse,
    PointTelemetry,
    LocationInfo,
)

router = APIRouter()


def build_commentary(temp: float | None, desc: str, is_antipode: bool = True) -> str:
    prefix = "Antipode: " if is_antipode else "Origin: "
    if temp is None:
        return prefix + "Real-time telemetry gathered."

    d = desc.lower()
    if temp <= 0:
        return prefix + "Freezing icy temperatures over there!"
    if temp < 10:
        return prefix + "Chilly climate, bundle up well."
    if "thunderstorm" in d:
        return prefix + "Thunderstorms roaring actively."
    if "rain" in d or "drizzle" in d:
        return prefix + "Precipitation and rain falling."
    if "snow" in d:
        return prefix + "Snowfall covering the area."
    if temp > 32:
        return prefix + "High temperatures and intense sunshine."
    return prefix + "Pleasant atmospheric conditions."


@router.get("", response_model=FullTelemetryResponse)
async def get_telemetry(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
    origin_name: str | None = Query(None, max_length=100),
    units: str = Query("metric", pattern="^(metric|imperial)$"),
    lang: str = Query("en", max_length=5),
) -> FullTelemetryResponse:
    try:
        anti_lat, anti_lon = calculate_antipode(lat, lon)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

    origin_is_land = is_land(lat, lon)
    anti_is_land = is_land(anti_lat, anti_lon)

    origin_weather_task = weather_service.fetch_weather(lat, lon, units=units, lang=lang)
    anti_weather_task = weather_service.fetch_weather(anti_lat, anti_lon, units=units, lang=lang)
    origin_marine_task = marine_service.fetch_marine_data(lat, lon)
    anti_marine_task = marine_service.fetch_marine_data(anti_lat, anti_lon)

    origin_weather, anti_weather, origin_marine, anti_marine = await asyncio.gather(
        origin_weather_task,
        anti_weather_task,
        origin_marine_task,
        anti_marine_task,
    )

    origin_loc_name = origin_name or ("Terrestrial Zone" if origin_is_land else "Ocean Region")
    anti_loc_name = "Terrestrial Land" if anti_is_land else "Middle of the Ocean"

    origin_desc = origin_weather.description if origin_weather else ""
    origin_temp = origin_weather.temperature if origin_weather else None
    anti_desc = anti_weather.description if anti_weather else ""
    anti_temp = anti_weather.temperature if anti_weather else None

    origin_point = PointTelemetry(
        location=LocationInfo(
            name=origin_loc_name,
            latitude=lat,
            longitude=lon,
            is_land=origin_is_land,
        ),
        weather=origin_weather,
        marine=origin_marine,
        map_url=f"https://www.google.com/maps?q={lat},{lon}",
        commentary=build_commentary(origin_temp, origin_desc, is_antipode=False),
    )

    anti_point = PointTelemetry(
        location=LocationInfo(
            name=anti_loc_name,
            latitude=anti_lat,
            longitude=anti_lon,
            is_land=anti_is_land,
        ),
        weather=anti_weather,
        marine=anti_marine,
        map_url=f"https://www.google.com/maps?q={anti_lat},{anti_lon}",
        commentary=build_commentary(anti_temp, anti_desc, is_antipode=True),
    )

    summary = (
        f"Antipode coordinates ({anti_lat}, {anti_lon}) located in "
        f"{'Land' if anti_is_land else 'Ocean'}."
    )

    return FullTelemetryResponse(
        origin=origin_point,
        antipode=anti_point,
        status_summary=summary,
    )
