from __future__ import annotations

import httpx
from backend.app.core.config import settings
from backend.app.core.cache import geo_cache
from backend.app.core.spatial import is_land, estimate_ocean_depth_meters
from backend.app.schemas.telemetry import MarineData


class MarineService:
    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    async def get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=8.0)
        return self._client

    async def fetch_marine_data(self, latitude: float, longitude: float) -> MarineData:
        land_point = is_land(latitude, longitude)
        depth = estimate_ocean_depth_meters(latitude, longitude)

        if land_point:
            return MarineData(
                available=False,
                ocean_depth_m=0,
                condition_summary="Terrestrial land point (no open sea).",
            )

        cached = await geo_cache.get_spatial("marine", latitude, longitude)
        if cached:
            return MarineData(**cached)

        client = await self.get_client()
        try:
            response = await client.get(
                settings.OPEN_METEO_MARINE_URL,
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "current": "wave_height,wave_direction,wave_period,wind_wave_height,ocean_current_velocity,ocean_current_direction",
                    "daily": "wave_height_max",
                },
            )
            if response.status_code == 200:
                data = response.json()
                current = data.get("current", {})
                wave_h = current.get("wave_height")
                wave_dir = current.get("wave_direction")
                wave_p = current.get("wave_period")

                if wave_h is None:
                    summary = "Calm coastal waters."
                elif wave_h > 4.0:
                    summary = "Rough oceanic swell and heavy waves."
                elif wave_h > 2.0:
                    summary = "Moderate ocean waves and active surface."
                else:
                    summary = "Mild ocean surface conditions."

                marine_obj = MarineData(
                    available=True,
                    wave_height_m=wave_h,
                    wave_direction_deg=wave_dir,
                    wave_period_s=wave_p,
                    sea_surface_temp_c=None,
                    ocean_depth_m=depth,
                    condition_summary=summary,
                )

                await geo_cache.set_spatial(
                    "marine",
                    latitude,
                    longitude,
                    marine_obj.model_dump(),
                    ttl=settings.CACHE_TTL_SECONDS,
                )
                return marine_obj
        except Exception:
            pass

        return MarineData(
            available=True,
            ocean_depth_m=depth,
            condition_summary="Open ocean waters (live telemetry unavailable).",
        )

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()


marine_service = MarineService()
