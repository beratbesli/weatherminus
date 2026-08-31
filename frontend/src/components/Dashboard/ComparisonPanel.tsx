import React from 'react';
import { MapPin, ExternalLink, Globe2 } from 'lucide-react';
import { WeatherCard } from './WeatherCard';
import { OceanCard } from './OceanCard';
import { FullTelemetryResponse } from '../../types';

interface ComparisonPanelProps {
  telemetry: FullTelemetryResponse | null;
  units: 'metric' | 'imperial';
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ telemetry, units }) => {
  if (!telemetry) return null;

  const { origin, antipode, status_summary } = telemetry;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-20 pointer-events-none">
      <div className="max-w-5xl mx-auto space-y-3 pointer-events-auto">
        <div className="glass-panel px-4 py-2 rounded-xl text-center border border-white/10 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <span>{status_summary}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Distance: 20,015 km (Across Earth Diameter)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-sm font-extrabold tracking-wide text-cyan-300 uppercase">
                  Your Location
                </h3>
              </div>
              <a
                href={origin.map_url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="font-semibold truncate">{origin.location.name}</span>
              <span className="text-slate-500 font-mono text-[10px] ml-auto">
                ({origin.location.latitude.toFixed(2)}°, {origin.location.longitude.toFixed(2)}°)
              </span>
            </div>

            <WeatherCard weather={origin.weather} units={units} accentColor="cyan" />
            <OceanCard marine={origin.marine} isLand={origin.location.is_land} />
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                <h3 className="text-sm font-extrabold tracking-wide text-rose-300 uppercase">
                  Exact Opposite Point (Antipode)
                </h3>
              </div>
              <a
                href={antipode.map_url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span className="font-semibold truncate">{antipode.location.name}</span>
              <span className="text-slate-500 font-mono text-[10px] ml-auto">
                ({antipode.location.latitude.toFixed(2)}°, {antipode.location.longitude.toFixed(2)}°)
              </span>
            </div>

            <WeatherCard weather={antipode.weather} units={units} accentColor="rose" />
            <OceanCard marine={antipode.marine} isLand={antipode.location.is_land} />
          </div>
        </div>
      </div>
    </div>
  );
};
