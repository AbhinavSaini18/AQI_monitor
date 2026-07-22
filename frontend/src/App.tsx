import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import DashboardPage from './pages/DashboardPage';
import PredictionsPage from './pages/PredictionsPage';
import AttributionPage from './pages/AttributionPage';
import AdvisoryPage from './pages/AdvisoryPage';
import ReportsPage from './pages/ReportsPage';
import AssistantPage from './pages/AssistantPage';
import LiveMap from './components/map/LiveMap';

import {
  fetchDelhiAQI,
  fetchBackendHealth,
  fetchLiveWeather,
  LiveAQIResponse,
  HealthResponse,
  LiveWeatherResponse
} from './utils/api';

const DELHI_LAT = 28.6139;
const DELHI_LNG = 77.2090;

function App() {
  const [page, setPage] = useState('DASHBOARD');
  const [selectedGridId, setSelectedGridId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [liveAQI, setLiveAQI] = useState<LiveAQIResponse | null>(null);
  const [backendHealth, setBackendHealth] = useState<HealthResponse | null>(null);
  const [liveWeather, setLiveWeather] = useState<LiveWeatherResponse | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const loadInitialData = async () => {
      const [aqiData, healthData, weatherData] = await Promise.all([
        fetchDelhiAQI(),
        fetchBackendHealth(),
        fetchLiveWeather(DELHI_LAT, DELHI_LNG)
      ]);

      if (aqiData) setLiveAQI(aqiData);
      if (healthData) setBackendHealth(healthData);
      if (weatherData) setLiveWeather(weatherData);
      
      setLastUpdated(new Date().toLocaleTimeString());
    };

    loadInitialData();
    const interval = setInterval(loadInitialData, 300000); // 5 mins
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (newPage: string) => {
    setPage(newPage);
    setIsSidebarOpen(false);
  };

  const isHealthy = backendHealth?.status === 'healthy';

  const renderPage = () => {
    switch (page) {
      case 'DASHBOARD':
        return (
          <DashboardPage
            selectedGridId={selectedGridId}
            onSelectGrid={setSelectedGridId}
            liveAQI={liveAQI}
            liveWeather={liveWeather}
          />
        );
      case 'map':
        return (
          <div className="bg-white border border-neutral-300 p-1 flex-1 flex flex-col">
            <LiveMap onSelectGrid={setSelectedGridId} selectedGridId={selectedGridId} />
          </div>
        );
      case 'PREDICTIONS':
        return <PredictionsPage gridId={selectedGridId} onSelectGrid={setSelectedGridId} />;
      case 'ATTRIBUTION':
        return <AttributionPage gridId={selectedGridId} onSelectGrid={setSelectedGridId} />;
      case 'ADVISORY':
        return <AdvisoryPage aqi={liveAQI?.aqi || 0} />;
      case 'REPORTS':
        return <ReportsPage />;
      case 'ASSISTANT':
        return <AssistantPage />;
      default:
        return <DashboardPage selectedGridId={selectedGridId} onSelectGrid={setSelectedGridId} liveAQI={liveAQI} liveWeather={liveWeather} />;
    }
  };

  return (
    <div className="flex h-screen bg-neutral-100 font-sans text-neutral-900 rounded-none">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex">
        <Sidebar activePage={page} onNavigate={handleNavigate} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden rounded-none">
        <Header 
          activePage={page}
          onNavigate={handleNavigate}
          onMenuClick={() => setIsSidebarOpen(true)}
          lastUpdated={lastUpdated}
          aqi={liveAQI?.aqi || 0}
          locationName={liveAQI?.station_name || "DELHI"}
          backendHealthy={isHealthy}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100 p-4 md:p-6 rounded-none">
          {renderPage()}
        </main>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-neutral-900/50" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative flex w-64 max-w-sm flex-col bg-neutral-900">
            <MobileNav activePage={page} onNavigate={handleNavigate} onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
