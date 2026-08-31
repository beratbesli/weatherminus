import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.core.spatial import (
    calculate_antipode,
    quantize_coordinates,
    haversine_distance_km,
    is_land,
    estimate_ocean_depth_meters,
)
from backend.app.core.cache import GeoSpatialCache

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "Weatherminus API" in response.json()["name"]


def test_spatial_antipode():
    lat, lon = calculate_antipode(41.67, 26.56)
    assert lat == -41.67
    assert lon == -153.44

    lat, lon = calculate_antipode(0.0, 0.0)
    assert lat == 0.0
    assert lon == 180.0


def test_spatial_quantization():
    lat, lon = quantize_coordinates(41.6734, 26.5689, precision=0.05)
    assert lat == 41.65
    assert lon == 26.55


def test_haversine_distance():
    dist = haversine_distance_km(0.0, 0.0, 0.0, 180.0)
    assert 20000 <= dist <= 20050


def test_is_land_and_depth():
    assert is_land(41.0, 29.0) is True
    assert estimate_ocean_depth_meters(41.0, 29.0) == 0

    assert is_land(-41.67, -153.44) is False
    assert estimate_ocean_depth_meters(-41.67, -153.44) > 0


@pytest.mark.asyncio
async def test_geo_spatial_cache():
    cache = GeoSpatialCache(ttl_seconds=10)
    await cache.set_spatial("test", 41.67, 26.56, {"data": 123})
    val = await cache.get_spatial("test", 41.67, 26.56)
    assert val == {"data": 123}

    val_close = await cache.get_spatial("test", 41.671, 26.562)
    assert val_close == {"data": 123}


def test_antipode_endpoint():
    response = client.get("/api/v1/antipode?lat=41.67&lon=26.56")
    assert response.status_code == 200
    data = response.json()
    assert data["antipode_latitude"] == -41.67
    assert data["antipode_longitude"] == -153.44
    assert data["is_land"] is False


def test_antipode_invalid_coords():
    response = client.get("/api/v1/antipode?lat=100.0&lon=26.56")
    assert response.status_code == 422


def test_security_headers():
    response = client.get("/health")
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"


@patch("backend.app.services.weather_service.weather_service.fetch_weather")
@patch("backend.app.services.marine_service.marine_service.fetch_marine_data")
def test_telemetry_endpoint(mock_marine, mock_weather):
    from backend.app.schemas.telemetry import WeatherData, MarineData

    mock_weather.return_value = WeatherData(
        temperature=22.5,
        feels_like=22.0,
        humidity=60,
        pressure=1015,
        wind_speed=3.2,
        description="Clear sky",
        icon="01d",
        emoji="☀️",
    )
    mock_marine.return_value = MarineData(
        available=True,
        wave_height_m=1.8,
        ocean_depth_m=4200,
        condition_summary="Moderate waves.",
    )

    response = client.get("/api/v1/telemetry?lat=41.67&lon=26.56&origin_name=Edirne")
    assert response.status_code == 200
    data = response.json()
    assert data["origin"]["location"]["name"] == "Edirne"
    assert data["antipode"]["location"]["latitude"] == -41.67
    assert data["antipode"]["location"]["longitude"] == -153.44
