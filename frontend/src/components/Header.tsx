import { Menu, Activity, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onMenuClick: () => void;
  lastUpdated: string;
  aqi: number;
  locationName: string;
  backendHealthy: boolean;
}

const TABS = ['DASHBOARD', 'MAP', 'PREDICTIONS', 'ATTRIBUTION', 'ADVISORY', 'REPORTS', 'ASSISTANT'];

export default function Header({ 
  activePage, 
  onNavigate, 
  onMenuClick, 
  lastUpdated, 
  aqi, 
  locationName,
  backendHealthy 
}: HeaderProps) {
  

  return (
    <header className="bg-white border-b border-neutral-300 rounded-none shadow-sm z-10">
      <div className="flex items-center justify-between px-4 h-16">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-none focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden md:flex items-center gap-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => onNavigate(tab)}
                className={`uppercase text-sm font-bold tracking-wider py-4 border-b-2 rounded-none transition-colors whitespace-nowrap ${
                  activePage === tab 
                    ? 'border-neutral-900 text-neutral-900' 
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase">SYS STATUS</span>
            <div className={`w-3 h-3 ${backendHealthy ? 'bg-green-500' : 'bg-red-500'} animate-pulse rounded-none`} />
          </div>

          <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{locationName} AQI</span>
            <span className={`text-xl font-black ${aqi > 300 ? 'text-purple-600' : aqi > 200 ? 'text-red-500' : aqi > 100 ? 'text-orange-500' : aqi > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
              {aqi > 0 ? aqi : '--'}
            </span>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
            <RefreshCw className="w-4 h-4" />
            <span>UPDATED: {lastUpdated || '--:--'}</span>
          </div>
          </div>
        </div>

      </div>
    </header>
  );
}
