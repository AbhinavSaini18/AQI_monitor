import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import DashboardPage from './pages/DashboardPage';
import PredictionsPage from './pages/PredictionsPage';
import AttributionPage from './pages/AttributionPage';
import AdvisoryPage from './pages/AdvisoryPage';
import ReportsPage from './pages/ReportsPage';
import AssistantPage from './pages/AssistantPage';
import HeatMap from './components/HeatMap';
import type { NavPage } from './types';

export default function App() {
  const [page, setPage] = useState<NavPage>('dashboard');
  const [aqi, setAqi] = useState(143);
  const [trend, setTrend] = useState(12);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [weather] = useState({
    temp: 24,
    humidity: 62,
    windSpeed: 8,
    windDir: 'NW',
    visibility: 4.5,
    pressure: 1015,
  });

  // Simulate live AQI updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAqi((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = Math.max(80, Math.min(250, prev + delta));
        setTrend(next - prev);
        return next;
      });
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <Sidebar active={page} onNavigate={setPage} />

      <div className="lg:ml-64 relative">
        <Header onMenuClick={() => {}} activePage={page} lastUpdated={lastUpdated} />

        <main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {page === 'dashboard' && <DashboardPage aqi={aqi} trend={trend} weather={weather} />}
          {page === 'map' && <HeatMap />}
          {page === 'predictions' && <PredictionsPage />}
          {page === 'attribution' && <AttributionPage />}
          {page === 'advisory' && <AdvisoryPage aqi={aqi} />}
          {page === 'reports' && <ReportsPage />}
          {page === 'assistant' && <AssistantPage />}
        </main>
      </div>

      <MobileNav active={page} onNavigate={setPage} />
    </div>
  );
}
