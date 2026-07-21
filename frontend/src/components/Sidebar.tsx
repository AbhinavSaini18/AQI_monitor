import { LayoutDashboard, Map, TrendingUp, PieChart, ShieldAlert, FileText, Sparkles, Wind } from 'lucide-react';
import type { NavPage } from '../types';

interface SidebarProps {
  active: NavPage;
  onNavigate: (page: NavPage) => void;
}

const navItems: { id: NavPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Live Map', icon: Map },
  { id: 'predictions', label: 'Predictions', icon: TrendingUp },
  { id: 'attribution', label: 'Source Attribution', icon: PieChart },
  { id: 'advisory', label: 'Health Advisory', icon: ShieldAlert },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
];

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/60 fixed h-full z-50">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Wind className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight shimmer-text">AIRVISION</h1>
          <p className="text-cyan-400 text-xs font-medium">AI Air Quality Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800/60">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-slate-400 font-medium">System Status</p>
          </div>
          <p className="text-white text-sm font-semibold">All sensors online</p>
          <p className="text-slate-500 text-xs mt-1">24 monitoring stations active</p>
        </div>
      </div>
    </aside>
  );
}
