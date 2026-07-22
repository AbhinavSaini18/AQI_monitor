import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { sourceAttributions as mockSourceAttributions } from '../data/mockData';
import { Flame, Car, Cloud, Building2, Search, Loader2 } from 'lucide-react';
import { fetchAttribution } from '../utils/api';

const defaultSourceDetails = [
  {
    icon: Flame,
    name: 'Crop Burning Smoke',
    pct: 35,
    color: '#34d399',
    detail: 'Satellite imagery detected active fire counts in neighboring agricultural regions. NW winds transporting smoke into the grid.',
    action: 'Coordinate with state agricultural department for stubble management incentives.',
  },
  {
    icon: Car,
    name: 'Vehicular Traffic',
    pct: 30,
    color: '#60a5fa',
    detail: 'NOx and PM emissions from diesel vehicles concentrated along major arterials in cell sector.',
    action: 'Implement traffic rationing and promote public transit on high-AQI days.',
  },
  {
    icon: Cloud,
    name: 'Inversion / Weather',
    pct: 25,
    color: '#94a3b8',
    detail: 'Low-level temperature inversion is trapping pollutants near the surface, preventing dispersion.',
    action: 'Issue pollution alerts and activate emergency response protocols.',
  },
  {
    icon: Building2,
    name: 'Construction Dust',
    pct: 10,
    color: '#cbd5e1',
    detail: 'Uncovered construction sites and road dust contribute to coarse particulate matter (PM10).',
    action: 'Enforce dust suppression measures at active construction sites.',
  },
];

const defaultHourlyBySource = [
  { time: '6 AM', crop: 30, traffic: 20, weather: 15, dust: 5 },
  { time: '9 AM', crop: 35, traffic: 35, weather: 20, dust: 8 },
  { time: '12 PM', crop: 40, traffic: 30, weather: 25, dust: 10 },
  { time: '3 PM', crop: 38, traffic: 28, weather: 30, dust: 7 },
  { time: '6 PM', crop: 42, traffic: 40, weather: 28, dust: 9 },
  { time: '9 PM', crop: 35, traffic: 25, weather: 22, dust: 6 },
];

interface AttributionPageProps {
  gridId?: string | null;
  onSelectGrid?: (gridId: string) => void;
}

