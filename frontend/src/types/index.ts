export interface LocationInfo {
  name: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
  is_land: boolean;
}

export interface WeatherData {
  temperature: number;
  feels_like: number;
  temp_min?: number;
  temp_max?: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg?: number;
  description: string;
  icon: string;
  emoji: string;
  units: string;
}

export interface MarineData {
  available: boolean;
  wave_height_m?: number | null;
  wave_direction_deg?: number | null;
  wave_period_s?: number | null;
  sea_surface_temp_c?: number | null;
  ocean_depth_m?: number | null;
  condition_summary: string;
}

export interface PointTelemetry {
  location: LocationInfo;
  weather: WeatherData | null;
  marine: MarineData | null;
  map_url: string;
  commentary: string;
}

export interface FullTelemetryResponse {
  origin: PointTelemetry;
  antipode: PointTelemetry;
  antipode_distance_km: number;
  status_summary: string;
}

export interface CitySearchResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}
