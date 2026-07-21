import React from 'react';
import { Bell } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-[#0c1424]/60 backdrop-blur-sm">
      <div>
        <h1 className="font-display font-bold text-xl text-white leading-tight">
          Good Afternoon, Shivang 👋
        </h1>
        <p className="text-sm text-slate-400 font-medium mt-0.5">
          Here's your air quality overview for <span className="text-cyan-400 font-semibold">Patiala</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button className="relative w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/10 transition-colors">
          <Bell size={16} className="text-slate-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full">
            <span className="absolute inset-0 bg-orange-400 rounded-full ping-slow" />
          </span>
        </button>
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-display font-bold text-white text-sm shadow-lg shadow-cyan-500/20">
          S
        </div>
      </div>
    </header>
  );
}