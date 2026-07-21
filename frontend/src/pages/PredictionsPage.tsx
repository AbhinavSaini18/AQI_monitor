import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, CartesianGrid } from 'recharts';
import { TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { predictionData } from '../data/mockData';
import { getAQIColor } from '../utils/aqi';

export default function PredictionsPage() {
  const peak = predictionData.reduce((max, p) => (p.aqi > max.aqi ? p : max), predictionData[0]);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 text-xs font-medium">Peak Expected</span>
          </div>
          <p className="text-white text-2xl font-bold">{peak.time}</p>
          <p className="text-orange-400 text-sm font-semibold mt-1">AQI {peak.aqi} · {peak.label}</p>
        </div>
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400 text-xs font-medium">Trend</span>
          </div>
          <p className="text-white text-2xl font-bold">Rising</p>
          <p className="text-slate-400 text-sm mt-1">Next 6 hours, then declining</p>
        </div>
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 text-xs font-medium">Improvement</span>
          </div>
          <p className="text-white text-2xl font-bold">Day 3</p>
          <p className="text-emerald-400 text-sm font-semibold mt-1">Back to Moderate</p>
        </div>
      </div>

      {/* Prediction chart */}
      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
        <div className="mb-4">
          <h3 className="text-white font-semibold text-sm">72-Hour AQI Forecast</h3>
          <p className="text-slate-500 text-xs mt-0.5">AI model confidence: 87% · Updated 2 min ago</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={predictionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 250]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: '#cbd5e1' }}
            />
            <ReferenceArea y1={200} y2={250} fill="#ef4444" fillOpacity={0.08} />
            <ReferenceArea y1={100} y2={200} fill="#f97316" fillOpacity={0.08} />
            <ReferenceArea y1={0} y2={100} fill="#22c55e" fillOpacity={0.05} />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ fill: '#06b6d4', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Hourly Forecast</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {predictionData.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40">
                <span className="text-slate-300 text-sm">{p.time}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs">{p.label}</span>
                  <span className="text-white font-bold text-sm" style={{ color: getAQIColor(p.aqi) }}>{p.aqi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Model Insights</h3>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 rounded-xl bg-slate-900/40">
              <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-xs font-semibold">Inversion Layer Persisting</p>
                <p className="text-slate-400 text-xs mt-1">Temperature inversion expected to break by tomorrow 10 AM, improving dispersion.</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-xl bg-slate-900/40">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-xs font-semibold">Wind Shift Expected</p>
                <p className="text-slate-400 text-xs mt-1">Wind direction change from NW to SE tomorrow will reduce stubble smoke transport.</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-xl bg-slate-900/40">
              <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-xs font-semibold">Rain Forecast Day 3</p>
                <p className="text-slate-400 text-xs mt-1">Light rainfall expected to wash out suspended particulates, dropping AQI below 100.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
