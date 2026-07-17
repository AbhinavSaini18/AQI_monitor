import { ShieldAlert, Baby, Bike, Heart, Home, Wind } from 'lucide-react';
import { getHealthAdvice, getAQILevel } from '../utils/aqi';

interface AdvisoryPageProps {
  aqi: number;
}

export default function AdvisoryPage({ aqi }: AdvisoryPageProps) {
  const level = getAQILevel(aqi);
  const advice = getHealthAdvice(aqi);

  const iconMap: Record<string, typeof Baby> = {
    'General Population': Wind,
    'Sensitive Groups': Heart,
    'Children & Elderly': Baby,
    'Outdoor Workers': Bike,
  };

  const colorMap: Record<string, string> = {
    green: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300',
    yellow: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-300',
    orange: 'border-orange-500/30 bg-orange-500/5 text-orange-300',
    red: 'border-red-500/30 bg-red-500/5 text-red-300',
  };

  return (
    <div className="space-y-5">
      {/* Alert banner */}
      <div className="bg-gradient-to-r from-orange-950/40 via-slate-800/40 to-slate-900/40 rounded-2xl border border-orange-800/30 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/15 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-7 h-7 text-orange-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Health Advisory — {level} Air Quality</h3>
            <p className="text-slate-400 text-sm mt-1">
              Current AQI is {aqi}. Follow the recommendations below to protect yourself and your family.
            </p>
          </div>
        </div>
      </div>

      {/* Advisory cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {advice.map((a) => {
          const Icon = iconMap[a.group] || Home;
          return (
            <div key={a.group} className={`rounded-2xl border p-5 ${colorMap[a.icon]}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900/40 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-white font-semibold text-sm">{a.group}</h4>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{a.advice}</p>
            </div>
          );
        })}
      </div>

      {/* Protective measures */}
      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Recommended Protective Measures</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: 'Wear N95 Masks', desc: 'When outdoors, especially in high-traffic areas' },
            { title: 'Use Air Purifiers', desc: 'Keep indoor air clean, especially in bedrooms' },
            { title: 'Avoid Morning Jogging', desc: 'Pollution peaks during 6–10 AM' },
            { title: 'Keep Windows Closed', desc: 'During peak pollution hours' },
            { title: 'Stay Hydrated', desc: 'Helps your body flush toxins' },
            { title: 'Check AQI Before Going Out', desc: 'Use this dashboard for real-time data' },
          ].map((m) => (
            <div key={m.title} className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 transition">
              <p className="text-white text-sm font-semibold">{m.title}</p>
              <p className="text-slate-400 text-xs mt-1">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