export default function AttributionPage({ gridId, onSelectGrid }: AttributionPageProps) {
  const currentGridId = gridId || 'grid_105_3008';
  const [inputGridId, setInputGridId] = useState(currentGridId);
  const [sourceData, setSourceData] = useState<Array<{ name: string; percentage: number; color: string }>>(mockSourceAttributions);
  const [sourceDetails, setSourceDetails] = useState(defaultSourceDetails);
  const [loading, setLoading] = useState(true);
  const [isLiveData, setIsLiveData] = useState(false);

  useEffect(() => {
    setInputGridId(currentGridId);
    let isMounted = true;
    setLoading(true);

    fetchAttribution(currentGridId)
      .then((res) => {
        if (!isMounted) return;

        if (res && res.attribution) {
          let parsedData: Array<{ name: string; percentage: number; color: string }> = [];

          if (typeof res.attribution === 'object' && res.attribution !== null) {
            const colors = ['#34d399', '#60a5fa', '#94a3b8', '#cbd5e1', '#f59e0b'];
            let idx = 0;
            const newDetails = [];
            for (const [key, val] of Object.entries(res.attribution)) {
              const formattedName = key.replace(/_/g, ' ').toUpperCase();
              const pct = typeof val === 'number' ? Math.max(0, val) : 0;
              parsedData.push({
                name: formattedName,
                percentage: pct,
                color: colors[idx % colors.length],
              });
              
              let icon = Cloud;
              if (key === 'crop_burning') icon = Flame;
              else if (key === 'traffic') icon = Car;
              else if (key === 'construction') icon = Building2;
              else if (key === 'industrial') icon = Building2;
              
              newDetails.push({
                icon,
                name: formattedName,
                pct,
                color: colors[idx % colors.length],
                detail: `Satellite and sensor data indicates this source contributes ${pct}% of the pollutant load in this grid sector.`,
                action: 'Automated response protocol and targeted mitigation recommended.'
              });
              idx++;
            }
            setSourceDetails(newDetails);
          }

          if (parsedData.length > 0) {
            setSourceData(parsedData);
            setIsLiveData(true);
          } else {
            setSourceData(mockSourceAttributions);
            setSourceDetails(defaultSourceDetails);
            setIsLiveData(false);
          }
        } else {
          setSourceData(mockSourceAttributions);
          setSourceDetails(defaultSourceDetails);
          setIsLiveData(false);
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setSourceData(mockSourceAttributions);
          setSourceDetails(defaultSourceDetails);
          setIsLiveData(false);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentGridId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputGridId.trim() && onSelectGrid) {
      onSelectGrid(inputGridId.trim());
    }
  };

  return (
    <div className="space-y-4 font-sans text-neutral-900">
      {/* Target Grid Header */}
      <div className="bg-white rounded-none border border-neutral-300 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-neutral-900 font-extrabold text-xs uppercase tracking-wider">Source Sector:</h3>
            <span className="px-2 py-0.5 rounded-none bg-neutral-800 text-white font-mono font-bold text-xs uppercase">
              {currentGridId}
            </span>
            <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase ${isLiveData ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-neutral-200 text-neutral-800 border border-neutral-300'}`}>
              {isLiveData ? 'Live Attribution Data' : 'Demo Attribution Data'}
            </span>
          </div>
          <p className="text-neutral-600 text-xs mt-1 font-medium">
            Analyzing source contribution vectors for targeted 1km spatial polygon.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={inputGridId}
            onChange={(e) => setInputGridId(e.target.value)}
            placeholder="e.g. grid_105_3008"
            className="px-3 py-1.5 rounded-none bg-neutral-100 border border-neutral-300 text-xs text-neutral-900 font-medium placeholder:text-neutral-500 focus:outline-none focus:bg-white"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider transition"
          >
            <Search className="w-3.5 h-3.5" /> Load
          </button>
        </form>
      </div>

      {/* Donut + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-neutral-900 font-extrabold text-xs uppercase tracking-wider">Source Breakdown</h3>
            {loading && <Loader2 className="w-4 h-4 text-neutral-600 animate-spin" />}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sourceData} dataKey="percentage" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} stroke="none">
                {sourceData.map((e) => (
                  <Cell key={e.name} fill={e.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#171717', border: 'none', color: '#fff', fontSize: '11px', borderRadius: '0px' }}
                formatter={(v) => [`${v}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
          <h3 className="text-neutral-900 font-extrabold text-xs uppercase tracking-wider mb-3">Hourly Contribution by Source</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={defaultHourlyBySource} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#404040', fontSize: 11 }} axisLine={{ stroke: '#d4d4d4' }} tickLine={false} />
              <YAxis tick={{ fill: '#404040', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#171717', border: 'none', color: '#fff', fontSize: '11px', borderRadius: '0px' }}
              />
              <Bar dataKey="crop" stackId="a" fill="#34d399" />
              <Bar dataKey="traffic" stackId="a" fill="#60a5fa" />
              <Bar dataKey="weather" stackId="a" fill="#94a3b8" />
              <Bar dataKey="dust" stackId="a" fill="#cbd5e1" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source detail cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sourceDetails.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.name} className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-none bg-neutral-100 border border-neutral-300 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-neutral-800" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-neutral-900 font-extrabold text-xs uppercase">{s.name}</h4>
                    <span className="text-base font-black font-mono text-neutral-900">{s.pct}%</span>
                  </div>
                  <p className="text-neutral-600 text-xs mt-1 leading-relaxed font-medium">{s.detail}</p>
                </div>
              </div>
              <div className="mt-3 p-2.5 bg-neutral-100 border-l-2 border-neutral-800 text-xs text-neutral-800">
                <span className="font-bold uppercase">Recommended action: </span>
                {s.action}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
