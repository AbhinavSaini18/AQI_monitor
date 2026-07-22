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
    <div className="space-y-4 font-sans text-neutral-900">
      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Calendar className="w-4 h-4 text-neutral-700" />
            <span className="text-neutral-600 text-xs font-bold uppercase tracking-wider">Annual Avg AQI</span>
          </div>
          <p className="text-neutral-900 text-3xl font-black font-mono">135</p>
          <p className="text-amber-600 text-xs font-bold mt-1 uppercase">Poor Category</p>
        </div>
        <div className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span className="text-neutral-600 text-xs font-bold uppercase tracking-wider">Good Air Days</span>
          </div>
          <p className="text-neutral-900 text-3xl font-black font-mono">78</p>
          <p className="text-emerald-700 text-xs font-bold mt-1 uppercase">+12 vs last year</p>
        </div>
        <div className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <FileText className="w-4 h-4 text-neutral-700" />
            <span className="text-neutral-600 text-xs font-bold uppercase tracking-wider">Reports Generated</span>
          </div>
          <p className="text-neutral-900 text-3xl font-black font-mono">24</p>
          <p className="text-neutral-600 text-xs font-medium mt-1">This quarter</p>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-neutral-900 font-extrabold text-xs uppercase tracking-wider">Monthly AQI Trends — 2025</h3>
            <p className="text-neutral-500 text-xs mt-0.5 font-medium">12-month historical data</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-900 transition">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#404040', fontSize: 11 }} axisLine={{ stroke: '#d4d4d4' }} tickLine={false} />
            <YAxis tick={{ fill: '#404040', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '0px', color: '#fff', fontSize: '11px' }} />
            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
            <Line type="monotone" dataKey="aqi" stroke="#171717" strokeWidth={2.5} dot={{ r: 3 }} name="AQI" />
            <Line type="monotone" dataKey="pm25" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="PM2.5" />
            <Line type="monotone" dataKey="pm10" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="PM10" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
          <h3 className="text-neutral-900 font-extrabold text-xs uppercase tracking-wider mb-4">Standards Compliance</h3>
          <div className="space-y-4">
            {complianceData.map((c) => {
              const pct = Math.round((c.days / c.total) * 100);
              return (
                <div key={c.standard}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-neutral-800 text-xs font-extrabold uppercase">{c.standard}</span>
                    <span className="text-neutral-900 text-xs font-mono font-black">{c.days}/{c.total} days exceeded</span>
                  </div>
                  <div className="h-2.5 rounded-none bg-neutral-200 overflow-hidden border border-neutral-300">
                    <div
                      className="h-full rounded-none transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: pct > 70 ? '#ef4444' : pct > 50 ? '#f97316' : '#22c55e' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
          <h3 className="text-neutral-900 font-extrabold text-xs uppercase tracking-wider mb-4">Pollutant Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData.slice(0, 6)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#404040', fontSize: 11 }} axisLine={{ stroke: '#d4d4d4' }} tickLine={false} />
              <YAxis tick={{ fill: '#404040', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '0px', color: '#fff', fontSize: '11px' }} />
              <Bar dataKey="pm25" fill="#f97316" radius={[0, 0, 0, 0]} name="PM2.5" />
              <Bar dataKey="pm10" fill="#22c55e" radius={[0, 0, 0, 0]} name="PM10" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
