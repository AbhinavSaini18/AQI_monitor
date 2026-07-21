export type AQILevel = 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';

export interface Pollutant {
  name: string;
  value: number;
  unit: string;
  level: AQILevel;
}

export interface Location {
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  ward?: string;
  zone?: string;
}

export interface AQIDataPoint {
  time: string;
  aqi: number;
}

export interface RiskPoint {
  time: string;
  level: AQILevel;
}

export type NavPage = 'dashboard' | 'map' | 'predictions' | 'attribution' | 'advisory' | 'reports' | 'assistant';

export interface SourceAttribution {
  name: string;
  percentage: number;
  color: string;
}
