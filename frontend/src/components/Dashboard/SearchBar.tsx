import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, Loader2 } from 'lucide-react';
import { searchCities, fetchAutoIpLocation } from '../../services/api';
import { CitySearchResult } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface SearchBarProps {
  onSelectLocation: (lat: number, lon: number, name: string) => void;
  isLoading: boolean;
  lang: Language;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectLocation, isLoading, lang }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const cities = await searchCities(query);
      setResults(cities);
      setIsOpen(cities.length > 0);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: CitySearchResult) => {
    const fullName = [city.name, city.state, city.country].filter(Boolean).join(', ');
    setQuery(fullName);
    setIsOpen(false);
    onSelectLocation(city.lat, city.lon, fullName);
  };

  const handleAutoIp = async () => {
    setIsSearching(true);
    const loc = await fetchAutoIpLocation();
    setIsSearching(false);
    if (loc) {
      const name = [loc.name, loc.country].filter(Boolean).join(', ');
      setQuery(name);
      onSelectLocation(loc.latitude, loc.longitude, name);
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-xl mx-auto pointer-events-auto">
      <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-2 border border-white/10 shadow-2xl transition-all focus-within:border-cyan-500/50">
        <div className="pl-3 text-cyan-400">
          {isSearching || isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-400 outline-none px-2 py-1.5 font-medium"
        />

        <button
          onClick={handleAutoIp}
          title={t.myLocation}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-cyan-500/20 transition-all active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{t.myLocation}</span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl z-40">
          <ul className="divide-y divide-white/5 max-h-64 overflow-y-auto custom-scrollbar">
            {results.map((city, idx) => (
              <li
                key={`${city.lat}-${city.lon}-${idx}`}
                onClick={() => handleSelect(city)}
                className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between text-sm transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-100">{city.name}</span>
                    {city.state && <span className="text-slate-400 text-xs ml-1">({city.state})</span>}
                    <span className="text-slate-400 text-xs ml-1.5">[{city.country}]</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
