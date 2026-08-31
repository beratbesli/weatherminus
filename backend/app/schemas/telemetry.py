from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)


class LocationInfo(BaseModel):
    name: str
    country: str = ""
    state: str = ""
    latitude: float
    longitude: float
    is_land: bool = True


class WeatherData(BaseModel):
    temperature: float
    feels_like: float
    temp_min: float | None = None
    temp_max: float | None = None
    humidity: int
    pressure: int
    wind_speed: float
    wind_deg: int | None = None
    description: str
    icon: str
    emoji: str
    units: str = "metric"


class MarineData(BaseModel):
    available: bool = False
    wave_height_m: float | None = None
    wave_direction_deg: float | None = None
    wave_period_s: float | None = None
    sea_surface_temp_c: float | None = None
    ocean_depth_m: int | None = None
    condition_summary: str = ""


class PointTelemetry(BaseModel):
    location: LocationInfo
    weather: WeatherData | None = None
    marine: MarineData | None = None
    map_url: str
    commentary: str


class FullTelemetryResponse(BaseModel):
    origin: PointTelemetry
    antipode: PointTelemetry
    antipode_distance_km: float = 20015.0
    status_summary: str
