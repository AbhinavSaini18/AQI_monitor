import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function AQICard() {
  return (
    <div className="rounded-2xl p-4 border border-orange-500/10"
         style={{ background: 'linear-gradient(135deg, #0d1526 0%, #12192e 100%)' }}>

      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Current AQI</p>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-[9px] text-orange-400 font-semibold">LIVE</span>
        </div>
      </div>

      {/* Big AQI */}
      <div className="relative mb-1">
        <p className="font-display font-black leading-none select-none"
           style={{ fontSize: '76px', color: '#f97316', textShadow: '0 0 60px rgba(249,115,22,0.5), 0 0 20px rgba(249,115,22,0.3)' }}>
          143
        </p>
        {/* Decorative blur */}
        <div className="absolute -top-2 -left-2 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none"
             style={{ background: '#f97316' }} />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-1.5">
        <AlertTriangle size={13} className="text-orange-400" />
        <p className="font-display font-bold text-[22px] text-orange-400 tracking-wide leading-none">POOR</p>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">
        Air quality is unhealthy<br />for sensitive groups.
      </p>

      {/* Trend badge */}
      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10">
        <TrendingUp size={11} className="text-orange-400" />
        <span className="text-xs font-bold text-orange-400">↑ 12</span>
        <span className="text-xs text-slate-500">vs yesterday</span>
      </div>
    </div>
  );
}