import React from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import AQICard from '../components/dashboard/AQICard';
import AIInsight from '../components/dashboard/AIInsight';
import RiskTimeline from '../components/dashboard/RiskTimeline';
import LiveMap from '../components/map/LiveMap';
import LocationCard from '../components/dashboard/LocationCard';
import AttributionCard from '../components/dashboard/AttributionCard';
import AnalysisCard from '../components/dashboard/AnalysisCard';
import AQIChart from '../components/charts/AQIChart';
import Pollutants from '../components/dashboard/Pollutants';
import WeatherCard from '../components/dashboard/WeatherCard';

export default function Dashboard() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070c18] text-white font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 gap-3 flex flex-col">

          {/* ─── Top Row: Left | Map | Right ─── */}
          <div className="flex gap-3 flex-1 min-h-0" style={{ minHeight: '480px' }}>

            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-3 w-[220px] min-w-[220px]">
              <AQICard />
              <AIInsight />
            </div>

            {/* CENTER MAP */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              {/* Map takes most space */}
              <div className="flex-1 min-h-0">
                <LiveMap />
              </div>
              {/* Risk Timeline below map */}
              <RiskTimeline />
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-3 w-[220px] min-w-[220px]">
              <LocationCard />
              <AttributionCard />
              <AnalysisCard />
            </div>
          </div>

          {/* ─── Bottom Row ─── */}
          <div className="flex gap-3" style={{ height: '200px', minHeight: '200px' }}>
            {/* AQI Trend Chart */}
            <div className="w-[280px] min-w-[280px]">
              <AQIChart />
            </div>
            {/* Pollutants */}
            <div className="flex-1">
              <Pollutants />
            </div>
            {/* Weather */}
            <div className="w-[190px] min-w-[190px]">
              <WeatherCard />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}