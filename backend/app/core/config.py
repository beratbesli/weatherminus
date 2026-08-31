from __future__ import annotations

import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Weatherminus API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    OPENWEATHER_API_KEY: str = ""
    OPENWEATHER_URL: str = "https://api.openweathermap.org/data/2.5/weather"
    OPENWEATHER_GEO_URL: str = "https://api.openweathermap.org/geo/1.0/direct"
    OPEN_METEO_MARINE_URL: str = "https://marine-api.open-meteo.com/v1/marine"
    IP_GEO_URL: str = "https://ipapi.co/json/"
    CACHE_TTL_SECONDS: int = 600
    RATE_LIMIT_PER_MINUTE: int = 60
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
