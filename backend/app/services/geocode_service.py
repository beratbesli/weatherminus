from __future__ import annotations

from typing import Any
import httpx
from backend.app.core.config import settings
from backend.app.core.cache import geo_cache
from backend.app.schemas.telemetry import LocationInfo


class GeocodeService:
    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    async def get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=8.0)
        return self._client

    async def search_city(self, query: str, api_key: str | None = None) -> list[dict[str, Any]]:
        clean_query = query.strip()
        if not clean_query:
            return []

        cache_key = f"geo:query:{clean_query.lower()}"
        cached = await geo_cache.get(cache_key)
        if cached:
            return cached

        key = api_key or settings.OPENWEATHER_API_KEY
        if not key or key == "replace_with_your_key":
            return []

        client = await self.get_client()
        try:
            response = await client.get(
                settings.OPENWEATHER_GEO_URL,
                params={"q": clean_query, "limit": 5, "appid": key},
            )
            if response.status_code != 200:
                return []

            data = response.json()
            results = []
            for item in data:
                results.append({
                    "name": item.get("name", ""),
                    "lat": round(float(item.get("lat", 0.0)), 4),
                    "lon": round(float(item.get("lon", 0.0)), 4),
                    "country": item.get("country", ""),
                    "state": item.get("state", ""),
                })

            await geo_cache.set(cache_key, results, ttl=3600)
            return results
        except Exception:
            return []

    async def get_location_by_ip(self) -> LocationInfo | None:
        client = await self.get_client()
        try:
            response = await client.get(
                settings.IP_GEO_URL,
                headers={"User-Agent": "weatherminus-backend/2.0"},
            )
            if response.status_code == 200:
                data = response.json()
                lat = float(data.get("latitude"))
                lon = float(data.get("longitude"))
                city = data.get("city", "Unknown")
                country = data.get("country_name", "")
                return LocationInfo(
                    name=city,
                    country=country,
                    latitude=round(lat, 4),
                    longitude=round(lon, 4),
                    is_land=True,
                )
        except Exception:
            pass
        return None

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()


geocode_service = GeocodeService()
