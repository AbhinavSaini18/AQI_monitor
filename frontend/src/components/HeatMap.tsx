import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin, Activity } from 'lucide-react';
import type { Location } from '../types';
import { getAQIColor, getAQILevel } from '../utils/aqi';
import { heatmapLocations } from '../data/mockData';

interface HeatMapProps {
  onLocationSelect?: (loc: Location) => void;
}

function createIcon(aqi: number, selected: boolean): L.DivIcon {
  const color = getAQIColor(aqi);
  const size = selected ? 18 : 12;
  return L.divIcon({
    className: 'aqi-marker',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid rgba(255,255,255,0.85);
      box-shadow:0 0 14px ${color}90, 0 0 4px ${color};
      ${selected ? 'transform:scale(1.4);' : ''}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createHeatCircle(aqi: number): L.Circle {
  const color = getAQIColor(aqi);
  return L.circle([0, 0], {
    radius: Math.max(300, (aqi / 250) * 900),
    color,
    fillColor: color,
    fillOpacity: 0.18,
    stroke: false,
  });
}

export default function HeatMap({ onLocationSelect }: HeatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const heatRef = useRef<L.Circle[]>([]);
  const [selected, setSelected] = useState<Location | null>(heatmapLocations[0]);
  const [showHeat, setShowHeat] = useState(true);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [30.338, 76.39],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Heat circles
    heatRef.current = heatmapLocations.map((loc) => {
      const circle = createHeatCircle(loc.aqi);
      circle.setLatLng([loc.lat, loc.lng]);
      circle.addTo(map);
      return circle;
    });

    // Markers
    heatmapLocations.forEach((loc) => {
      const marker = L.marker([loc.lat, loc.lng], { icon: createIcon(loc.aqi, loc.name === selected?.name) })
        .addTo(map)
        .bindTooltip(
          `<div style="font-family:system-ui;padding:4px 2px">
            <div style="font-weight:600;color:#fff;font-size:13px">${loc.name}</div>
            <div style="color:${getAQIColor(loc.aqi)};font-weight:700;font-size:15px">AQI ${loc.aqi} · ${getAQILevel(loc.aqi)}</div>
            <div style="color:#94a3b8;font-size:11px">${loc.zone}</div>
          </div>`,
          { className: 'aqi-tooltip', direction: 'top', offset: [0, -10] }
        );

      marker.on('click', () => {
        setSelected(loc);
        onLocationSelect?.(loc);
        map.flyTo([loc.lat, loc.lng], 14, { duration: 0.8 });
      });

      markersRef.current[loc.name] = marker;
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
      heatRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle heat visibility
  useEffect(() => {
    heatRef.current.forEach((c) => {
      if (showHeat) c.addTo(mapRef.current!);
      else c.remove();
    });
  }, [showHeat]);

  // Update marker icons when selection changes
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([name, marker]) => {
      const loc = heatmapLocations.find((l) => l.name === name);
      if (loc) marker.setIcon(createIcon(loc.aqi, name === selected?.name));
    });
  }, [selected]);

  // Live AQI updates on markers
  useEffect(() => {
    const interval = setInterval(() => {
      heatmapLocations.forEach((loc, i) => {
        const delta = Math.floor(Math.random() * 9) - 4;
        loc.aqi = Math.max(40, Math.min(280, loc.aqi + delta));
        const marker = markersRef.current[loc.name];
        if (marker) marker.setIcon(createIcon(loc.aqi, loc.name === selected?.name));
        const circle = heatRef.current[i];
        if (circle) {
          circle.setLatLng([loc.lat, loc.lng]);
          circle.setStyle({ fillColor: getAQIColor(loc.aqi), color: getAQIColor(loc.aqi) });
        }
      });
      if (selected) {
        const fresh = heatmapLocations.find((l) => l.name === selected.name);
        if (fresh) setSelected({ ...fresh });
      }
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm">Live Air Quality Map — Patiala</h3>
          <p className="text-slate-500 text-xs mt-0.5">12 monitoring stations · Real-time · OpenStreetMap</p>
        </div>
        <button
          onClick={() => setShowHeat(!showHeat)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            showHeat ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700/50 text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Heat {showHeat ? 'On' : 'Off'}
        </button>
      </div>

      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-slate-700/40"
        style={{ height: '420px', background: '#0f172a', isolation: 'isolate', zIndex: 0 }}
      />

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-3 px-1">
        <span className="text-[11px] text-slate-400 font-medium">AQI Scale:</span>
        {[
          { c: '#22c55e', l: 'Good (0-50)' },
          { c: '#eab308', l: 'Moderate (51-100)' },
          { c: '#f97316', l: 'Poor (101-200)' },
          { c: '#ef4444', l: 'Very Poor (201-300)' },
          { c: '#7c2d12', l: 'Severe (300+)' },
        ].map((s) => (
          <span key={s.l} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.c }} />
            <span className="text-[11px] text-slate-400">{s.l}</span>
          </span>
        ))}
      </div>

      {/* Selected detail */}
      {selected && (
        <div className="mt-4 flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700/30">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: getAQIColor(selected.aqi) + '20' }}>
            <MapPin className="w-6 h-6" style={{ color: getAQIColor(selected.aqi) }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">{selected.name}</p>
            <p className="text-slate-500 text-xs">{selected.zone} · Ward {selected.ward}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold" style={{ color: getAQIColor(selected.aqi) }}>{selected.aqi}</p>
            <p className="text-slate-400 text-xs flex items-center gap-1 justify-end">
              <Activity className="w-3 h-3" /> {getAQILevel(selected.aqi)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
