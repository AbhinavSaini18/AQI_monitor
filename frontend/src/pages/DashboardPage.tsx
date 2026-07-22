import { useEffect, useState } from 'react';
import { ShieldAlert, Wind, Thermometer, Droplets, MapPin, Activity } from 'lucide-react';
import LiveMap from '../components/map/LiveMap';
import { LiveAQIResponse, LiveWeatherResponse, fetchGridLiveAQI, fetchAttribution } from '../utils/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DashboardPageProps {
  selectedGridId: string | null;
  onSelectGrid: (id: string | null) => void;
  liveAQI: LiveAQIResponse | null;
  liveWeather: LiveWeatherResponse | null;
}

const POLLUTANT_LIMITS = {
  pm25: 60,
  pm10: 100,
  no2: 80,
  so2: 80,
  co: 4,
  o3: 100
};

export default function DashboardPage({ selectedGridId, onSelectGrid, liveAQI, liveWeather }: DashboardPageProps) {
  const [gridAqi, setGridAqi] = useState<LiveAQIResponse | null>(null);
  const [attribution, setAttribution] = useState<{name: string, value: number}[]>([]);

  useEffect(() => {
    if (selectedGridId) {
      fetchGridLiveAQI(selectedGridId).then(data => setGridAqi(data));
      
      fetchAttribution(selectedGridId).then(data => {
        if (data && data.attribution && typeof data.attribution !== 'string') {
          const formatted = Object.entries(data.attribution).map(([key, val]) => ({
            name: key.replace(/_/g, ' ').toUpperCase(),
            value: val
          }));
          setAttribution(formatted);
        } else {
          setAttribution([]);
        }
      });
    } else {
      setGridAqi(null);
      setAttribution([]);
    }
  }, [selectedGridId]);

  const displayAqi = gridAqi || liveAQI;

  const getAqiLevel = (val: number) => {
    if (val <= 50) return { label: 'GOOD', color: 'bg-green-500', text: 'text-green-500' };
    if (val <= 100) return { label: 'SATISFACTORY', color: 'bg-yellow-500', text: 'text-yellow-600' };
    if (val <= 200) return { label: 'MODERATE', color: 'bg-orange-500', text: 'text-orange-600' };
    if (val <= 300) return { label: 'POOR', color: 'bg-red-500', text: 'text-red-600' };
    if (val <= 400) return { label: 'VERY POOR', color: 'bg-purple-600', text: 'text-purple-600' };
    return { label: 'SEVERE', color: 'bg-red-800', text: 'text-red-800' };
  };

  const aqiInfo = displayAqi ? getAqiLevel(displayAqi.aqi) : { label: 'UNKNOWN', color: 'bg-neutral-500', text: 'text-neutral-500' };

  const COLORS = ['#171717', '#525252', '#737373', '#a3a3a3', '#d4d4d4'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-6rem)]">
      
      {/* LEFT COLUMN */}
      <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
        {/* Current AQI Card */}
        <div className="bg-white border border-neutral-300 p-6 shadow-sm rounded-none">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">CURRENT AIR QUALITY</h2>
          <div className="flex flex-col items-center">
            <span className={`text-6xl font-black ${aqiInfo.text} mb-2`}>{displayAqi ? displayAqi.aqi : '--'}</span>
            <span className="text-xl font-bold uppercase tracking-widest text-neutral-900 mb-6">{aqiInfo.label}</span>
            <div className="w-full bg-neutral-100 p-4 border border-neutral-200">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-bold text-neutral-600 uppercase">DOMINANT POLLUTANT</span>
                <span className="font-bold text-neutral-900 uppercase">{displayAqi?.dominant_pollutant || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pollutants List */}
        <div className="bg-white border border-neutral-300 p-6 shadow-sm rounded-none flex-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">POLLUTANTS</h2>
          <div className="space-y-4">
            {displayAqi?.pollutants && Object.entries(displayAqi.pollutants).map(([key, val]) => {
              const limit = POLLUTANT_LIMITS[key.toLowerCase() as keyof typeof POLLUTANT_LIMITS] || 100;
              const percent = Math.min(100, (val / limit) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs font-bold uppercase mb-1">
                    <span>{key}</span>
                    <span>{val.toFixed(1)} <span className="text-neutral-500 font-normal">µg/m³</span></span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 rounded-none overflow-hidden">
                    <div 
                      className="h-full bg-neutral-900 rounded-none transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advisory */}
        <div className="bg-white border border-neutral-300 p-6 shadow-sm rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-neutral-900" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">HEALTH ADVISORY</h2>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed font-medium">
            {displayAqi 
              ? (
                  displayAqi.aqi <= 50 ? "Air quality is satisfactory, and air pollution poses little or no risk. Ideal for outdoor activities." :
                  displayAqi.aqi <= 100 ? "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution." :
                  displayAqi.aqi <= 150 ? "Members of sensitive groups may experience health effects. The general public is less likely to be affected." :
                  displayAqi.aqi <= 200 ? "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects." :
                  displayAqi.aqi <= 300 ? "Health alert: The risk of health effects is increased for everyone. Avoid prolonged outdoor exertion." :
                  "Health warning of emergency conditions: everyone is more likely to be affected. Remain indoors and keep activity levels low."
                )
              : "Select a grid to view specific health advisories."}
          </p>
        </div>
      </div>

      {/* CENTER COLUMN */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="flex-1 bg-white border border-neutral-300 shadow-sm relative rounded-none p-1">
          <LiveMap selectedGridId={selectedGridId} onSelectGrid={onSelectGrid} />
        </div>
        <div className="bg-white border border-neutral-300 p-4 shadow-sm rounded-none flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">TIMELINE</span>
            <div className="flex gap-2">
                <button className="px-4 py-1 border border-neutral-300 text-xs font-bold text-neutral-500 hover:bg-neutral-100 rounded-none uppercase">YESTERDAY</button>
                <button className="px-4 py-1 bg-neutral-900 text-white text-xs font-bold rounded-none uppercase">TODAY</button>
                <button className="px-4 py-1 border border-neutral-300 text-xs font-bold text-neutral-500 hover:bg-neutral-100 rounded-none uppercase">TOMORROW</button>
            </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
        {/* Location Info */}
        <div className="bg-white border border-neutral-300 p-6 shadow-sm rounded-none">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> LOCATION INFO
          </h2>
          {selectedGridId ? (
             <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-500 uppercase">SELECTED LOCATION</div>
                <div className="font-mono text-sm font-bold bg-neutral-100 p-2 border border-neutral-200">{displayAqi?.station_name || selectedGridId}</div>
                <div className="text-[10px] text-neutral-400 font-mono uppercase">ID: {selectedGridId}</div>
             </div>
          ) : (
             <p className="text-sm text-neutral-500 italic">Select a region on the map for local insights.</p>
          )}
        </div>

        {/* Source Attribution */}
        <div className="bg-white border border-neutral-300 p-6 shadow-sm rounded-none min-h-[300px] flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4" /> SOURCE ATTRIBUTION
          </h2>
          {attribution.length > 0 ? (
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {attribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '0', border: '1px solid #d4d4d4', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}
                    itemStyle={{ color: '#171717' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-neutral-400 font-medium">
              NO DATA AVAILABLE
            </div>
          )}
        </div>

        {/* Weather Conditions */}
        <div className="bg-white border border-neutral-300 p-6 shadow-sm rounded-none">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-2">
            <Wind className="w-4 h-4" /> WEATHER
          </h2>
          {liveWeather ? (
             <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-1"><Thermometer className="w-3 h-3"/> TEMP</span>
                    <span className="text-xl font-bold">{liveWeather.temperature.toFixed(1)}°C</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-1"><Droplets className="w-3 h-3"/> HUMIDITY</span>
                    <span className="text-xl font-bold">{liveWeather.humidity.toFixed(0)}%</span>
                </div>
                <div className="flex flex-col col-span-2 mt-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase">WIND</span>
                    <span className="text-md font-bold">{liveWeather.wind_speed.toFixed(1)} km/h • {liveWeather.wind_direction}°</span>
                </div>
             </div>
          ) : (
              <span className="text-sm text-neutral-400 font-medium">LOADING...</span>
          )}
        </div>

        {/* AI Analysis */}
        <div className="bg-neutral-900 border border-neutral-900 text-white p-6 shadow-sm rounded-none">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> AI ANALYSIS
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Current data indicates stabilized pollutant levels across the metropolitan area. Temperature inversion likely to increase PM2.5 concentration during evening hours.
          </p>
        </div>

      </div>

    </div>
  );
}
