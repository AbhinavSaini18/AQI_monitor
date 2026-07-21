import type { AQIDataPoint, RiskPoint, SourceAttribution, Location, Pollutant } from '../types';

export const aqiTrendData: AQIDataPoint[] = [
  { time: '6 AM', aqi: 95 },
  { time: '7 AM', aqi: 108 },
  { time: '8 AM', aqi: 125 },
  { time: '9 AM', aqi: 138 },
  { time: '10 AM', aqi: 143 },
  { time: '11 AM', aqi: 155 },
  { time: '12 PM', aqi: 162 },
  { time: '1 PM', aqi: 170 },
  { time: '2 PM', aqi: 178 },
  { time: '3 PM', aqi: 165 },
  { time: '4 PM', aqi: 152 },
  { time: '5 PM', aqi: 160 },
  { time: '6 PM', aqi: 175 },
  { time: '7 PM', aqi: 168 },
  { time: '8 PM', aqi: 155 },
  { time: '9 PM', aqi: 143 },
];

export const riskTimeline: RiskPoint[] = [
  { time: '6 AM', level: 'Good' },
  { time: '9 AM', level: 'Moderate' },
  { time: '12 PM', level: 'Poor' },
  { time: '3 PM', level: 'Poor' },
  { time: '6 PM', level: 'Very Poor' },
  { time: 'Tomorrow', level: 'Moderate' },
];

export const sourceAttributions: SourceAttribution[] = [
  { name: 'Crop Burning Smoke', percentage: 35, color: '#22c55e' },
  { name: 'Traffic', percentage: 30, color: '#06b6d4' },
  { name: 'Inversion/Weather', percentage: 25, color: '#3b82f6' },
  { name: 'Construction Dust', percentage: 10, color: '#6b7280' },
];

export const keyPollutants: Pollutant[] = [
  { name: 'PM2.5', value: 65, unit: 'µg/m³', level: 'Poor' },
  { name: 'PM10', value: 122, unit: 'µg/m³', level: 'Poor' },
  { name: 'NO₂', value: 38, unit: 'µg/m³', level: 'Moderate' },
  { name: 'SO₂', value: 16, unit: 'µg/m³', level: 'Good' },
  { name: 'CO', value: 0.8, unit: 'mg/m³', level: 'Good' },
  { name: 'O₃', value: 72, unit: 'µg/m³', level: 'Moderate' },
];

export const heatmapLocations: Location[] = [
  { name: 'Anand Vihar', lat: 28.6469, lng: 77.3154, aqi: 412, ward: 'East Delhi', zone: 'Trans-Yamuna' },
  { name: 'RK Puram', lat: 28.5630, lng: 77.1675, aqi: 358, ward: 'South West Delhi', zone: 'South Delhi' },
  { name: 'Punjabi Bagh', lat: 28.6740, lng: 77.1313, aqi: 389, ward: 'West Delhi', zone: 'West Delhi' },
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167, aqi: 274, ward: 'New Delhi', zone: 'Central Delhi' },
  { name: 'ITO', lat: 28.6280, lng: 77.2410, aqi: 301, ward: 'Central Delhi', zone: 'Central Delhi' },
  { name: 'Dwarka', lat: 28.5921, lng: 77.0460, aqi: 322, ward: 'South West Delhi', zone: 'South West Delhi' },
  { name: 'Rohini', lat: 28.7325, lng: 77.0875, aqi: 256, ward: 'North West Delhi', zone: 'North West Delhi' },
  { name: 'Pitampura', lat: 28.6980, lng: 77.1280, aqi: 281, ward: 'North West Delhi', zone: 'North West Delhi' },
  { name: 'Nehru Nagar', lat: 28.5680, lng: 77.2520, aqi: 268, ward: 'South Delhi', zone: 'South Delhi' },
  { name: 'Wazirpur', lat: 28.6990, lng: 77.1760, aqi: 395, ward: 'North Delhi', zone: 'North Delhi' },
  { name: 'Jahangirpuri', lat: 28.7125, lng: 77.1707, aqi: 378, ward: 'North West Delhi', zone: 'North West Delhi' },
  { name: 'Lodhi Road', lat: 28.5900, lng: 77.2230, aqi: 224, ward: 'South Delhi', zone: 'South Delhi' },
  { name: 'Aya Nagar', lat: 28.4700, lng: 77.1200, aqi: 198, ward: 'South Delhi', zone: 'South Delhi' },
  { name: 'Vivek Vihar', lat: 28.6720, lng: 77.3150, aqi: 367, ward: 'East Delhi', zone: 'Trans-Yamuna' },
  { name: 'Okhla', lat: 28.5330, lng: 77.2680, aqi: 312, ward: 'South East Delhi', zone: 'South Delhi' },
  { name: 'Narela', lat: 28.8225, lng: 77.1025, aqi: 241, ward: 'North West Delhi', zone: 'North West Delhi' },
  { name: 'Bawana', lat: 28.7762, lng: 77.0490, aqi: 289, ward: 'North West Delhi', zone: 'North West Delhi' },
  { name: 'Mundka', lat: 28.6820, lng: 77.0180, aqi: 345, ward: 'West Delhi', zone: 'West Delhi' },
  { name: 'Siri Fort', lat: 28.5500, lng: 77.2150, aqi: 215, ward: 'South Delhi', zone: 'South Delhi' },
  { name: 'DTU', lat: 28.7500, lng: 77.1112, aqi: 264, ward: 'North West Delhi', zone: 'North West Delhi' },
  { name: 'Mayur Vihar', lat: 28.6094, lng: 77.2990, aqi: 351, ward: 'East Delhi', zone: 'Trans-Yamuna' },
  { name: 'Patparganj', lat: 28.6280, lng: 77.2880, aqi: 338, ward: 'East Delhi', zone: 'Trans-Yamuna' },
  { name: 'Janakpuri', lat: 28.6219, lng: 77.0878, aqi: 302, ward: 'West Delhi', zone: 'West Delhi' },
  { name: 'Saket', lat: 28.5245, lng: 77.2066, aqi: 251, ward: 'South Delhi', zone: 'South Delhi' },
  { name: 'Karol Bagh', lat: 28.6519, lng: 77.1909, aqi: 318, ward: 'Central Delhi', zone: 'Central Delhi' },
  { name: 'Shahdara', lat: 28.6720, lng: 77.2890, aqi: 372, ward: 'Shahdara', zone: 'Trans-Yamuna' },
  { name: 'Sarita Vihar', lat: 28.5290, lng: 77.2960, aqi: 296, ward: 'South East Delhi', zone: 'South Delhi' },
  { name: 'Vasant Kunj', lat: 28.5170, lng: 77.1590, aqi: 234, ward: 'South West Delhi', zone: 'South Delhi' },
];

export const predictionData = [
  { time: 'Now', aqi: 143, label: 'Poor' },
  { time: '3 PM', aqi: 165, label: 'Poor' },
  { time: '6 PM', aqi: 195, label: 'Very Poor' },
  { time: '9 PM', aqi: 175, label: 'Poor' },
  { time: 'Tomorrow 6AM', aqi: 130, label: 'Poor' },
  { time: 'Tomorrow 12PM', aqi: 110, label: 'Moderate' },
  { time: 'Tomorrow 6PM', aqi: 145, label: 'Poor' },
  { time: 'Day 3', aqi: 95, label: 'Moderate' },
];
