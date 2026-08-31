from __future__ import annotations

from fastapi import APIRouter
from backend.app.api.v1.endpoints import telemetry, antipode, weather, marine, geocode

api_router = APIRouter()
api_router.include_router(telemetry.router, prefix="/telemetry", tags=["Telemetry"])
api_router.include_router(antipode.router, prefix="/antipode", tags=["Antipode"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather"])
api_router.include_router(marine.router, prefix="/marine", tags=["Marine"])
api_router.include_router(geocode.router, prefix="/geocode", tags=["Geocode"])
