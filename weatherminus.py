import os

import requests
from dotenv import load_dotenv


WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"


def get_antipode(latitude, longitude):
    if not -90 <= latitude <= 90:
        raise ValueError("Latitude must be between -90 and 90.")
    if not -180 <= longitude <= 180:
        raise ValueError("Longitude must be between -180 and 180.")

    opposite_latitude = -latitude
    opposite_longitude = longitude + 180
    if opposite_longitude > 180:
        opposite_longitude -= 360
    return opposite_latitude, opposite_longitude


def load_configuration():
    load_dotenv()
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        raise ValueError("OPENWEATHER_API_KEY is not set. Copy .env.example to .env first.")

    latitude = float(os.getenv("WEATHERMINUS_LAT", "41.67"))
    longitude = float(os.getenv("WEATHERMINUS_LON", "26.56"))
    return api_key, latitude, longitude


def get_weather(api_key, latitude, longitude):
    response = requests.get(
        WEATHER_URL,
        params={
            "lat": latitude,
            "lon": longitude,
            "appid": api_key,
            "units": "metric",
            "lang": "en",
        },
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


def print_weather(weather):
    if "main" not in weather or not weather.get("weather"):
        print("The weather service returned an incomplete response.")
        return

    temperature = weather["main"]["temp"]
    description = weather["weather"][0]["description"]
    location = weather.get("name") or "the Middle of the Ocean"

    print("--- WEATHERMINUS ---")
    print(f"Currently at your exact opposite point on Earth ({location}):")
    print(f"Weather: {temperature} C, {description.capitalize()}.")
    print("\nStatus:")
    if temperature < 10:
        print("It's freezing over there! Be glad you're in a warm place writing code.")
    elif "rain" in description.lower():
        print("It's raining there right now. Be happy you are staying dry!")
    else:
        print("The weather is actually not bad there, but there is no place like home!")


def main():
    try:
        api_key, latitude, longitude = load_configuration()
        opposite_latitude, opposite_longitude = get_antipode(latitude, longitude)
        print_weather(get_weather(api_key, opposite_latitude, opposite_longitude))
    except ValueError as error:
        print(f"Configuration error: {error}")
    except requests.Timeout:
        print("The weather service timed out. Try again later.")
    except requests.RequestException as error:
        print(f"Weather service request failed: {error}")


if __name__ == "__main__":
    main()
