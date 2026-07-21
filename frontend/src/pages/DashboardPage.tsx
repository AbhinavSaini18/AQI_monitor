import CurrentAQIPanel from '../components/CurrentAQIPanel';
import WeatherPanel from '../components/WeatherPanel';
import AQITrendChart from '../components/AQITrendChart';
import KeyPollutants from '../components/KeyPollutants';
import SourceAttributionChart from '../components/SourceAttributionChart';
import AIAnalysisPanel from '../components/AIAnalysisPanel';

import { aqiTrendData, keyPollutants, sourceAttributions } from '../data/mockData';
import LiveMap from '../components/map/LiveMap';
interface DashboardPageProps {
  aqi: number;
  trend: number;
  weather: { temp: number; humidity: number; windSpeed: number; windDir: string; visibility: number; pressure: number; uvIndex: number };
}

export default function DashboardPage({ aqi, trend, weather }: DashboardPageProps) {
  return (
    <div className="space-y-5">
      {/* Top row: AQI + Weather — items-start prevents weather stretching to AQI height */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-1">
          <CurrentAQIPanel aqi={aqi} city="Delhi" trend={trend} />
        </div>
        <div className="lg:col-span-2">
          <WeatherPanel {...weather} />
        </div>
      </div>

      {/* Middle row: Trend + Pollutants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <AQITrendChart data={aqiTrendData} />
        </div>
        <div className="lg:col-span-1">
          <KeyPollutants pollutants={keyPollutants} />
        </div>
      </div>

      {/* Map full width */}
      <LiveMap/>

      {/* Bottom row: Source attribution + AI analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SourceAttributionChart data={sourceAttributions} />
        <AIAnalysisPanel aqi={aqi} />
      </div>
    </div>
  );
}
