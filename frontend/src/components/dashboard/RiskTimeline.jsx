import React from 'react';

const nodes = [
  { time: '6 AM',      status: 'Good',      color: '#22c55e' },
  { time: '9 AM',      status: 'Moderate',  color: '#eab308' },
  { time: '12 PM',     status: 'Poor',      color: '#f97316' },
  { time: '3 PM',      status: 'Poor',      color: '#f97316' },
  { time: '6 PM',      status: 'Very Poor', color: '#ef4444' },
  { time: 'Tomorrow',  status: 'Moderate',  color: '#eab308' },
];

export default function RiskTimeline() {
  return (
    <div className="bg-[#0d1526] border border-white/[0.07] rounded-2xl p-4">
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-4">Risk Level Timeline</p>

      {/* Track */}
      <div className="relative flex items-start">
        {/* Connector line */}
        <div className="absolute top-[10px] left-0 right-0 h-[2px] bg-white/10 z-0" />

        {nodes.map(({ time, status, color }, i) => (
          <div key={i} className="flex-1 flex flex-col items-center z-10 relative">
            {/* Time */}
            <p className="text-[10px] text-slate-500 font-medium mb-1.5 whitespace-nowrap">{time}</p>

            {/* Dot */}
            <div
              className="w-5 h-5 rounded-full border-2 border-[#0d1526] shadow-md"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
            />

            {/* Status */}
            <p
              className="text-[10px] font-semibold mt-1.5 whitespace-nowrap"
              style={{ color }}
            >
              {status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}