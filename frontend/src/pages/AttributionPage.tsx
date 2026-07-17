import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { sourceAttributions } from '../data/mockData';
import { Flame, Car, Cloud, Building2 } from 'lucide-react';

const sourceDetails = [
  {
    icon: Flame,
    name: 'Crop Burning Smoke',
    pct: 35,
    color: '#22c55e',
    detail: 'Satellite imagery detected 142 active fire counts in neighboring agricultural regions. NW winds are transporting smoke into the city.',
    action: 'Coordinate with state agricultural department for stubble management incentives.',
  },
  {
    icon: Car,
    name: 'Vehicular Traffic',
    pct: 30,
    color: '#06b6d4',
    detail: 'NOx and PM emissions from diesel vehicles concentrated along major arterials during peak hours.',
    action: 'Implement odd-even scheme and promote public transit on high-AQI days.',
  },
  {
    icon: Cloud,
    name: 'Inversion / Weather',
    pct: 25,
    color: '#3b82f6',
    detail: 'Low-level temperature inversion is trapping pollutants near the surface, preventing dispersion.',
    action: 'Issue pollution alerts and activate emergency response protocols.',
  },
  {
    icon: Building2,
    name: 'Construction Dust',
    pct: 10,
    color: '#6b7280',
    detail: 'Uncovered construction sites and road dust contribute to coarse particulate matter (PM10).',
    action: 'Enforce dust suppression measures at active construction sites.',
  },
];

const hourlyBySource = [
  { time: '6 AM', crop: 30, traffic: 20, weather: 15, dust: 5 },
  { time: '9 AM', crop: 35, traffic: 35, weather: 20, dust: 8 },
  { time: '12 PM', crop: 40, traffic: 30, weather: 25, dust: 10 },
  { time: '3 PM', crop: 38, traffic: 28, weather: 30, dust: 7 },
  { time: '6 PM', crop: 42, traffic: 40, weather: 28, dust: 9 },
  { time: '9 PM', crop: 35, traffic: 25, weather: 22, dust: 6 },
];

export default function AttributionPage() {
  return (
    <div className="space-y-5">
      {/* Donut + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Source Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sourceAttributions} dataKey="percentage" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} stroke="none">
                {sourceAttributions.map((e) => (
                  <Cell key={e.name} fill={e.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(v) => [`${v}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Hourly Contribution by Source</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyBySource} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                cursor={{ fill: '#33415540' }}
              />
              <Bar dataKey="crop" stackId="a" fill="#22c55e" />
              <Bar dataKey="traffic" stackId="a" fill="#06b6d4" />
              <Bar dataKey="weather" stackId="a" fill="#3b82f6" />
              <Bar dataKey="dust" stackId="a" fill="#6b7280" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source detail cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sourceDetails.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.name} className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + '20' }}>
                  <Icon className="w-6 h-6" style={{ color: s.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold text-sm">{s.name}</h4>
                    <span className="text-lg font-bold" style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{s.detail}</p>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-xl bg-slate-900/40 border-l-2" style={{ borderColor: s.color }}>
                <p className="text-slate-300 text-xs">
                  <span className="font-semibold text-white">Recommended action: </span>
                  {s.action}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
