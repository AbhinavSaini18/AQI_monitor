import { AlertTriangle, TrendingUp, Activity, Gauge } from 'lucide-react';
import { getAQIColor, getAQILevel, getAQIDescription } from '../utils/aqi';

interface CurrentAQIPanelProps {
  aqi: number;
  city: string;
  trend: number;
}

export default function CurrentAQIPanel({ aqi, city, trend }: CurrentAQIPanelProps) {
  const color = getAQIColor(aqi);
  const level = getAQILevel(aqi);
  const description = getAQIDescription(aqi);
  const trendUp = trend > 0;
  const ringPct = Math.min(100, (aqi / 300) * 100);
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (ringPct / 100) * circumference;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 p-6">
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-25 blur-3xl animate-breathe"
        style={{ backgroundColor: color }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-slate-400 text-sm font-medium">Current AQI · {city}</p>
            <p className="text-slate-500 text-xs mt-0.5">Connaught Place Station · Live</p>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-xs font-bold border"
            style={{ color, borderColor: color + '50', backgroundColor: color + '15' }}
          >
            {level}
          </div>
        </div>

        {/* Circular gauge */}
        <div className="flex items-center justify-center my-4 relative">
          <svg width="140" height="140" className="-rotate-90">
            <circle cx="70" cy="70" r="52" fill="none" stroke="#1e293b" strokeWidth="8" />
            <circle
              cx="70"
              cy="70"
              r="52"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-5xl font-bold text-white animate-count-glow"
              style={{ color, textShadow: `0 0 30px ${color}60` }}
            >
              {aqi}
            </span>
            <span className="text-slate-500 text-[10px] font-medium tracking-widest mt-1">AQI INDEX</span>
          </div>
        </div>

        {/* Trend pill */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              trendUp ? 'bg-orange-500/15 text-orange-300' : 'bg-emerald-500/15 text-emerald-300'
            }`}
          >
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
            {trendUp ? '+' : ''}{trend} in last hour
          </span>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/50">
          <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
          <p className="text-slate-300 text-xs leading-relaxed">{description}</p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 rounded-lg bg-slate-900/40">
            <Activity className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <p className="text-slate-500 text-[10px]">Dominant</p>
            <p className="text-white text-sm font-semibold">PM2.5</p>
          </div>
          <div className="text-center p-2.5 rounded-lg bg-slate-900/40">
            <Gauge className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-slate-500 text-[10px]">Confidence</p>
            <p className="text-white text-sm font-semibold">High</p>
          </div>
          <div className="text-center p-2.5 rounded-lg bg-slate-900/40">
            <div className="flex items-center justify-center mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-slate-500 text-[10px]">Sensors</p>
            <p className="text-white text-sm font-semibold">24/24</p>
          </div>
        </div>
      </div>
    </div>
  );
}
