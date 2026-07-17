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
  { name: 'Qila Mubarak', lat: 30.3369, lng: 76.3856, aqi: 232, ward: 'Old City', zone: 'Heritage Core' },
  { name: 'Adalat Bazaar', lat: 30.3275, lng: 76.3986, aqi: 178, ward: 'Ward 12', zone: 'Central Patiala' },
  { name: 'Lehal', lat: 30.3410, lng: 76.3860, aqi: 143, ward: 'Ward 8', zone: 'Central Patiala' },
  { name: 'Model Town', lat: 30.3520, lng: 76.3845, aqi: 112, ward: 'Ward 5', zone: 'North Patiala' },
  { name: 'Civil Lines', lat: 30.3610, lng: 76.3830, aqi: 98, ward: 'Ward 3', zone: 'North Patiala' },
  { name: 'Tripuri', lat: 30.3190, lng: 76.4010, aqi: 201, ward: 'Ward 24', zone: 'South Patiala' },
  { name: 'Punjabi University', lat: 30.3610, lng: 76.4510, aqi: 89, ward: 'Ward 1', zone: 'East Patiala' },
  { name: 'Baradari Gardens', lat: 30.3420, lng: 76.3920, aqi: 156, ward: 'Ward 9', zone: 'Central Patiala' },
  { name: 'Nabha Gate', lat: 30.3280, lng: 76.3950, aqi: 187, ward: 'Ward 15', zone: 'South Patiala' },
  { name: 'Phularkhana', lat: 30.3300, lng: 76.4100, aqi: 134, ward: 'Ward 18', zone: 'East Patiala' },
  { name: 'PUDA Complex', lat: 30.3480, lng: 76.3850, aqi: 115, ward: 'Ward 6', zone: 'North Patiala' },
  { name: 'Sanaur Road', lat: 30.3050, lng: 76.3950, aqi: 165, ward: 'Ward 27', zone: 'South Patiala' },
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
