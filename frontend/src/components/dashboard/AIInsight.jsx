import React from 'react';
import { Cpu, Zap } from 'lucide-react';

const insights = [
  {
    text: 'Traffic emissions increased AQI by',
    highlight: '18% today.',
    color: 'text-amber-400',
  },
  {
    text: 'Air quality expected to worsen after',
    highlight: '6 PM.',
    color: 'text-red-400',
  },
  {
    text: 'Outdoor exercise not recommended after',
    highlight: '5 PM.',
    color: 'text-orange-400',
  },
];

export default function AIInsight() {
  return (
    <div className="rounded-2xl p-4 border border-cyan-500/10 flex-1 flex flex-col"
         style={{ background: 'linear-gradient(135deg, #0d1526 0%, #0b1220 100%)' }}>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 border border-cyan-500/30"
             style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(59,130,246,0.15))', boxShadow: '0 0 12px rgba(6,182,212,0.15) inset' }}>
          <Cpu size={13} className="text-cyan-400" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">AI Insight</p>
        <div className="ml-auto">
          <Zap size={10} className="text-cyan-500/60" />
        </div>
      </div>

      {/* Insights */}
      <div className="flex flex-col gap-3 flex-1">
        {insights.map(({ text, highlight, color }, i) => (
          <div key={i} className="flex gap-2">
            <div className="w-1 rounded-full flex-shrink-0 mt-1"
                 style={{ background: i === 0 ? '#f59e0b' : i === 1 ? '#ef4444' : '#f97316', minHeight: '14px' }} />
            <p className="text-[12px] text-slate-400 leading-snug">
              {text}{' '}
              <span className={`font-bold ${color}`}>{highlight}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}