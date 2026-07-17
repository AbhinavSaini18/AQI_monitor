import type { AQILevel } from '../types';

export function getAQILevel(aqi: number): AQILevel {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 200) return 'Poor';
  if (aqi <= 300) return 'Very Poor';
  return 'Severe';
}

export function getAQIColor(aqi: number): string {
  const level = getAQILevel(aqi);
  switch (level) {
    case 'Good': return '#22c55e';
    case 'Moderate': return '#eab308';
    case 'Poor': return '#f97316';
    case 'Very Poor': return '#ef4444';
    case 'Severe': return '#7c2d12';
  }
}

export function getAQIBgColor(aqi: number): string {
  const level = getAQILevel(aqi);
  switch (level) {
    case 'Good': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case 'Moderate': return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
    case 'Poor': return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
    case 'Very Poor': return 'bg-red-500/15 text-red-300 border-red-500/30';
    case 'Severe': return 'bg-rose-900/30 text-rose-300 border-rose-700/40';
  }
}

export function getAQIDescription(aqi: number): string {
  const level = getAQILevel(aqi);
  switch (level) {
    case 'Good': return 'Air quality is satisfactory and poses little or no risk.';
    case 'Moderate': return 'Acceptable, but sensitive individuals may experience moderate symptoms.';
    case 'Poor': return 'Members of sensitive groups may experience health effects.';
    case 'Very Poor': return 'Health alert: everyone may experience more serious effects.';
    case 'Severe': return 'Emergency conditions: entire population is affected.';
  }
}

export function getHealthAdvice(aqi: number): { group: string; advice: string; icon: string }[] {
  const level = getAQILevel(aqi);
  const base = [
    { group: 'General Population', advice: 'Enjoy outdoor activities', icon: 'green' },
    { group: 'Sensitive Groups', advice: 'Consider reducing prolonged outdoor exertion', icon: 'yellow' },
    { group: 'Children & Elderly', advice: 'Normal precautions apply', icon: 'green' },
    { group: 'Outdoor Workers', advice: 'No special precautions needed', icon: 'green' },
  ];
  if (level === 'Moderate') {
    return [
      { group: 'General Population', advice: 'Normal activities', icon: 'green' },
      { group: 'Sensitive Groups', advice: 'Limit prolonged outdoor exertion', icon: 'yellow' },
      { group: 'Children & Elderly', advice: 'Monitor symptoms, keep rescue inhaler handy', icon: 'yellow' },
      { group: 'Outdoor Workers', advice: 'Take breaks indoors', icon: 'yellow' },
    ];
  }
  if (level === 'Poor') {
    return [
      { group: 'General Population', advice: 'Reduce prolonged outdoor exertion', icon: 'orange' },
      { group: 'Sensitive Groups', advice: 'Avoid prolonged outdoor activity', icon: 'red' },
      { group: 'Children & Elderly', advice: 'Keep children indoors during peak hours', icon: 'red' },
      { group: 'Outdoor Workers', advice: 'Wear N95 masks outdoors', icon: 'orange' },
    ];
  }
  if (level === 'Very Poor' || level === 'Severe') {
    return [
      { group: 'General Population', advice: 'Avoid all outdoor activities', icon: 'red' },
      { group: 'Sensitive Groups', advice: 'Stay indoors, use air purifiers', icon: 'red' },
      { group: 'Children & Elderly', advice: 'Do not go outside unless necessary', icon: 'red' },
      { group: 'Outdoor Workers', advice: 'Stop outdoor work, relocate indoors', icon: 'red' },
    ];
  }
  return base;
}
