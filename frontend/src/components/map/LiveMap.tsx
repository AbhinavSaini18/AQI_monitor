import React, { useState, useCallback, useEffect } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { X, Plus, Minus, Maximize2, Layers } from 'lucide-react';

/* ── CARTO dark basemap ── */
// Added 'any' type here to satisfy MapLibre's strict StyleSpecification requirements
const MAP_STYLE: any = {
  version: 8,
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  sources: {
    carto: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
    },
  },
  layers: [{ id: 'basemap', type: 'raster', source: 'carto' }],
};

/* ── Delhi Center ── */
const LNG = 77.2090;
const LAT = 28.6139;

/* ── Layer toggles ── */
const LAYER_OPTIONS = [
  { label: 'Land Use',          on: true  },
  { label: 'Traffic',           on: true  },
  { label: 'Construction',      on: true  },
  { label: 'Satellite Thermal', on: false, emoji: '🔥' },
  { label: 'Meteo',             on: false },
];

/* ── Top quick-select ── */
const TOP_BTNS = [
  { label: 'Land Use',     icon: '🌍' },
  { label: 'Traffic',      icon: '🚦' },
  { label: 'Construction', icon: '🏗️' },
  { label: 'Satellite',    icon: '🛰️' },
  { label: 'Thermal',      icon: '🌡️' },
  { label: 'Meteo',        icon: '🌤️' },
];

/* ── AQI colour scale ── */
const AQI_SCALE = [
  { label: '350+', color: '#7c3aed' },
  { label: '300',  color: '#b91c1c' },
  { label: '250',  color: '#ef4444' },
  { label: '200',  color: '#f97316' },
  { label: '150',  color: '#fb923c' },
  { label: '100',  color: '#eab308' },
  { label: '50',   color: '#84cc16' },
  { label: '0',    color: '#22c55e' },
];

