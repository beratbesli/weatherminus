from __future__ import annotations

import asyncio
import time
from typing import Any
from backend.app.core.spatial import quantize_coordinates


class GeoSpatialCache:
    def __init__(self, ttl_seconds: int = 600) -> None:
        self._ttl_seconds = ttl_seconds
        self._store: dict[str, tuple[float, Any]] = {}
        self._lock = asyncio.Lock()

    def _make_spatial_key(self, prefix: str, lat: float, lon: float, extra: str = "") -> str:
        q_lat, q_lon = quantize_coordinates(lat, lon)
        return f"{prefix}:{q_lat}:{q_lon}:{extra}".strip(":")

    async def get(self, key: str) -> Any | None:
        async with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            expiry, value = entry
            if time.time() > expiry:
                del self._store[key]
                return None
            return value

    async def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        effective_ttl = ttl if ttl is not None else self._ttl_seconds
        expiry = time.time() + effective_ttl
        async with self._lock:
            self._store[key] = (expiry, value)

    async def get_spatial(self, prefix: str, lat: float, lon: float, extra: str = "") -> Any | None:
        key = self._make_spatial_key(prefix, lat, lon, extra)
        return await self.get(key)

    async def set_spatial(self, prefix: str, lat: float, lon: float, value: Any, extra: str = "", ttl: int | None = None) -> None:
        key = self._make_spatial_key(prefix, lat, lon, extra)
        await self.set(key, value, ttl)

    async def clear(self) -> None:
        async with self._lock:
            self._store.clear()


geo_cache = GeoSpatialCache(ttl_seconds=600)
