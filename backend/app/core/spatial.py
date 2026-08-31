from __future__ import annotations

import math


def calculate_antipode(latitude: float, longitude: float) -> tuple[float, float]:
    if not -90.0 <= latitude <= 90.0:
        raise ValueError("Latitude must be between -90 and 90.")
    if not -180.0 <= longitude <= 180.0:
        raise ValueError("Longitude must be between -180 and 180.")

    opposite_lat = -latitude if latitude != 0.0 else 0.0
    opposite_lon = longitude + 180.0
    if opposite_lon > 180.0:
        opposite_lon -= 360.0

    if opposite_lon == -180.0:
        opposite_lon = 180.0

    return round(opposite_lat, 4), round(opposite_lon, 4)


def quantize_coordinates(latitude: float, longitude: float, precision: float = 0.05) -> tuple[float, float]:
    q_lat = round(round(latitude / precision) * precision, 4)
    q_lon = round(round(longitude / precision) * precision, 4)
    return q_lat, q_lon


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)


CONTINENT_BOUNDS = [
    (36.0, 71.0, -10.0, 40.0),
    (10.0, 75.0, 40.0, 180.0),
    (-35.0, 37.0, -18.0, 52.0),
    (15.0, 72.0, -168.0, -52.0),
    (-56.0, 13.0, -82.0, -34.0),
    (-44.0, -10.0, 113.0, 154.0),
    (-90.0, -60.0, -180.0, 180.0),
    (-47.5, -34.0, 166.0, 179.0),
    (60.0, 83.5, -73.0, -12.0),
    (24.0, 46.0, 123.0, 146.0),
    (50.0, 60.0, -11.0, 2.0),
    (-26.0, -12.0, 43.0, 51.0),
    (-11.0, 6.0, 95.0, 141.0),
    (18.0, 28.5, -85.0, -65.0),
]


def is_land(latitude: float, longitude: float) -> bool:
    for min_lat, max_lat, min_lon, max_lon in CONTINENT_BOUNDS:
        if min_lat <= latitude <= max_lat:
            if min_lon <= longitude <= max_lon:
                return True
    return False


def estimate_ocean_depth_meters(latitude: float, longitude: float) -> int:
    if is_land(latitude, longitude):
        return 0

    abs_lat = abs(latitude)
    if -160 <= longitude <= -120 and -50 <= latitude <= -20:
        return 4800
    if 135 <= longitude <= 150 and 10 <= latitude <= 25:
        return 8500
    if -80 <= longitude <= -60 and 15 <= latitude <= 30:
        return 5200
    if abs_lat > 60:
        return 2200

    base_depth = 3800
    variance = int((math.sin(latitude * 5) + math.cos(longitude * 5)) * 400)
    return max(500, base_depth + variance)
