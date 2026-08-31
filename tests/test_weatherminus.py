import pytest
from unittest.mock import patch, MagicMock
import requests

from weatherminus import (
    get_antipode,
    load_configuration,
    geocode_city,
    get_weather_emoji,
    get_status_commentary,
    format_weather_card,
    get_weather,
)


class TestAntipodeCalculation:
    """Test suite for mathematical antipode coordinates calculation."""

    def test_antipode_edirne(self):
        # Edirne: 41.67, 26.56 -> -41.67, -153.44
        lat, lon = get_antipode(41.67, 26.56)
        assert lat == -41.67
        assert lon == -153.44

    def test_antipode_equator_prime_meridian(self):
        # 0, 0 -> 0, 180
        lat, lon = get_antipode(0.0, 0.0)
        assert lat == 0.0
        assert lon == 180.0

    def test_antipode_poles(self):
        # North Pole 90, 0 -> South Pole -90, 180
        lat, lon = get_antipode(90.0, 0.0)
        assert lat == -90.0
        assert lon == 180.0

        # South Pole -90, 50 -> North Pole 90, -130
        lat, lon = get_antipode(-90.0, 50.0)
        assert lat == 90.0
        assert lon == -130.0

    def test_antipode_boundary_longitudes(self):
        # 0, 180 -> 0, 0
        lat, lon = get_antipode(0.0, 180.0)
        assert lat == 0.0
        assert lon == 0.0

        # 0, -180 -> 0, 0
        lat, lon = get_antipode(0.0, -180.0)
        assert lat == 0.0
        assert lon == 0.0

    def test_invalid_latitude_raises_value_error(self):
        with pytest.raises(ValueError, match="Latitude must be between -90 and 90"):
            get_antipode(91.0, 0.0)

        with pytest.raises(ValueError, match="Latitude must be between -90 and 90"):
            get_antipode(-90.1, 0.0)

    def test_invalid_longitude_raises_value_error(self):
        with pytest.raises(ValueError, match="Longitude must be between -180 and 180"):
            get_antipode(0.0, 180.5)

        with pytest.raises(ValueError, match="Longitude must be between -180 and 180"):
            get_antipode(0.0, -181.0)


class TestWeatherEmojis:
    """Test suite for emoji mappings based on weather codes."""

    def test_clear_sky(self):
        assert get_weather_emoji("01d", "clear sky") == "☀️"

    def test_rain(self):
        assert get_weather_emoji("10d", "light rain") == "🌧️"

    def test_thunderstorm(self):
        assert get_weather_emoji("11d", "thunderstorm with heavy rain") == "⛈️"

    def test_snow(self):
        assert get_weather_emoji("13d", "light snow") == "❄️"

    def test_clouds(self):
        assert get_weather_emoji("04d", "broken clouds") == "☁️"


class TestStatusCommentary:
    """Test suite for weather commentary generator."""

    def test_freezing_commentary(self):
        status = get_status_commentary(-5, "clear sky", is_antipode=True)
        assert "freezing" in status.lower()

    def test_rain_commentary(self):
        status = get_status_commentary(15, "heavy rain", is_antipode=False)
        assert "raining" in status.lower()

    def test_hot_commentary(self):
        status = get_status_commentary(35, "clear sky", is_antipode=True)
        assert "scorching" in status.lower()


class TestGeocodingAndAPI:
    """Test suite for Geocoding and API mocking."""

    @patch("weatherminus.requests.get")
    def test_geocode_city_success(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {"name": "Tokyo", "lat": 35.6895, "lon": 139.6917, "country": "JP"}
        ]
        mock_get.return_value = mock_response

        lat, lon, name = geocode_city("fake_key", "Tokyo")
        assert lat == 35.6895
        assert lon == 139.6917
        assert "Tokyo" in name
        assert "JP" in name

    @patch("weatherminus.requests.get")
    def test_geocode_city_not_found(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = []
        mock_get.return_value = mock_response

        with pytest.raises(ValueError, match="could not be found"):
            geocode_city("fake_key", "NonExistentCity12345")

    @patch("weatherminus.requests.get")
    def test_get_weather_unauthorized(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_get.return_value = mock_response

        with pytest.raises(ValueError, match="Invalid OpenWeather API Key"):
            get_weather("invalid_key", 41.67, 26.56)

    def test_format_weather_card(self):
        sample_weather = {
            "name": "Pacific Ocean",
            "main": {"temp": 18.5, "feels_like": 17.8, "humidity": 80, "pressure": 1013},
            "weather": [{"description": "few clouds", "icon": "02d"}],
            "wind": {"speed": 4.5},
        }
        card = format_weather_card(sample_weather, "Test Location", -41.67, -153.44)
        assert "TEST LOCATION" in card
        assert "18.5°C" in card
        assert "https://www.google.com/maps?q=-41.67,-153.44" in card
