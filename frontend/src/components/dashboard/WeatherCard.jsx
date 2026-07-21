import React from 'react';

const params = [
  { label: 'Humidity',   value: '62%',     color: 'text-slate-200' },
  { label: 'Wind',       value: '14 km/h',  color: 'text-slate-200' },
  { label: 'Feels Like', value: '33°C',    color: 'text-slate-200' },
  { label: 'UV Index',   value: 'High',    color: 'text-red-400' },
];

export default function WeatherCard() {
  return (
    <div className="bg-[#0d1526] border border-white/[0.07] rounded-2xl p-4 h-full flex flex-col">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Weather</p>

      {/* Main temp */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-12 h-12 flex-shrink-0">
          {/* Glow */}
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-lg" />
          {/* Sun SVG */}
          <svg viewBox="0 0 48 48" className="w-12 h-12 spin-slow relative z-10" fill="none">
            <circle cx="24" cy="24" r="10" fill="#fbbf24" />
            {[0,45,90,135,180,225,270,315].map((deg, i) => (
              <line
                key={i}
                x1="24" y1="5" x2="24" y2="10"
                stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"
                transform={`rotate(${deg} 24 24)`}
              />
            ))}
          </svg>
        </div>
        <div>
          <p className="font-display font-black text-3xl text-white">31°C</p>
          <p className="text-sm text-amber-400 font-medium">Sunny</p>
        </div>
      </div>

      {/* Params table */}
      <div className="flex flex-col gap-2 flex-1">
        {params.map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{label}</span>
            <span className={`text-xs font-semibold ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}