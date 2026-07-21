import { Menu, Search, Bell, Settings } from 'lucide-react';
import type { NavPage } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
  activePage: NavPage;
  lastUpdated: Date;
}

const pageTitles: Record<NavPage, { title: string; subtitle: string }> = {
  dashboard: { title: 'City Air Quality Dashboard', subtitle: 'Real-time monitoring & AI insights' },
  map: { title: 'Live Air Quality Map', subtitle: 'Interactive heatmap & monitoring stations' },
  predictions: { title: 'AQI Predictions', subtitle: 'AI-powered 72-hour forecasts' },
  attribution: { title: 'Source Attribution', subtitle: 'AI analysis of pollution sources' },
  advisory: { title: 'Health Advisory', subtitle: 'Personalized protection recommendations' },
  reports: { title: 'Reports & Analytics', subtitle: 'Historical trends and compliance' },
  assistant: { title: 'AI Assistant', subtitle: 'Ask questions about air quality' },
};

export default function Header({ onMenuClick, activePage, lastUpdated }: HeaderProps) {
  const { title, subtitle } = pageTitles[activePage];
  const timeStr = lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/60 px-4 sm:px-6 lg:px-8 py-4 relative isolate">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-white font-bold text-lg sm:text-xl truncate">{title}</h2>
            <p className="text-slate-400 text-xs sm:text-sm truncate hidden sm:block">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">Updated {timeStr}</span>
          </div>
          <button className="p-2 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition">
            <Search className="w-5 h-5" />
          </button>
          <button className="relative p-2 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-400" />
          </button>
          <button className="p-2 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition hidden sm:block">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
