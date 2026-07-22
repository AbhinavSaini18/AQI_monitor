import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, CartesianGrid } from 'recharts';
import { TrendingUp, Clock, AlertCircle, CheckCircle, Search, Loader2 } from 'lucide-react';
import { fetchPredictionDetails, PredictionDetail } from '../utils/api';
import { getAQIColor, getAQILevel } from '../utils/aqi';
import { predictionData as mockPredictions } from '../data/mockData';

interface PredictionsPageProps {
  gridId?: string | null;
  onSelectGrid?: (gridId: string) => void;
}

export default function PredictionsPage({ gridId, onSelectGrid }: PredictionsPageProps) {
  const currentGridId = gridId || 'grid_105_3008';
  const [inputGridId, setInputGridId] = useState(currentGridId);
  const [predictions, setPredictions] = useState<Array<{ time: string; aqi: number; label: string; confidence?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveData, setIsLiveData] = useState(false);

  useEffect(() => {
    setInputGridId(currentGridId);
    let isMounted = true;
    setLoading(true);

    fetchPredictionDetails(currentGridId)
      .then((data: PredictionDetail[]) => {
        if (!isMounted) return;

        if (data && data.length > 0) {
          const formatted = data.map((item) => {
            let timeStr = item.target_timestamp;
            try {
              const d = new Date(item.target_timestamp);
              if (!isNaN(d.getTime())) {
                timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
            } catch (e) {
              // keep string
            }

            return {
              time: timeStr,
              aqi: item.predicted_aqi,
              label: getAQILevel(item.predicted_aqi),
              confidence: item.confidence_score,
            };
          });

          setPredictions(formatted);
          setIsLiveData(true);
        } else {
          setPredictions(mockPredictions);
          setIsLiveData(false);
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setPredictions(mockPredictions);
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

  const activeData = predictions.length > 0 ? predictions : mockPredictions;
  const peak = activeData.reduce((max, p) => (p.aqi > max.aqi ? p : max), activeData[0] || { time: 'N/A', aqi: 0, label: 'Good' });

  return (
    <div className="space-y-4 font-sans text-neutral-900">
      {/* Target Grid Header */}
      <div className="bg-white rounded-none border border-neutral-300 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-neutral-900 font-extrabold text-xs uppercase tracking-wider">Target Sector:</h3>
            <span className="px-2 py-0.5 rounded-none bg-neutral-800 text-white font-mono font-bold text-xs uppercase">
              {currentGridId}
            </span>
            <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase ${isLiveData ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-neutral-200 text-neutral-800 border border-neutral-300'}`}>
              {isLiveData ? 'Live API Data' : 'Demo Grid Matrix'}
            </span>
          </div>
          <p className="text-neutral-600 text-xs mt-1 font-medium">
            AI-generated AQI multi-horizon forecasts for target spatial cell.
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className="w-4 h-4 text-neutral-600" />
            <span className="text-neutral-600 text-xs font-bold uppercase tracking-wider">Peak Expected</span>
          </div>
          <p className="text-neutral-900 text-2xl font-black font-mono">{peak.time}</p>
          <p className="text-amber-600 text-xs font-bold mt-1 uppercase">AQI {peak.aqi} · {peak.label}</p>
        </div>
        <div className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingUp className="w-4 h-4 text-neutral-600" />
            <span className="text-neutral-600 text-xs font-bold uppercase tracking-wider">Forecast Trend</span>
          </div>
          <p className="text-neutral-900 text-2xl font-black font-mono">XGBoost</p>
          <p className="text-neutral-600 text-xs font-medium mt-1">{activeData.length} multi-horizon vectors</p>
        </div>
        <div className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-neutral-600 text-xs font-bold uppercase tracking-wider">Model Status</span>
          </div>
          <p className="text-neutral-900 text-2xl font-black font-mono">Verified</p>
          <p className="text-emerald-700 text-xs font-bold mt-1 uppercase">Floored (&ge; 0 AQI)</p>
        </div>
      </div>

      {/* Prediction chart */}
      <div className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-neutral-900 font-extrabold text-xs uppercase tracking-wider">AQI Forecast Timeline ({currentGridId})</h3>
            <p className="text-neutral-500 text-xs mt-0.5 font-medium">Regression outputs from PostGIS `ai_predictions` table</p>
          </div>
          {loading && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-600">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#404040', fontSize: 11 }} axisLine={{ stroke: '#d4d4d4' }} tickLine={false} />
            <YAxis tick={{ fill: '#404040', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#171717', border: 'none', color: '#fff', borderRadius: '0px', fontSize: '11px' }}
              labelStyle={{ color: '#e5e5e5' }}
            />
            <ReferenceArea y1={200} y2={500} fill="#ef4444" fillOpacity={0.08} />
            <ReferenceArea y1={100} y2={200} fill="#f97316" fillOpacity={0.08} />
            <ReferenceArea y1={0} y2={100} fill="#22c55e" fillOpacity={0.05} />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#171717"
              strokeWidth={3}
              dot={{ fill: '#171717', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
          <h3 className="text-neutral-900 font-extrabold text-xs uppercase tracking-wider mb-3">Forecast Vectors</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {activeData.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-none bg-neutral-100 border border-neutral-200">
                <span className="text-neutral-800 text-xs font-mono font-bold">{p.time}</span>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500 text-[10px] uppercase font-bold">{p.label}</span>
                  <span className="text-neutral-900 font-mono font-black text-sm" style={{ color: getAQIColor(p.aqi) }}>{p.aqi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-none border border-neutral-300 p-4 shadow-sm">
          <h3 className="text-neutral-900 font-extrabold text-xs uppercase tracking-wider mb-3">Model Safeguards</h3>
          <div className="space-y-2.5">
            <div className="flex gap-3 p-3 rounded-none bg-neutral-100 border border-neutral-200">
              <AlertCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-neutral-900 text-xs font-bold uppercase">Non-Negative Value Floor</p>
                <p className="text-neutral-600 text-xs mt-0.5 font-medium">Strict `max(0, prediction)` validation applied to filter unconstrained regression numbers.</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-none bg-neutral-100 border border-neutral-200">
              <AlertCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-neutral-900 text-xs font-bold uppercase">PostGIS Ward Alignment</p>
                <p className="text-slate-600 text-xs mt-0.5 font-medium">Queries `ai_predictions` indexed by 1km polygon ID ({currentGridId}).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
