import React, { useState } from 'react';
import {
  LayoutDashboard, Map, TrendingUp, BarChart2, ShieldAlert,
  FileText, Bot, MapPin, Moon, Wind
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    active: true  },
  { icon: Map,             label: 'Live Map'               },
  { icon: TrendingUp,      label: 'Predictions'            },
  { icon: BarChart2,       label: 'Attribution'            },
  { icon: ShieldAlert,     label: 'Advisory'               },
  { icon: FileText,        label: 'Reports'                },
  { icon: Bot,             label: 'AI Assistant'           },
];

export default function Sidebar() {
  const [dark, setDark] = useState(true);

  return (
    <aside className="flex flex-col w-[175px] min-w-[175px] h-full border-r border-white/[0.06]"
           style={{ background: 'linear-gradient(180deg, #0c1424 0%, #080d1a 100%)' }}>

      {/* ── Brand ── */}
      <div className="px-4 pt-5 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', boxShadow: '0 0 18px rgba(6,182,212,0.4)' }}>
            <Wind size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="font-display font-extrabold text-white text-[13px] tracking-wide leading-tight">AIRVISION AI</p>
            <p className="text-[9px] text-cyan-400/70 font-semibold tracking-[0.15em] uppercase leading-tight mt-0.5">
              Breathe Better.
            </p>
            <p className="text-[9px] text-cyan-400/50 font-medium tracking-[0.1em] uppercase leading-tight">
              Live Better.
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2.5 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, active }) => (
          <button key={label}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium w-full text-left
                        transition-all duration-200 ${
              active
                ? 'text-white border border-cyan-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
            }`}
            style={active ? {
              background: 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(59,130,246,0.10))',
              boxShadow: '0 0 12px rgba(6,182,212,0.10) inset',
            } : {}}
          >
            <Icon size={15} strokeWidth={active ? 2.2 : 1.8}
                  className={active ? 'text-cyan-400' : ''} />
            {label}
          </button>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div className="px-3 pb-4 flex flex-col gap-3">
        {/* Location chip */}
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl border border-white/[0.07]"
             style={{ background: 'rgba(6,182,212,0.06)' }}>
          <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <MapPin size={11} className="text-cyan-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">Patiala</p>
            <p className="text-[10px] text-cyan-400 font-medium leading-tight">Change Location</p>
          </div>
        </div>

        {/* Last updated */}
        <div className="px-1">
          <p className="text-[9px] text-slate-600 font-semibold uppercase tracking-widest mb-0.5">Last Updated</p>
          <p className="text-xs text-slate-300 font-semibold">2 mins ago</p>
        </div>

        {/* Dark mode */}
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center gap-1.5">
            <Moon size={12} className="text-slate-500" />
            <span className="text-[12px] text-slate-400 font-medium">Dark Mode</span>
          </div>
          <button onClick={() => setDark(!dark)}
            className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
              dark ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
            style={dark ? { boxShadow: '0 0 10px rgba(6,182,212,0.5)' } : {}}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
              dark ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>
    </aside>
  );
}