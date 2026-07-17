import React from 'react';
import { ChevronRight } from 'lucide-react';

const reasons = [
  'High traffic density',
  'Vehicular emissions',
  'Construction activity',
  'Low ventilation',
];

export default function AnalysisCard() {
  return (
    <div className="bg-[#0d1526] border border-white/[0.07] rounded-2xl p-4">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">AI Analysis</p>
      <p className="text-sm text-slate-300 leading-relaxed mb-3">
        Connaught Place shows Poor AQI levels and major reasons for that are:
      </p>
      <ul className="flex flex-col gap-1.5 mb-3">
        {reasons.map((r) => (
          <li key={r} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
            <span className="text-xs text-slate-300">{r}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-400 leading-relaxed mb-3">
        People with lung or heart diseases should avoid outdoor activities.
      </p>
      <button className="flex items-center gap-1 text-xs font-semibold text-white hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 rounded-lg px-3 py-1.5 transition-all w-full justify-between">
        View Full Report
        <ChevronRight size={14} />
      </button>
    </div>
  );
}