# Weatherminus

Weatherminus is a Python console app that calculates a location's antipode and retrieves current weather data for that point from OpenWeather.

## Setup

```bash
git clone https://github.com/beratbesli/weatherminus.git
cd weatherminus
python -m venv .venv
```

Activate the virtual environment, then install dependencies:

```bash
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set `OPENWEATHER_API_KEY`. The `.env` file is ignored by Git and must never be committed.

You can also change `WEATHERMINUS_LAT` and `WEATHERMINUS_LON` in `.env`. Their defaults point to Edirne, Turkey.

## Run

```bash
python weatherminus.py
```

The app uses HTTPS, validates coordinate ranges and gives the weather request a 10-second timeout.

## License

Released under the [MIT License](LICENSE).
