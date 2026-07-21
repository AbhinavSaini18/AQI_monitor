import { Wind, Droplets, Thermometer, Eye, Sunrise, Sunset, Gauge, Navigation } from 'lucide-react';

interface WeatherPanelProps {
  temp: number;
  humidity: number;
  windSpeed: number;
  windDir: string;
  visibility: number;
  pressure: number;
}

export default function WeatherPanel({ temp, humidity, windSpeed, windDir, visibility, pressure }: WeatherPanelProps) {
  const items = [
    { icon: Thermometer, label: 'Temperature', value: `${temp}°C`, sub: 'Feels like 22°C', color: 'text-orange-400' },
    { icon: Droplets, label: 'Humidity', value: `${humidity}%`, sub: 'Dew point 17°C', color: 'text-cyan-400' },
    { icon: Eye, label: 'Visibility', value: `${visibility} km`, sub: 'Reduced by haze', color: 'text-slate-300' },
    { icon: Gauge, label: 'Pressure', value: `${pressure} hPa`, sub: 'Stable', color: 'text-blue-400' },
  ];

  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Weather Conditions</h3>
        <span className="text-xs text-slate-500">Patiala · Live</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 transition">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-slate-500 text-xs">{item.label}</span>
              </div>
              <p className="text-white text-lg font-bold">{item.value}</p>
              <p className="text-slate-500 text-[11px]">{item.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Wind compass + sunrise/sunset row */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/40">
          <div className="relative w-16 h-16 shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-slate-700/60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Navigation
                className="w-7 h-7 text-blue-400 transition-transform duration-500"
                style={{ transform: `rotate(${windDir === 'NW' ? 315 : 0}deg)` }}
                strokeWidth={2.5}
              />
            </div>
            <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 font-bold">N</span>
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] text-slate-600 font-bold">S</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-blue-400" />
              <p className="text-white text-sm font-semibold">{windSpeed} km/h</p>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">Wind from {windDir}</p>
            <p className="text-slate-600 text-[11px]">Gusts up to 12 km/h</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40">
          <div className="flex flex-col items-center gap-1">
            <Sunrise className="w-5 h-5 text-amber-400" />
            <p className="text-white text-sm font-semibold">6:12 AM</p>
            <p className="text-slate-500 text-[11px]">Sunrise</p>
          </div>
          <div className="flex-1 mx-3 h-px bg-gradient-to-r from-amber-400/40 via-slate-600/40 to-amber-500/40 relative">
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sunset className="w-5 h-5 text-amber-500" />
            <p className="text-white text-sm font-semibold">6:48 PM</p>
            <p className="text-slate-500 text-[11px]">Sunset</p>
          </div>
        </div>
      </div>
    </div>
  );
}
