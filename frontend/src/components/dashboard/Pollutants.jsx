import React from 'react';

const POLLUTANTS = [
  { name: 'PM2.5', unit: 'µg/m³', value: 65,  status: 'Poor',     color: '#f97316', bar: '#f97316' },
  { name: 'PM10',  unit: 'µg/m³', value: 122, status: 'Poor',     color: '#f97316', bar: '#f97316' },
  { name: 'NO₂',   unit: 'µg/m³', value: 38,  status: 'Moderate', color: '#eab308', bar: '#eab308' },
  { name: 'SO₂',   unit: 'µg/m³', value: 16,  status: 'Good',     color: '#22c55e', bar: '#22c55e' },
  { name: 'CO',    unit: 'mg/m³',  value: 0.8, status: 'Good',     color: '#22c55e', bar: '#22c55e' },
  { name: 'O₃',    unit: 'µg/m³', value: 72,  status: 'Moderate', color: '#eab308', bar: '#eab308' },
];

export default function Pollutants() {
  return (
    <div className="bg-[#0d1526] border border-white/[0.07] rounded-2xl p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Key Pollutants</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Live Concentration (µg/m³)</p>
        </div>
        <button className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">View All</button>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {POLLUTANTS.map(({ name, value, status, color, bar }) => (
          <div key={name} className="flex flex-col items-center gap-1.5">
            <p className="text-[10px] text-slate-500 font-medium">{name}</p>
            <p className="font-display font-black text-xl text-white">{value}</p>
            <div
              className="px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {status}
            </div>
            {/* Colored bar */}
            <div className="w-full h-1 rounded-full mt-0.5" style={{ backgroundColor: `${bar}40` }}>
              <div className="h-full rounded-full" style={{ width: '60%', backgroundColor: bar }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}