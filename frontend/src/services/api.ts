import { FullTelemetryResponse, CitySearchResult, LocationInfo } from '../types';

const API_BASE = '/api/v1';

export async function fetchTelemetry(
  lat: number,
  lon: number,
  originName?: string,
  units: 'metric' | 'imperial' = 'metric',
  lang: string = 'en'
): Promise<FullTelemetryResponse> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    units,
    lang,
  });

  if (originName) {
    params.append('origin_name', originName);
  }

  const response = await fetch(`${API_BASE}/telemetry?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Telemetry fetch failed: ${response.statusText}`);
  }
  return response.json();
}

export async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (!query.trim()) return [];
  const response = await fetch(`${API_BASE}/geocode/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) return [];
  return response.json();
}

export async function fetchAutoIpLocation(): Promise<LocationInfo | null> {
  try {
    const response = await fetch(`${API_BASE}/geocode/auto-ip`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
