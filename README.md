# Weatherminus 3D 🌍

**Weatherminus 3D** is an interactive 3D Web, Oceanography & Earth Antipode Telemetry platform. It calculates any location's exact antipodal point on Earth, drills a 3D tunnel through the planet's core, and provides real-time atmospheric, oceanographic, and bathymetric data.

---

## ✨ Features

- **3D Interactive WebGL Globe (Three.js):** Smooth real-time 3D Earth visualization with atmospheric shaders, orbital controls, and day/night lighting.
- **Earth Core Laser Tunnel:** 3D laser connecting origin coordinates directly through $(0,0,0)$ to the antipode, with a cinematic "Drill Through Earth" camera animation.
- **Oceanography & Marine Telemetry:** For antipodes landing in open oceans (71%+ of Earth), live telemetry displays wave heights, wave periods, seabed depth (bathymetry), and oceanic surface conditions.
- **Side-by-Side Telemetry Comparison:** Compare origin climate against the exact opposite side of the world.
- **High-Performance FastAPI Backend:** Asynchronous microservice with spatial grid indexing, multi-tier caching (reducing external API calls by 90%+), security headers, and rate-limiting.
- **Geocoding & IP Auto-Detection:** Search by city name or auto-detect current location via IP.
- **Full-Featured Python CLI:** Includes `weatherminus.py` for terminal usage.
- **Docker Ready:** One-command startup via Docker Compose.

---

## 🏗️ Architecture

```text
weatherminus/
├── backend/                  # FastAPI async microservice
│   ├── app/
│   │   ├── api/v1/          # Telemetry, Antipode, Marine, Geocode routes
│   │   ├── core/            # Spatial engine, Geo-cache, Configuration
│   │   └── services/        # Weather, Marine (Open-Meteo), Geocoding
│   ├── tests/               # Backend unit & integration test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # React + TypeScript + Three.js Web App
│   ├── src/
│   │   ├── components/      # EarthGlobe 3D, WeatherCard, OceanCard, SearchBar
│   │   ├── services/        # Typed API client
│   │   └── types/           # Telemetry TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── tests/                    # Core CLI test suite
├── weatherminus.py           # Standalone Python CLI application
├── docker-compose.yml        # Unified multi-container orchestration
└── requirements.txt
```

---

## 🚀 Quick Start

### 1. Run with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/beratbesli/weatherminus.git
cd weatherminus

# Copy environment template
cp .env.example .env
# Edit .env and set your OPENWEATHER_API_KEY

# Start both Frontend and Backend
docker-compose up --build
```
- **Web App:** `http://localhost:3000`
- **API Documentation:** `http://localhost:8000/api/v1/docs`

---

### 2. Manual Local Development

#### Backend:
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate | Linux/macOS: source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

### 3. Standalone CLI Usage

```bash
# Basic run
python weatherminus.py

# City search with ocean marine data & comparison
python weatherminus.py --city "Tokyo" --compare --marine

# Auto-detect IP location in Turkish language
python weatherminus.py --auto-ip --compare --lang tr
```

---

## 🧪 Testing

Run all unit and integration tests:
```bash
pytest -v
```

---

## 📜 License

Released under the [MIT License](LICENSE).
