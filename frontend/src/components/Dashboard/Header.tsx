import React from 'react';
import { Globe, Compass } from 'lucide-react';
import { Language, translations } from '../../i18n/translations';

interface HeaderProps {
  units: 'metric' | 'imperial';
  onToggleUnits: () => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onDrillClick: () => void;
  isDrilling: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  units,
  onToggleUnits,
  lang,
  onChangeLang,
  onDrillClick,
  isDrilling,
}) => {
  const t = translations[lang];

  return (
    <header className="fixed top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
      <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-3 pointer-events-auto border border-white/10 shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-rose-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wide bg-gradient-to-r from-cyan-300 via-white to-rose-300 bg-clip-text text-transparent">
            {t.appTitle}
          </h1>
          <p className="text-xs text-slate-400 font-medium">{t.appSubtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onDrillClick}
          disabled={isDrilling}
          className="glass-panel px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-all border border-rose-500/30 shadow-lg shadow-rose-950/40 active:scale-95 disabled:opacity-50"
        >
          <Compass className={`w-4 h-4 text-rose-400 ${isDrilling ? 'animate-spin' : ''}`} />
          <span>{isDrilling ? t.drillingButton : t.drillButton}</span>
        </button>

        <button
          onClick={onToggleUnits}
          className="glass-panel px-3 py-2.5 rounded-2xl text-xs font-bold text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 transition-all border border-cyan-500/30 shadow-lg active:scale-95"
        >
          {units === 'metric' ? '°C (Metric)' : '°F (Imperial)'}
        </button>

        <select
          value={lang}
          onChange={(e) => onChangeLang(e.target.value as Language)}
          className="glass-panel px-3 py-2.5 rounded-2xl text-xs font-medium text-slate-200 bg-slate-900/60 border border-white/10 outline-none cursor-pointer hover:border-cyan-500/40 transition-all"
        >
          <option value="en">English (EN)</option>
          <option value="tr">Türkçe (TR)</option>
          <option value="de">Deutsch (DE)</option>
          <option value="es">Español (ES)</option>
        </select>
      </div>
    </header>
  );
};
