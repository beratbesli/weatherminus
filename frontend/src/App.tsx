import React, { useState, useEffect, useCallback } from 'react';
import { EarthGlobe } from './components/Globe/EarthGlobe';
import { Header } from './components/Dashboard/Header';
import { SearchBar } from './components/Dashboard/SearchBar';
import { ComparisonPanel } from './components/Dashboard/ComparisonPanel';
import { fetchTelemetry } from './services/api';
import { FullTelemetryResponse } from './types';
import { Language } from './i18n/translations';

export const App: React.FC = () => {
  const [originLat, setOriginLat] = useState<number>(41.67);
  const [originLon, setOriginLon] = useState<number>(26.56);
  const [originName, setOriginName] = useState<string>('Edirne, Turkey');
  const [antiLat, setAntiLat] = useState<number>(-41.67);
  const [antiLon, setAntiLon] = useState<number>(-153.44);

  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [lang, setLang] = useState<Language>('tr');
  const [telemetry, setTelemetry] = useState<FullTelemetryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDrilling, setIsDrilling] = useState<boolean>(false);

  const loadData = useCallback(async (lat: number, lon: number, name?: string, currentUnits = units, currentLang = lang) => {
    setIsLoading(true);
    try {
      const data = await fetchTelemetry(lat, lon, name, currentUnits, currentLang);
      setTelemetry(data);
      setOriginLat(data.origin.location.latitude);
      setOriginLon(data.origin.location.longitude);
      setAntiLat(data.antipode.location.latitude);
      setAntiLon(data.antipode.location.longitude);
    } catch {
      const oppositeLat = -lat;
      let oppositeLon = lon + 180;
      if (oppositeLon > 180) oppositeLon -= 360;
      setAntiLat(oppositeLat);
      setAntiLon(oppositeLon);
    } finally {
      setIsLoading(false);
    }
  }, [units, lang]);

  useEffect(() => {
    loadData(originLat, originLon, originName, units, lang);
  }, [units, lang, loadData, originLat, originLon, originName]);

  const handleSelectLocation = (lat: number, lon: number, name: string) => {
    setOriginLat(lat);
    setOriginLon(lon);
    setOriginName(name);
    loadData(lat, lon, name, units, lang);
  };

  const handleToggleUnits = () => {
    const nextUnits = units === 'metric' ? 'imperial' : 'metric';
    setUnits(nextUnits);
  };

  const handleChangeLanguage = (newLang: Language) => {
    setLang(newLang);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#040814] select-none">
      <EarthGlobe
        originLat={originLat}
        originLon={originLon}
        antiLat={antiLat}
        antiLon={antiLon}
        isDrilling={isDrilling}
        onDrillComplete={() => setIsDrilling(false)}
      />

      <Header
        units={units}
        onToggleUnits={handleToggleUnits}
        lang={lang}
        onChangeLang={handleChangeLanguage}
        onDrillClick={() => setIsDrilling(true)}
        isDrilling={isDrilling}
      />

      <div className="fixed top-20 left-4 right-4 z-20 pointer-events-none">
        <SearchBar
          onSelectLocation={handleSelectLocation}
          isLoading={isLoading}
          lang={lang}
        />
      </div>

      <ComparisonPanel
        telemetry={telemetry}
        units={units}
        lang={lang}
      />
    </div>
  );
};

export default App;
