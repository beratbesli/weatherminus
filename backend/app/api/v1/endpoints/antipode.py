from __future__ import annotations

from fastapi import APIRouter, Query, HTTPException
from backend.app.core.spatial import calculate_antipode, is_land, estimate_ocean_depth_meters

router = APIRouter()


@router.get("")
async def get_antipode_data(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
) -> dict[str, float | bool | int | str]:
    try:
        anti_lat, anti_lon = calculate_antipode(lat, lon)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

    anti_is_land = is_land(anti_lat, anti_lon)
    depth = estimate_ocean_depth_meters(anti_lat, anti_lon)

    return {
        "origin_latitude": lat,
        "origin_longitude": lon,
        "antipode_latitude": anti_lat,
        "antipode_longitude": anti_lon,
        "is_land": anti_is_land,
        "ocean_depth_meters": depth,
        "map_url": f"https://www.google.com/maps?q={anti_lat},{anti_lon}",
    }
