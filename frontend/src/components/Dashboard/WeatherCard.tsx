import React from 'react';
import { Wind, Droplets, Gauge } from 'lucide-react';
import { WeatherData } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface WeatherCardProps {
  weather: WeatherData | null;
  units: 'metric' | 'imperial';
  accentColor: 'cyan' | 'rose';
  lang: Language;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, units, accentColor, lang }) => {
  const t = translations[lang];

  if (!weather) {
    return (
      <div className="glass-card p-4 rounded-xl text-center text-slate-400 text-xs">
        {t.weatherUnavailable}
      </div>
    );
  }

  const tempSymbol = units === 'metric' ? '°C' : '°F';
  const speedSymbol = units === 'metric' ? 'm/s' : 'mph';
  const isCyan = accentColor === 'cyan';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl filter drop-shadow-md">{weather.emoji}</span>
          <div>
            <div className="text-2xl font-bold tracking-tight text-white flex items-baseline gap-1">
              <span>{Math.round(weather.temperature)}</span>
              <span className={`text-sm font-semibold ${isCyan ? 'text-cyan-400' : 'text-rose-400'}`}>
                {tempSymbol}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium capitalize">{weather.description}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{t.feelsLike}</span>
          <div className="text-sm font-bold text-slate-200">
            {Math.round(weather.feels_like)}{tempSymbol}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
        <div className="glass-card p-2 rounded-lg flex flex-col items-center justify-center text-center">
          <Droplets className="w-3.5 h-3.5 text-cyan-400 mb-1" />
          <span className="text-[10px] text-slate-400">{t.humidity}</span>
          <span className="text-xs font-bold text-slate-100">{weather.humidity}%</span>
        </div>

        <div className="glass-card p-2 rounded-lg flex flex-col items-center justify-center text-center">
          <Wind className="w-3.5 h-3.5 text-emerald-400 mb-1" />
          <span className="text-[10px] text-slate-400">{t.wind}</span>
          <span className="text-xs font-bold text-slate-100">{weather.wind_speed} {speedSymbol}</span>
        </div>

        <div className="glass-card p-2 rounded-lg flex flex-col items-center justify-center text-center">
          <Gauge className="w-3.5 h-3.5 text-amber-400 mb-1" />
          <span className="text-[10px] text-slate-400">{t.pressure}</span>
          <span className="text-xs font-bold text-slate-100">{weather.pressure} hPa</span>
        </div>
      </div>
    </div>
  );
};
