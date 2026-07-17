import React, { useState, useCallback } from 'react';
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { X, Plus, Minus, Maximize2, Layers } from 'lucide-react';

/* ── CARTO dark basemap ── */
const MAP_STYLE = {
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

/* ── Patiala centre ── */
const LNG = 76.3869;
const LAT = 30.3398;

/* ── Generate realistic AQI heatmap points around Patiala ── */
function generateHeatPoints() {
  const points = [];
  const rings = [
    { count: 1,   radius: 0,    weightRange: [0.95, 1.0]  },   // exact centre – very high
    { count: 8,   radius: 0.03, weightRange: [0.85, 0.97] },
    { count: 16,  radius: 0.07, weightRange: [0.70, 0.90] },
    { count: 24,  radius: 0.13, weightRange: [0.50, 0.75] },
    { count: 32,  radius: 0.22, weightRange: [0.30, 0.55] },
    { count: 40,  radius: 0.35, weightRange: [0.12, 0.32] },
    { count: 48,  radius: 0.52, weightRange: [0.05, 0.15] },
  ];

  rings.forEach(({ count, radius, weightRange }) => {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const r = radius * (0.85 + Math.random() * 0.3);
      const lng = LNG + r * Math.cos(angle) * 1.3;
      const lat = LAT + r * Math.sin(angle);
      const w = weightRange[0] + Math.random() * (weightRange[1] - weightRange[0]);
      points.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: { weight: w } });
    }
  });
  return points;
}

const HEAT_GEOJSON = { type: 'FeatureCollection', features: generateHeatPoints() };

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
  const [showPopup,  setShowPopup]  = useState(true);
  const [showPanel,  setShowPanel]  = useState(true);
  const [activeTop,  setActiveTop]  = useState('Traffic');
  const [layers, setLayers] = useState(
    LAYER_OPTIONS.reduce((a, l) => ({ ...a, [l.label]: l.on }), {})
  );

  const toggle = useCallback(lbl => setLayers(p => ({ ...p, [lbl]: !p[lbl] })), []);

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
        {/* Real Heatmap Layer */}
        <Source id="aqi-heat" type="geojson" data={HEAT_GEOJSON}>
          <Layer
            id="aqi-heatmap"
            type="heatmap"
            paint={{
              /* Kernel radius grows with zoom */
              'heatmap-radius': [
                'interpolate', ['linear'], ['zoom'],
                7,  40,
                9,  70,
                11, 110,
                13, 160,
              ],
              /* Weight = data property */
              'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1],
              /* Intensity boosts with zoom */
              'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 7, 0.8, 13, 2.2],
              /* Colour ramp: green → yellow → orange → red → purple */
              'heatmap-color': [
                'interpolate', ['linear'], ['heatmap-density'],
                0,    'rgba(0,0,0,0)',
                0.10, 'rgba(34,197,94,0.6)',
                0.28, 'rgba(132,204,22,0.7)',
                0.45, 'rgba(234,179,8,0.8)',
                0.62, 'rgba(249,115,22,0.88)',
                0.78, 'rgba(239,68,68,0.92)',
                0.90, 'rgba(185,28,28,0.95)',
                1.0,  'rgba(109,40,217,1)',
              ],
              'heatmap-opacity': 0.88,
            }}
          />
        </Source>

        {/* Marker */}
        <Marker longitude={LNG} latitude={LAT} anchor="bottom">
          <div className="flex flex-col items-center cursor-pointer" onClick={() => setShowPopup(true)}>
            <div className="w-5 h-5 rounded-full border-[3px] border-white shadow-2xl"
                 style={{ background: '#3b82f6', boxShadow: '0 0 14px rgba(59,130,246,0.9)' }} />
            <div className="w-0.5 h-3 bg-white/50" />
          </div>
        </Marker>

        {/* Popup */}
        {showPopup && (
          <Popup longitude={LNG} latitude={LAT} anchor="left" offset={[16, -18]}
                 closeOnClick={false} onClose={() => setShowPopup(false)}>
            <div className="rounded-2xl p-3.5 min-w-[172px] shadow-2xl border border-white/12"
                 style={{ background: 'rgba(10,16,32,0.97)', backdropFilter: 'blur(16px)' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-[12px] font-bold text-white leading-tight">Sector 7, Patiala</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Urban Estate · Punjab</p>
                </div>
                <button onClick={() => setShowPopup(false)} className="text-slate-600 hover:text-white transition-colors mt-0.5">
                  <X size={11} />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <p className="font-display font-black text-2xl" style={{ color: '#f97316' }}>232</p>
                <div>
                  <p className="text-[9px] text-slate-400 leading-none">AQI</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 inline-block"
                        style={{ background: 'rgba(249,115,22,0.2)', color: '#f97316' }}>Poor</span>
                </div>
              </div>
              <div className="border-t border-white/[0.08] pt-2 space-y-0.5">
                <p className="text-[10px] text-slate-500">30.33°N &nbsp; 76.38°E</p>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* ── Zoom controls ── */}
      <div className="absolute top-14 left-3 z-20 flex flex-col gap-1">
        {[<Plus size={13}/>, <Minus size={13}/>].map((icon, i) => (
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

      {/* ── Bottom timeline ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pt-12 pb-3.5"
           style={{ background: 'linear-gradient(to top, rgba(7,13,26,0.96) 55%, transparent)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-slate-600 font-medium">Yesterday</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-500/60" />
            <span className="text-[11px] font-bold text-cyan-300">Today</span>
          </div>
          <span className="text-[11px] text-slate-600 font-medium">Tomorrow</span>
        </div>
        <div className="relative h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="absolute left-0 right-1/2 h-full rounded-l-full"
               style={{ background: 'linear-gradient(to right, rgba(30,41,59,0.8), #06b6d4)' }} />
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2
                          w-4 h-4 rounded-full border-2 border-[#070d1a] cursor-grab"
               style={{ background: '#06b6d4', boxShadow: '0 0 12px rgba(6,182,212,0.7)' }} />
        </div>
      </div>
    </div>
  );
}