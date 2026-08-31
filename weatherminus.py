"""Weatherminus: Calculate Earth antipode and compare weather data."""

from __future__ import annotations

import argparse
import os
import sys
from typing import Any
import requests
from dotenv import load_dotenv

WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
GEOCODING_URL = "https://api.openweathermap.org/geo/1.0/direct"
IP_GEOLOCATION_URL = "https://ipapi.co/json/"
DEFAULT_LATITUDE = 41.67
DEFAULT_LONGITUDE = 26.56


def get_antipode(latitude: float, longitude: float) -> tuple[float, float]:
    """Calculate the exact opposite geographical point (antipode) on Earth.

    Args:
        latitude: Latitude in degrees (-90 to 90).
        longitude: Longitude in degrees (-180 to 180).

    Returns:
        A tuple of (antipode_latitude, antipode_longitude) rounded to 4 decimals.

    Raises:
        ValueError: If latitude or longitude is outside valid geographical boundaries.
    """
    if not -90 <= latitude <= 90:
        raise ValueError("Latitude must be between -90 and 90.")
    if not -180 <= longitude <= 180:
        raise ValueError("Longitude must be between -180 and 180.")

    opposite_latitude = -latitude if latitude != 0.0 else 0.0
    opposite_longitude = longitude + 180
    if opposite_longitude > 180:
        opposite_longitude -= 360

    if opposite_longitude == -180.0:
        opposite_longitude = 180.0

    return round(opposite_latitude, 4), round(opposite_longitude, 4)


def load_configuration() -> tuple[str | None, float, float]:
    """Load API key and default coordinates from environment (.env).

    Returns:
        Tuple of (api_key, latitude, longitude).
    """
    load_dotenv()
    api_key = os.getenv("OPENWEATHER_API_KEY", "").strip()

    lat_str = os.getenv("WEATHERMINUS_LAT", "").strip()
    lon_str = os.getenv("WEATHERMINUS_LON", "").strip()

    try:
        latitude = float(lat_str) if lat_str else DEFAULT_LATITUDE
    except ValueError:
        latitude = DEFAULT_LATITUDE

    try:
        longitude = float(lon_str) if lon_str else DEFAULT_LONGITUDE
    except ValueError:
        longitude = DEFAULT_LONGITUDE

    return api_key if api_key else None, latitude, longitude


def geocode_city(api_key: str, city_name: str) -> tuple[float, float, str]:
    """Resolve city name into geographical coordinates using OpenWeather Geocoding API.

    Args:
        api_key: OpenWeather API key.
        city_name: Name of the city to search.

    Returns:
        Tuple of (latitude, longitude, formatted_location_name).

    Raises:
        ValueError: If city is not found or response is invalid.
        requests.RequestException: On network/API errors.
    """
    response = requests.get(
        GEOCODING_URL,
        params={"q": city_name, "limit": 1, "appid": api_key},
        timeout=10,
    )
    handle_http_errors(response)
    data = response.json()

    if not data or not isinstance(data, list):
        raise ValueError(f"City '{city_name}' could not be found.")

    city_info = data[0]
    lat = city_info.get("lat")
    lon = city_info.get("lon")
    name = city_info.get("name", city_name)
    country = city_info.get("country", "")
    state = city_info.get("state", "")

    location_parts = [part for part in [name, state, country] if part]
    full_location = ", ".join(location_parts)

    return float(lat), float(lon), full_location


def get_location_from_ip() -> tuple[float, float, str]:
    """Auto-detect current location using public IP geolocation.

    Returns:
        Tuple of (latitude, longitude, location_name).

    Raises:
        RuntimeError: If IP geolocation fails.
    """
    try:
        response = requests.get(
            IP_GEOLOCATION_URL,
            headers={"User-Agent": "weatherminus/1.0"},
            timeout=6,
        )
        if response.status_code == 200:
            data = response.json()
            lat = float(data.get("latitude"))
            lon = float(data.get("longitude"))
            city = data.get("city", "Unknown City")
            country = data.get("country_name", "")
            location_name = f"{city}, {country}".strip(", ")
            return lat, lon, location_name
    except Exception as err:
        raise RuntimeError(f"Could not auto-detect location from IP: {err}") from err

    raise RuntimeError("Failed to retrieve location from IP service.")


