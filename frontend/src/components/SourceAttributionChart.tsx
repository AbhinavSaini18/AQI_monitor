import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { SourceAttribution } from '../types';

interface SourceAttributionChartProps {
  data: SourceAttribution[];
}

export default function SourceAttributionChart({ data }: SourceAttributionChartProps) {
  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-sm">Source Attribution</h3>
        <p className="text-slate-500 text-xs mt-0.5">AI-identified pollution sources</p>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="50%" height={160}>
          <PieChart>
            <Pie
              data={data}
              dataKey="percentage"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={70}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value}%`, 'Contribution']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2.5">
          {data.map((src) => (
            <div key={src.name} className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: src.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 text-xs font-medium truncate">{src.name}</p>
                <p className="text-white text-sm font-bold">{src.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
