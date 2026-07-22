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

  return (
    <div className="space-y-4 font-sans text-neutral-900">
      
      {/* Alert Banner (High Contrast Dark Box with Crisp White Text) */}
      <div className="bg-neutral-800 border border-neutral-900 rounded-none p-5 text-white shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-none bg-amber-500/20 border border-amber-500 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Health Advisory — {level} Air Quality (AQI {aqi})
            </h3>
            <p className="text-neutral-300 text-xs font-medium mt-1 leading-relaxed">
              Current recorded AQI is <span className="font-bold text-white font-mono">{aqi} ({level})</span>. Follow the target health guidance below for protective compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Advisory Cards (Sharp White Cards with Dark High Contrast Text) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {advice.map((a) => {
          const Icon = iconMap[a.group] || Home;
          return (
            <div key={a.group} className="bg-white border border-neutral-300 rounded-none p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-none bg-neutral-100 border border-neutral-300 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-neutral-800" />
                  </div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wide text-neutral-900">{a.group}</h4>
                </div>
                <p className="text-neutral-800 text-xs font-bold leading-relaxed">{a.advice}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200 text-[10px] text-neutral-500 font-mono font-semibold uppercase">
                Priority Advisory Grade: High
              </div>
            </div>
          );
        })}
      </div>

      {/* Protective Measures (Sharp White Card) */}
      <div className="bg-white border border-neutral-300 rounded-none p-5 shadow-sm">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-900 mb-4">
          Recommended Protective Measures
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: 'Wear N95 Masks', desc: 'When outdoors, especially in high-traffic corridors and construction zones.' },
            { title: 'Use Air Purifiers', desc: 'Keep indoor air clean, especially in bedrooms and closed work environments.' },
            { title: 'Avoid Morning Jogging', desc: 'Pollution peaks during 6:00 AM – 10:00 AM due to night thermal inversion.' },
            { title: 'Keep Windows Closed', desc: 'During peak traffic and agricultural stubble transport hours.' },
            { title: 'Stay Hydrated', desc: 'Drink clean water to assist bodily flushing of fine particulate matter.' },
            { title: 'Check 1km Grid Telemetry', desc: 'Inspect sector AQI before planning outdoor work or travel.' },
          ].map((m) => (
            <div key={m.title} className="p-3.5 bg-neutral-100 border border-neutral-200 rounded-none">
              <p className="font-bold text-xs text-neutral-900 uppercase">{m.title}</p>
              <p className="text-neutral-700 text-xs font-medium mt-1 leading-snug">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
