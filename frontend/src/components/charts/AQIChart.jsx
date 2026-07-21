import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const data = [
  { time: '6 AM',  aqi: 89  },
  { time: '9 AM',  aqi: 110 },
  { time: '12 PM', aqi: 143 },
  { time: '3 PM',  aqi: 185 },
  { time: '6 PM',  aqi: 210 },
  { time: '9 PM',  aqi: 195 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1526] border border-white/10 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-cyan-400">AQI {payload[0].value}</p>
    </div>
  );
};

export default function AQIChart() {
  return (
    <div className="bg-[#0d1526] border border-white/[0.07] rounded-2xl p-4 h-full">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">AQI Trend (Today)</p>
      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 300]} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fill="url(#aqiGrad)"
            dot={{ fill: '#06b6d4', strokeWidth: 0, r: 3.5 }}
            activeDot={{ fill: '#06b6d4', r: 5, strokeWidth: 2, stroke: '#0d1526' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}