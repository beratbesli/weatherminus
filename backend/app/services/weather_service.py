from __future__ import annotations

from typing import Any
import httpx
from backend.app.core.config import settings
from backend.app.core.cache import geo_cache
from backend.app.schemas.telemetry import WeatherData


def resolve_weather_emoji(icon_id: str, description: str) -> str:
    desc = description.lower()
    if "thunderstorm" in desc or icon_id.startswith("11"):
        return "⛈️"
    if "drizzle" in desc or icon_id.startswith("09"):
        return "🌦️"
    if "rain" in desc or icon_id.startswith("10"):
        return "🌧️"
    if "snow" in desc or icon_id.startswith("13"):
        return "❄️"
    if "clear" in desc or icon_id.startswith("01"):
        return "☀️"
    if "few clouds" in desc or icon_id.startswith("02"):
        return "🌤️"
    if "cloud" in desc or icon_id in ("03", "04"):
        return "☁️"
    if any(term in desc for term in ["mist", "smoke", "haze", "fog", "sand"]):
        return "🌫️"
    return "🌡️"


class WeatherService:
    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    async def get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=8.0)
        return self._client

    async def fetch_weather(
        self,
        latitude: float,
        longitude: float,
        api_key: str | None = None,
        units: str = "metric",
        lang: str = "en",
    ) -> WeatherData | None:
        key = api_key or settings.OPENWEATHER_API_KEY
        if not key or key == "replace_with_your_key":
            return None

        cached = await geo_cache.get_spatial("weather", latitude, longitude, f"{units}:{lang}")
        if cached:
            return WeatherData(**cached)

        client = await self.get_client()
        try:
            response = await client.get(
                settings.OPENWEATHER_URL,
                params={
                    "lat": latitude,
                    "lon": longitude,
                    "appid": key,
                    "units": units,
                    "lang": lang,
                },
            )
            if response.status_code != 200:
                return None

            data = response.json()
            main_data = data.get("main", {})
            weather_list = data.get("weather", [{}])
            first_w = weather_list[0] if weather_list else {}
            wind_data = data.get("wind", {})

            description = first_w.get("description", "Clear").capitalize()
            icon_id = first_w.get("icon", "01d")
            emoji = resolve_weather_emoji(icon_id, description)

            weather_obj = WeatherData(
                temperature=main_data.get("temp", 0.0),
                feels_like=main_data.get("feels_like", main_data.get("temp", 0.0)),
                temp_min=main_data.get("temp_min"),
                temp_max=main_data.get("temp_max"),
                humidity=main_data.get("humidity", 0),
                pressure=main_data.get("pressure", 1013),
                wind_speed=wind_data.get("speed", 0.0),
                wind_deg=wind_data.get("deg"),
                description=description,
                icon=icon_id,
                emoji=emoji,
                units=units,
            )

            await geo_cache.set_spatial(
                "weather",
                latitude,
                longitude,
                weather_obj.model_dump(),
                f"{units}:{lang}",
                ttl=settings.CACHE_TTL_SECONDS,
            )
            return weather_obj
        except Exception:
            return None

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()


weather_service = WeatherService()