def handle_http_errors(response: requests.Response) -> None:
    """Check HTTP response and raise user-friendly exceptions for common error codes."""
    if response.status_code == 401:
        raise ValueError("Invalid OpenWeather API Key (401 Unauthorized). Please check your key in .env.")
    if response.status_code == 404:
        raise ValueError("Location not found on weather service (404).")
    if response.status_code == 429:
        raise ValueError("OpenWeather API rate limit exceeded (429). Please try again later.")
    response.raise_for_status()


def get_weather(
    api_key: str,
    latitude: float,
    longitude: float,
    units: str = "metric",
    lang: str = "en",
) -> dict[str, Any]:
    """Fetch current weather data from OpenWeather API.

    Args:
        api_key: OpenWeather API key.
        latitude: Latitude coordinate.
        longitude: Longitude coordinate.
        units: Temperature units ('metric' for Celsius, 'imperial' for Fahrenheit).
        lang: Response language code (e.g. 'en', 'tr').

    Returns:
        JSON response as a dictionary.
    """
    response = requests.get(
        WEATHER_URL,
        params={
            "lat": latitude,
            "lon": longitude,
            "appid": api_key,
            "units": units,
            "lang": lang,
        },
        timeout=10,
    )
    handle_http_errors(response)
    return response.json()


def get_weather_emoji(icon_id: str, description: str) -> str:
    """Return an appropriate weather emoji based on icon code or description."""
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


def format_weather_card(
    weather: dict[str, Any],
    title: str,
    latitude: float,
    longitude: float,
    units: str = "metric",
    custom_location_name: str | None = None,
) -> str:
    """Format weather details into an ASCII display card."""
    if "main" not in weather or not weather.get("weather"):
        return f"[{title}]\nIncomplete weather data received."

    unit_symbol = "°C" if units == "metric" else "°F"
    speed_symbol = "m/s" if units == "metric" else "mph"

    temp = weather["main"]["temp"]
    feels_like = weather["main"].get("feels_like", temp)
    humidity = weather["main"].get("humidity", "N/A")
    pressure = weather["main"].get("pressure", "N/A")
    wind_speed = weather.get("wind", {}).get("speed", "N/A")

    weather_item = weather["weather"][0]
    description = weather_item.get("description", "Unknown").capitalize()
    icon_id = weather_item.get("icon", "")
    emoji = get_weather_emoji(icon_id, description)

    resolved_name = custom_location_name or weather.get("name")
    if not resolved_name or resolved_name.strip() == "":
        resolved_name = "Middle of the Ocean / Remote Area"

    maps_url = f"https://www.google.com/maps?q={latitude},{longitude}"

    lines = [
        f"┌─────────────────────────────────────────────────────────────┐",
        f"│ {title.upper():^59} │",
        f"├─────────────────────────────────────────────────────────────┤",
        f"│ Location:    {resolved_name:<46} │",
        f"│ Coordinates: {f'{latitude:.4f}, {longitude:.4f}':<46} │",
        f"│ Condition:   {f'{emoji} {description}':<46} │",
        f"│ Temperature: {f'{temp}{unit_symbol} (Feels like {feels_like}{unit_symbol})':<46} │",
        f"│ Humidity:    {f'{humidity}%':<46} │",
        f"│ Wind Speed:  {f'{wind_speed} {speed_symbol}':<46} │",
        f"│ Pressure:    {f'{pressure} hPa':<46} │",
        f"│ Map Link:    {maps_url:<46} │",
        f"└─────────────────────────────────────────────────────────────┘",
    ]
    return "\n".join(lines)


def get_status_commentary(temp: float, description: str, is_antipode: bool = True) -> str:
    """Generate a witty status commentary based on weather."""
    desc_lower = description.lower()
    prefix = "Antipode status: " if is_antipode else "Home status: "

    if temp <= 0:
        return prefix + "It's freezing icy cold there! Bundle up in warm layers."
    if temp < 10:
        return prefix + "It's pretty chilly over there! Be glad for a warm room."
    if "thunderstorm" in desc_lower:
        return prefix + "Thunderstorms roaring right now! Stay safe inside."
    if "rain" in desc_lower or "drizzle" in desc_lower:
        return prefix + "It's raining over there! Grab an umbrella if you're out."
    if "snow" in desc_lower:
        return prefix + "Snow is falling there! A true winter wonderland."
    if temp > 32:
        return prefix + "Scorching heat! Stay hydrated and find some shade."
    return prefix + "The weather looks pleasant and calm!"


