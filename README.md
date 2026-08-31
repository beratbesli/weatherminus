# Weatherminus

**Weatherminus** is a smart Python CLI tool that calculates any location's antipode (the exact opposite point on Earth) and retrieves real-time weather data for that opposite point via OpenWeather.

---

## 🚀 Features

- **Antipode Calculation:** Calculates the antipodal coordinates on Earth with full precision and edge-case protection.
- **Side-by-Side Comparison:** Compare weather between your home location and the opposite side of the world (`--compare`).
- **City Search (Geocoding):** Look up any city by name (`--city "Tokyo"`).
- **IP Auto-Detection:** Automatically detect your coordinates based on your public IP (`--auto-ip`).
- **Rich Weather Cards:** Detailed atmospheric data (Temperature, Feels Like, Humidity, Wind Speed, Pressure, Condition Emoji).
- **Google Maps Integration:** Direct clickable map link to the exact antipode coordinates.
- **Custom Units & Languages:** Supports Celsius/Fahrenheit (`--units metric|imperial`) and multi-language descriptions (`--lang tr`, `en`, `de`, etc.).

---

## 🛠️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/beratbesli/weatherminus.git
   cd weatherminus
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On Linux/macOS:
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up your API Key:**
   Copy `.env.example` to `.env` and add your free OpenWeather API key:
   ```bash
   cp .env.example .env
   ```
   *(Edit `.env` and set `OPENWEATHER_API_KEY=your_actual_key`)*

---

## 📖 Usage Examples

### 1. Default Run (Uses coordinates from `.env`)
```bash
python weatherminus.py
```

### 2. Search by City Name with Comparison
```bash
python weatherminus.py --city "Istanbul" --compare
```

### 3. Auto-Detect Your Location via IP
```bash
python weatherminus.py --auto-ip --compare
```

### 4. Custom Coordinates & Turkish Language
```bash
python weatherminus.py --lat 40.7128 --lon -74.0060 --lang tr
```

### 5. CLI Options Overview
```text
options:
  -h, --help            Show help message and exit
  --city CITY, -c CITY  Search origin by city name (e.g. 'Tokyo', 'Istanbul')
  --lat LAT             Custom origin latitude (-90 to 90)
  --lon LON             Custom origin longitude (-180 to 180)
  --auto-ip, -a         Automatically detect your location based on public IP
  --compare             Show weather comparison between origin and antipode
  --units {metric,imperial}, -u
                        Units ('metric' for Celsius, 'imperial' for Fahrenheit)
  --lang LANG, -l LANG  Language code (e.g. 'en', 'tr', 'de', 'es')
  --api-key API_KEY, -k Provide OpenWeather API key directly
```

---

## 🧪 Running Tests

Run the test suite with `pytest`:
```bash
pytest
```

---

## 📜 License

Released under the [MIT License](LICENSE).
