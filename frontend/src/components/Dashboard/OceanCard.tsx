import React from 'react';
import { Waves, Compass, ArrowDownCircle, ShieldCheck } from 'lucide-react';
import { MarineData } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface OceanCardProps {
  marine: MarineData | null;
  isLand: boolean;
  lang: Language;
}

export const OceanCard: React.FC<OceanCardProps> = ({ marine, isLand, lang }) => {
  const t = translations[lang];

  if (isLand) {
    return (
      <div className="glass-card p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300/90 border border-emerald-500/20">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>{t.landNotice}</span>
      </div>
    );
  }

  if (!marine) {
    return (
      <div className="glass-card p-3 rounded-xl text-center text-slate-400 text-xs">
        {t.marineLoading}
      </div>
    );
  }

  const waveHeight = marine.wave_height_m ?? 0;
  const wavePeriod = marine.wave_period_s ?? 'N/A';
  const oceanDepth = marine.ocean_depth_m ?? 3800;

  return (
    <div className="glass-card p-3.5 rounded-xl space-y-2.5 border border-cyan-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-cyan-200">{t.oceanographyTitle}</h4>
            <p className="text-[10px] text-slate-400">{marine.condition_summary}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-semibold block">{t.maxWave}</span>
          <span className="text-sm font-bold text-cyan-300">
            {waveHeight > 0 ? `${waveHeight} m` : t.calmCondition}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
        <div className="flex items-center gap-2 bg-slate-900/40 p-2 rounded-lg">
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-tight">{t.wavePeriod}</span>
            <span className="text-xs font-semibold text-slate-200">{wavePeriod} s</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/40 p-2 rounded-lg">
          <ArrowDownCircle className="w-3.5 h-3.5 text-slate-400" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-tight">{t.seabedDepth}</span>
            <span className="text-xs font-semibold text-slate-200">~{oceanDepth.toLocaleString()} m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
