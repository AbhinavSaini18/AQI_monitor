import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

export default function LocationCard() {
  return (
    <div className="bg-[#0d1526] border border-white/[0.07] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <MapPin size={11} className="text-slate-500" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Urban Estate, Patiala</p>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      </div>
      <p
        className="font-display font-black text-3xl mt-1"
        style={{ color: '#ef4444', textShadow: '0 0 28px rgba(239,68,68,0.4)' }}
      >
        AQI: 232
      </p>
      <p className="text-[11px] font-semibold text-red-400/80 mt-0.5 mb-2">Very Poor</p>
      <div className="space-y-1 border-t border-white/[0.06] pt-2">
        <p className="text-[11px] text-slate-400">Sector: <span className="text-slate-200 font-medium">Sector 7, Patiala</span></p>
        <p className="text-[11px] text-slate-400">Coords: <span className="text-slate-200 font-medium">30.33°N, 76.38°E</span></p>
      </div>
    </div>
  );
}