def parse_arguments() -> argparse.Namespace:
    """Configure and parse command line arguments."""
    parser = argparse.ArgumentParser(
        prog="weatherminus",
        description="Calculate Earth antipode and inspect opposite weather data.",
    )
    parser.add_argument(
        "--city",
        "-c",
        type=str,
        help="Search origin by city name (e.g. 'Tokyo', 'Istanbul', 'New York').",
    )
    parser.add_argument(
        "--lat",
        type=float,
        help="Custom origin latitude (-90 to 90).",
    )
    parser.add_argument(
        "--lon",
        type=float,
        help="Custom origin longitude (-180 to 180).",
    )
    parser.add_argument(
        "--auto-ip",
        "-a",
        action="store_true",
        help="Automatically detect your location based on public IP.",
    )
    parser.add_argument(
        "--compare",
        action="store_true",
        help="Show weather comparison between your origin location and the antipode.",
    )
    parser.add_argument(
        "--units",
        "-u",
        choices=["metric", "imperial"],
        default="metric",
        help="Units for temperature ('metric' for Celsius, 'imperial' for Fahrenheit).",
    )
    parser.add_argument(
        "--lang",
        "-l",
        type=str,
        default="en",
        help="Language code for weather description (e.g. 'en', 'tr', 'de', 'es').",
    )
    parser.add_argument(
        "--api-key",
        "-k",
        type=str,
        help="Provide OpenWeather API key directly instead of .env file.",
    )
    return parser.parse_args()


def main() -> int:
    """Main application execution pipeline."""
    args = parse_arguments()

    env_key, default_lat, default_lon = load_configuration()
    api_key = args.api_key or env_key

    if not api_key or api_key == "replace_with_your_key":
        print("Error: OpenWeather API key is missing or invalid.")
        print("Please create a .env file with OPENWEATHER_API_KEY=your_key or use --api-key.")
        return 1

    origin_name: str | None = None
    lat: float = default_lat
    lon: float = default_lon

    try:
        if args.city:
            print(f"Resolving city coordinates for '{args.city}'...")
            lat, lon, origin_name = geocode_city(api_key, args.city)
        elif args.auto_ip:
            print("Auto-detecting your location via IP address...")
            lat, lon, origin_name = get_location_from_ip()
        else:
            if args.lat is not None:
                lat = args.lat
            if args.lon is not None:
                lon = args.lon

        anti_lat, anti_lon = get_antipode(lat, lon)

        print("\n=================== WEATHERMINUS ===================")

        if args.compare:
            print("\nFetching weather for your origin location...")
            home_weather = get_weather(api_key, lat, lon, units=args.units, lang=args.lang)
            print(format_weather_card(home_weather, "Origin Location", lat, lon, args.units, origin_name))
            home_temp = home_weather.get("main", {}).get("temp", 20)
            home_desc = home_weather.get("weather", [{}])[0].get("description", "")
            print(get_status_commentary(home_temp, home_desc, is_antipode=False))
            print()

        print("Fetching weather for the exact opposite point (Antipode)...")
        anti_weather = get_weather(api_key, anti_lat, anti_lon, units=args.units, lang=args.lang)
        print(format_weather_card(anti_weather, "Exact Opposite Point (Antipode)", anti_lat, anti_lon, args.units))
        anti_temp = anti_weather.get("main", {}).get("temp", 20)
        anti_desc = anti_weather.get("weather", [{}])[0].get("description", "")
        print(get_status_commentary(anti_temp, anti_desc, is_antipode=True))
        print("====================================================\n")
        return 0

    except ValueError as err:
        print(f"\nConfiguration or validation error: {err}")
        return 1
    except requests.Timeout:
        print("\nError: The network request timed out. Please check your internet connection.")
        return 1
    except requests.RequestException as err:
        print(f"\nWeather API request failed: {err}")
        return 1
    except Exception as err:
        print(f"\nUnexpected error occurred: {err}")
        return 1


if __name__ == "__main__":
    sys.exit(main())

