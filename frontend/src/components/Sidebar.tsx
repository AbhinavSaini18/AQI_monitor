import { 
  LayoutDashboard, 
  Map, 
  TrendingUp, 
  PieChart, 
  ShieldAlert, 
  FileText, 
  Bot
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'DASHBOARD', label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'MAP', label: 'LIVE MAP', icon: Map },
  { id: 'PREDICTIONS', label: 'PREDICTIONS', icon: TrendingUp },
  { id: 'ATTRIBUTION', label: 'ATTRIBUTION', icon: PieChart },
  { id: 'ADVISORY', label: 'ADVISORY', icon: ShieldAlert },
  { id: 'REPORTS', label: 'REPORTS', icon: FileText },
  { id: 'ASSISTANT', label: 'AI ASSISTANT', icon: Bot },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <div className="w-64 bg-neutral-900 text-white flex flex-col h-full rounded-none border-r border-neutral-800">
      <div className="h-16 flex items-center px-6 border-b border-neutral-800">
        <h1 className="text-xl font-bold uppercase tracking-widest text-white">
          DELHI AQI
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors rounded-none ${
                  isActive 
                    ? 'bg-white text-neutral-900' 
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-4 ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-neutral-800">
        <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
          SYSTEM STATUS: ONLINE
        </div>
        <div className="text-xs text-neutral-600 mt-1 uppercase">
          V1.0.0-PROD
        </div>
      </div>
    </div>
  );
}
