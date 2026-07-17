import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';

const data = [
  { name: 'Crop Burning Smoke', value: 35, color: '#22c55e' },
  { name: 'Traffic',            value: 30, color: '#06b6d4' },
  { name: 'Inversion/Weather',  value: 25, color: '#3b82f6' },
  { name: 'Construction Dust',  value: 10, color: '#6b7280' },
];

export default function AttributionCard() {
  return (
    <div className="bg-[#0d1526] border border-white/[0.07] rounded-2xl p-4 flex-1 flex flex-col">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Source Attribution</p>

      {/* Donut chart */}
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={58}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-col gap-1.5">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[11px] text-slate-400 leading-tight">{name}</span>
            </div>
            <span className="text-[11px] font-bold text-slate-300 ml-1">{value}%</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06]">
        <p className="text-[10px] text-slate-500">
          Attribution Confidence: <span className="text-slate-300 font-semibold">89%</span>
        </p>
        <button className="text-slate-500 hover:text-slate-300 transition-colors">
          <Info size={12} />
        </button>
      </div>
    </div>
  );
}