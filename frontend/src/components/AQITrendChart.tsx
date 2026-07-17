import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { AQIDataPoint } from '../types';
import { getAQIColor } from '../utils/aqi';

interface AQITrendChartProps {
  data: AQIDataPoint[];
}

export default function AQITrendChart({ data }: AQITrendChartProps) {
  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm">AQI Trend — Today</h3>
          <p className="text-slate-500 text-xs mt-0.5">Hourly air quality index readings</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getAQIColor(143) }} /> Current
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 250]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#cbd5e1' }}
            itemStyle={{ color: '#06b6d4' }}
          />
          <ReferenceLine y={100} stroke="#eab308" strokeDasharray="4 4" strokeOpacity={0.4} />
          <ReferenceLine y={200} stroke="#f97316" strokeDasharray="4 4" strokeOpacity={0.4} />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fill="url(#aqiGradient)"
            dot={{ fill: '#06b6d4', r: 3 }}
            activeDot={{ r: 5, fill: '#22d3ee' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