export default function LiveMap() {
  const [showPanel,  setShowPanel]  = useState(true);
  const [activeTop,  setActiveTop]  = useState('Traffic');
  
  // Moved inside the component and added TypeScript generic <any>
  const [gridGeoJSON, setGridGeoJSON] = useState<any>(null);

  // Added TypeScript Record type so it knows the keys are strings and values are booleans
  const [layers, setLayers] = useState<Record<string, boolean>>(
    LAYER_OPTIONS.reduce((a, l) => ({ ...a, [l.label]: l.on }), {})
  );

  // Added 'lbl: string' type
  const toggle = useCallback((lbl: string) => setLayers(p => ({ ...p, [lbl]: !p[lbl] })), []);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/grid').then(res => res.json()),
      fetch('http://localhost:8000/predictions/heatmap').then(res => res.json())
    ])
    .then(([gridData, heatmapData]) => {
      
      // Typed the dictionary keys and values
      const aqiLookup: Record<string, number> = {};
      
      // Typed the incoming API item as 'any'
      heatmapData.forEach((item: any) => {
        aqiLookup[item.grid_id] = item.predicted_aqi;
      });

      // Typed the incoming API cell as 'any'
      const features = gridData.map((cell: any) => ({
        type: 'Feature',
        properties: {
          grid_id: cell.grid_id,
          predicted_aqi: aqiLookup[cell.grid_id] || 0
        },
        geometry: JSON.parse(cell.geometry)
      }));

      setGridGeoJSON({
        type: 'FeatureCollection',
        features: features
      });
    })
    .catch(err => console.error("Error fetching backend map data:", err));
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/[0.07]"
         style={{ background: '#070d1a' }}>

      {/* ── Top bar ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20
                      flex items-center gap-0.5
                      bg-black/60 backdrop-blur-xl border border-white/[0.12]
                      rounded-2xl px-2 py-1.5 shadow-2xl">
        {TOP_BTNS.map(({ label, icon }) => (
          <button key={label} onClick={() => setActiveTop(label)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
              activeTop === label
                ? 'bg-white/12 border border-white/20'
                : 'hover:bg-white/6'
            }`}>
            <span className="text-sm leading-none">{icon}</span>
            <span className={`text-[9px] font-semibold whitespace-nowrap ${
              activeTop === label ? 'text-white' : 'text-slate-500'
            }`}>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Map ── */}
      <Map
        initialViewState={{ longitude: LNG, latitude: LAT, zoom: 10.2 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        attributionControl={false}
      >
        {gridGeoJSON && (
          <Source id="delhi-grid-source" type="geojson" data={gridGeoJSON}>
            <Layer
              id="delhi-grid-layer"
              type="fill"
              paint={{
                'fill-color': [
                  'interpolate', ['linear'], ['get', 'predicted_aqi'],
                  0,   '#22c55e', 
                  50,  '#84cc16', 
                  100, '#eab308', 
                  150, '#fb923c', 
                  200, '#f97316', 
                  250, '#ef4444', 
                  300, '#b91c1c', 
                  350, '#7c3aed'  
                ],
                'fill-opacity': 0.65,
                'fill-outline-color': 'rgba(255, 255, 255, 0.05)' 
              }}
            />
          </Source>
        )}
      </Map>

      {/* ── Zoom controls ── */}
      <div className="absolute top-14 left-3 z-20 flex flex-col gap-1">
        {[<Plus key="plus" size={13}/>, <Minus key="minus" size={13}/>].map((icon, i) => (
          <button key={i}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400
                       hover:text-white transition-all border border-white/[0.09] shadow-lg"
            style={{ background: 'rgba(13,21,38,0.9)', backdropFilter: 'blur(8px)' }}>
            {icon}
          </button>
        ))}
        <div className="h-px bg-white/10 my-0.5" />
        <button className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400
                           hover:text-white transition-all border border-white/[0.09] shadow-lg"
                style={{ background: 'rgba(13,21,38,0.9)', backdropFilter: 'blur(8px)' }}>
          <Maximize2 size={11} />
        </button>
      </div>

      {/* ── Layer Toggle Panel ── */}
      {showPanel ? (
        <div className="absolute top-14 left-14 z-20 rounded-2xl p-3.5 w-48 shadow-2xl border border-white/[0.09]"
             style={{ background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(16px)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Layers size={11} className="text-cyan-400" />
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Layer Toggle</p>
            </div>
            <button onClick={() => setShowPanel(false)} className="text-slate-600 hover:text-white transition-colors">
              <X size={11} />
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {LAYER_OPTIONS.map(({ label, emoji }) => (
              <label key={label} className="flex items-center gap-2.5 cursor-pointer select-none group">
                <button onClick={() => toggle(label)}
                  className={`w-4 h-4 rounded-[4px] flex items-center justify-center border flex-shrink-0 transition-all ${
                    layers[label]
                      ? 'border-cyan-400 shadow-sm shadow-cyan-500/30'
                      : 'bg-transparent border-slate-600'
                  }`}
                  style={layers[label] ? { background: '#06b6d4' } : {}}>
                  {layers[label] && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <span className="text-[12px] text-slate-400 group-hover:text-slate-200 transition-colors leading-none">
                  {label}{emoji && ` ${emoji}`}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <button onClick={() => setShowPanel(true)}
          className="absolute top-14 left-14 z-20 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5
                     text-[11px] text-slate-400 hover:text-white transition-all border border-white/[0.09] shadow-lg"
          style={{ background: 'rgba(13,21,38,0.9)', backdropFilter: 'blur(8px)' }}>
          <Layers size={11}/> Layers
        </button>
      )}

      {/* ── AQI Scale ── */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 text-center">AQI</p>
        <div className="rounded-xl overflow-hidden border border-white/[0.09] shadow-xl"
             style={{ background: 'rgba(8,13,26,0.85)', backdropFilter: 'blur(10px)' }}>
          {AQI_SCALE.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 px-2 py-[4px]">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[9px] text-slate-400 font-medium w-6">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}