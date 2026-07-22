const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface GridCell {
  grid_id: string;
  grid_x: number;
  grid_y: number;
  geometry: string; // GeoJSON string
}

export interface HeatmapItem {
  grid_id: string;
  predicted_aqi: number;
  target_timestamp: string;
  source_attribution?: Record<string, number>;
}

export interface PredictionDetail {
  target_timestamp: string;
  predicted_aqi: number;
  confidence_score: number;
}

export interface AttributionResponse {
  grid_id: string;
  attribution: Record<string, number> | string | null;
  target_timestamp?: string;
  message?: string;
}

export interface ChatResponse {
  answer: string;
}

export interface LiveAQIResponse {
  aqi: number;
  pollutants: Record<string, number>;
  dominant_pollutant: string;
  timestamp: string;
  station_name: string;
}

export interface LiveWeatherResponse {
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  conditions: string;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  version: string;
}

export interface SensorReading {
  sensor_id: string;
  grid_id: string;
  pm25: number;
  pm10: number;
  no2: number;
  timestamp: string;
}

/**
 * Ensures AQI values are never negative on the UI (floor at 0).
 */
export function sanitizeAqi(rawAqi: number | null | undefined): number {
  if (rawAqi === null || rawAqi === undefined || isNaN(rawAqi)) {
    return 0;
  }
  return Math.max(0, Math.round(rawAqi));
}

/**
 * Fetches all PostGIS 1km grid geometries from FastAPI.
 */
export async function fetchGrid(): Promise<GridCell[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/grid`);
    if (!res.ok) throw new Error(`Failed to fetch grid: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('API Error [fetchGrid]:', err);
    return [];
  }
}

/**
 * Fetches latest predicted AQI per grid cell for heatmap layer.
 */
export async function fetchHeatmap(): Promise<HeatmapItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/predictions/heatmap`);
    if (!res.ok) throw new Error(`Failed to fetch heatmap: ${res.statusText}`);
    const data: HeatmapItem[] = await res.json();
    return data.map((item) => ({
      ...item,
      predicted_aqi: sanitizeAqi(item.predicted_aqi),
    }));
  } catch (err) {
    console.error('API Error [fetchHeatmap]:', err);
    return [];
  }
}

/**
 * Fetches 72-hour forecast predictions for a specific grid_id.
 */
export async function fetchPredictionDetails(gridId: string): Promise<PredictionDetail[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/predictions/${encodeURIComponent(gridId)}`);
    if (!res.ok) throw new Error(`Failed to fetch prediction details: ${res.statusText}`);
    const data: PredictionDetail[] = await res.json();
    return data.map((item) => ({
      ...item,
      predicted_aqi: sanitizeAqi(item.predicted_aqi),
    }));
  } catch (err) {
    console.error(`API Error [fetchPredictionDetails for ${gridId}]:`, err);
    return [];
  }
}

/**
 * Fetches source attribution breakdown for a specific grid_id.
 */
export async function fetchAttribution(gridId: string): Promise<AttributionResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/attribution/${encodeURIComponent(gridId)}`);
    if (!res.ok) throw new Error(`Failed to fetch attribution: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(`API Error [fetchAttribution for ${gridId}]:`, err);
    return null;
  }
}

/**
 * Sends a natural language query to the PostGIS RAG chatbot endpoint.
 */
export async function sendChatMessage(message: string): Promise<ChatResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server returned ${res.status}: ${errorText}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('API Error [sendChatMessage]:', err);
    throw err;
  }
}

/**
 * Fetches live AQI for coordinates
 */
export async function fetchLiveAQI(lat: number, lng: number): Promise<LiveAQIResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/live-aqi?lat=${lat}&lng=${lng}`);
    if (!res.ok) throw new Error(`Failed to fetch live AQI: ${res.statusText}`);
    const data = await res.json();
    if (data && typeof data.aqi === 'number') {
      data.aqi = sanitizeAqi(data.aqi);
    }
    return data;
  } catch (err) {
    console.error('API Error [fetchLiveAQI]:', err);
    return null;
  }
}

export const fetchGridLiveAQI = async (gridId: string): Promise<LiveAQIResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/live-aqi/grid/${gridId}`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching live AQI for grid ${gridId}:`, error);
    return null;
  }
};

/**
 * Fetches live Delhi AQI
 */
export async function fetchDelhiAQI(): Promise<LiveAQIResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/live-aqi/delhi`);
    if (!res.ok) throw new Error(`Failed to fetch Delhi AQI: ${res.statusText}`);
    const data = await res.json();
    if (data && typeof data.aqi === 'number') {
        data.aqi = sanitizeAqi(data.aqi);
    }
    return data;
  } catch (err) {
    console.error('API Error [fetchDelhiAQI]:', err);
    return null;
  }
}

/**
 * Fetches live Weather for coordinates
 */
export async function fetchLiveWeather(lat: number, lng: number): Promise<LiveWeatherResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/live-weather?lat=${lat}&lng=${lng}`);
    if (!res.ok) throw new Error(`Failed to fetch live weather: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('API Error [fetchLiveWeather]:', err);
    return null;
  }
}

/**
 * Fetches backend health
 */
export async function fetchBackendHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Failed to fetch backend health: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('API Error [fetchBackendHealth]:', err);
    return null;
  }
}

/**
 * Fetches sensor readings for a grid ID
 */
export async function fetchSensorReadings(gridId: string): Promise<SensorReading[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/sensor-readings/${encodeURIComponent(gridId)}`);
    if (!res.ok) throw new Error(`Failed to fetch sensor readings: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(`API Error [fetchSensorReadings for ${gridId}]:`, err);
    return [];
  }
}
