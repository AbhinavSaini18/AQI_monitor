import { LayoutDashboard, Map, TrendingUp, PieChart, ShieldAlert, Sparkles } from 'lucide-react';
import type { NavPage } from '../types';

interface MobileNavProps {
  active: NavPage;
  onNavigate: (page: NavPage) => void;
}

const items: { id: NavPage; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
  { id: 'map', icon: Map, label: 'Map' },
  { id: 'predictions', icon: TrendingUp, label: 'Forecast' },
  { id: 'attribution', icon: PieChart, label: 'Sources' },
  { id: 'advisory', icon: ShieldAlert, label: 'Health' },
  { id: 'assistant', icon: Sparkles, label: 'AI' },
];

export default function MobileNav({ active, onNavigate }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/60 px-1 py-1.5 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition ${
              isActive ? 'text-cyan-300' : 'text-slate-500'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
