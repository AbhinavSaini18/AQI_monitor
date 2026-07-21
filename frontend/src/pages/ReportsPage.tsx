import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { FileText, Download, Calendar, TrendingDown } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', aqi: 210, pm25: 95, pm10: 180 },
  { month: 'Feb', aqi: 185, pm25: 82, pm10: 160 },
  { month: 'Mar', aqi: 145, pm25: 60, pm10: 120 },
  { month: 'Apr', aqi: 110, pm25: 45, pm10: 90 },
  { month: 'May', aqi: 85, pm25: 35, pm10: 70 },
  { month: 'Jun', aqi: 60, pm25: 25, pm10: 50 },
  { month: 'Jul', aqi: 55, pm25: 22, pm10: 45 },
  { month: 'Aug', aqi: 70, pm25: 28, pm10: 58 },
  { month: 'Sep', aqi: 95, pm25: 40, pm10: 80 },
  { month: 'Oct', aqi: 165, pm25: 72, pm10: 140 },
  { month: 'Nov', aqi: 230, pm25: 105, pm10: 200 },
  { month: 'Dec', aqi: 215, pm25: 98, pm10: 185 },
];

const complianceData = [
  { standard: 'WHO PM2.5 (15)', days: 287, total: 365 },
  { standard: 'WHO PM10 (45)', days: 310, total: 365 },
  { standard: 'NAAQ PM2.5 (40)', days: 245, total: 365 },
  { standard: 'NAAQ PM10 (60)', days: 198, total: 365 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 text-xs font-medium">Annual Average AQI</span>
          </div>
          <p className="text-white text-3xl font-bold">135</p>
          <p className="text-orange-400 text-sm mt-1">Poor category</p>
        </div>
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 text-xs font-medium">Good Air Days</span>
          </div>
          <p className="text-white text-3xl font-bold">78</p>
          <p className="text-emerald-400 text-sm mt-1">+12 vs last year</p>
        </div>
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400 text-xs font-medium">Reports Generated</span>
          </div>
          <p className="text-white text-3xl font-bold">24</p>
          <p className="text-slate-400 text-sm mt-1">This quarter</p>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-sm">Monthly AQI Trends — 2025</h3>
            <p className="text-slate-500 text-xs mt-0.5">12-month historical data</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 text-xs font-medium hover:bg-cyan-500/25 transition">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="aqi" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} name="AQI" />
            <Line type="monotone" dataKey="pm25" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="PM2.5" />
            <Line type="monotone" dataKey="pm10" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="PM10" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Standards Compliance</h3>
          <div className="space-y-4">
            {complianceData.map((c) => {
              const pct = Math.round((c.days / c.total) * 100);
              return (
                <div key={c.standard}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-300 text-xs font-medium">{c.standard}</span>
                    <span className="text-white text-xs font-bold">{c.days}/{c.total} days exceeded</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-900/60 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: pct > 70 ? '#ef4444' : pct > 50 ? '#f97316' : '#22c55e' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Pollutant Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData.slice(0, 6)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }} cursor={{ fill: '#33415540' }} />
              <Bar dataKey="pm25" fill="#f97316" radius={[4, 4, 0, 0]} name="PM2.5" />
              <Bar dataKey="pm10" fill="#22c55e" radius={[4, 4, 0, 0]} name="PM10" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
