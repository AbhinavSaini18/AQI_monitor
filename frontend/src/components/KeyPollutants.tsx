import type { Pollutant } from '../types';
import { getAQIColor } from '../utils/aqi';

interface KeyPollutantsProps {
  pollutants: Pollutant[];
}

export default function KeyPollutants({ pollutants }: KeyPollutantsProps) {
  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Key Pollutants</h3>
        <span className="text-xs text-slate-500">Real-time</span>
      </div>
      <div className="space-y-3">
        {pollutants.map((p) => {
          const color = getAQIColor(
            p.name === 'PM2.5' ? p.value * 2.2 :
            p.name === 'PM10' ? p.value :
            p.name === 'NO₂' ? p.value * 1.9 :
            p.name === 'O₃' ? p.value :
            p.name === 'SO₂' ? p.value * 3.5 :
            p.value * 100
          );
          return (
            <div key={p.name} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-300 text-sm font-medium">{p.name}</span>
                  <span className="text-white text-sm font-bold">
                    {p.value} <span className="text-slate-500 text-xs font-normal">{p.unit}</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-900/60 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, (p.value / (p.name === 'CO' ? 2 : p.name === 'PM10' ? 200 : 100)) * 100)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
