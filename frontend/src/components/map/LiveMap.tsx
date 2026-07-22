import { useEffect, useState, useMemo } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';

import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchGrid, fetchHeatmap, GridCell, HeatmapItem } from '../../utils/api';
import { Layers } from 'lucide-react';
import type { FeatureCollection, Feature, Geometry } from 'geojson';

interface LiveMapProps {
  onSelectGrid?: (gridId: string | null) => void;
  selectedGridId?: string | null;
}

// CARTO Light basemap
const MAP_STYLE = {
  version: 8,
  sources: {
    'carto-light': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
  },
  layers: [
    {
      id: 'carto-light-layer',
      type: 'raster',
      source: 'carto-light',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

export default function LiveMap({ onSelectGrid, selectedGridId }: LiveMapProps) {
  const [gridData, setGridData] = useState<GridCell[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapItem[]>([]);
  const [activeLayer, setActiveLayer] = useState<'heatmap' | 'traffic' | 'construction' | 'thermal' | 'meteo'>('heatmap');
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; gridId: string; aqi: number; traffic: number; construction: number; thermal: number; meteo: number } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const grids = await fetchGrid();
      const hmap = await fetchHeatmap();
      setGridData(grids);
      setHeatmapData(hmap);
    };
    loadData();
    const interval = setInterval(loadData, 300000); // 5 mins
    return () => clearInterval(interval);
  }, []);

  const geojson = useMemo<FeatureCollection | null>(() => {
    if (!gridData.length || !heatmapData.length) return null;
    
    const aqiMap = new globalThis.Map(heatmapData.map(item => [item.grid_id, item.predicted_aqi]));
    const attrMap = new globalThis.Map(heatmapData.map(item => [item.grid_id, item.source_attribution]));

    const features: Feature[] = gridData
      .map(cell => {
        try {
          const geom = typeof cell.geometry === 'string' ? JSON.parse(cell.geometry) : cell.geometry;
          const attr = attrMap.get(cell.grid_id) || {};
          return {
            type: 'Feature',
            geometry: geom as Geometry,
            properties: {
              grid_id: cell.grid_id,
              aqi: aqiMap.get(cell.grid_id) || 0,
              traffic: typeof attr === 'object' ? attr.traffic || 0 : 0,
              construction: typeof attr === 'object' ? attr.construction || 0 : 0,
              thermal: typeof attr === 'object' ? attr.thermal || 0 : 0,
              meteo: typeof attr === 'object' ? attr.meteo || 0 : 0,
            }
          } as Feature;
        } catch (e) {
          return null;
        }
      })
      .filter((f): f is Feature => f !== null);

    return { type: 'FeatureCollection', features };
  }, [gridData, heatmapData]);

  const getFillColor = (layer: string) => {
    if (layer === 'traffic') return ['interpolate', ['linear'], ['get', 'traffic'], 0, 'rgba(0,0,0,0)', 30, 'rgba(96, 165, 250, 0.4)', 60, 'rgba(59, 130, 246, 0.8)'];
    if (layer === 'construction') return ['interpolate', ['linear'], ['get', 'construction'], 0, 'rgba(0,0,0,0)', 20, 'rgba(203, 213, 225, 0.4)', 40, 'rgba(148, 163, 184, 0.8)'];
    if (layer === 'thermal') return ['interpolate', ['linear'], ['get', 'thermal'], 0, 'rgba(0,0,0,0)', 20, 'rgba(248, 113, 113, 0.4)', 40, 'rgba(220, 38, 38, 0.8)'];
    if (layer === 'meteo') return ['interpolate', ['linear'], ['get', 'meteo'], 0, 'rgba(0,0,0,0)', 20, 'rgba(52, 211, 153, 0.4)', 40, 'rgba(16, 185, 129, 0.8)'];
    return [
      'interpolate', ['linear'], ['get', 'aqi'],
      0, 'rgba(34, 197, 94, 0.4)',
      50, 'rgba(34, 197, 94, 0.5)', 
      100, 'rgba(234, 179, 8, 0.5)',
      200, 'rgba(249, 115, 22, 0.6)',
      300, 'rgba(239, 68, 68, 0.7)',
      400, 'rgba(147, 51, 234, 0.8)',
      500, 'rgba(153, 27, 27, 0.9)'
    ];
  };

  const fillLayerStyle = {
    id: 'grid-fill',
    type: 'fill',
    paint: {
      'fill-color': getFillColor(activeLayer),
      'fill-opacity': 0.7
    }
  };

  const lineLayerStyle = {
    id: 'grid-line',
    type: 'line',
    paint: {
      'line-color': '#171717',
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1,
        0.1
      ],
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        2,
        0.5
      ]
    }
  };

  const selectedLineLayerStyle = {
    id: 'grid-selected-line',
    type: 'line',
    paint: {
      'line-color': '#000000',
      'line-width': 3
    },
    filter: ['==', 'grid_id', selectedGridId || '']
  };

  const onClick = (event: any) => {
    const feature = event.features && event.features[0];
    if (feature && onSelectGrid) {
      onSelectGrid(feature.properties.grid_id);
    } else if (onSelectGrid) {
      onSelectGrid(null);
    }
  };

  const onHover = (event: any) => {
    const feature = event.features && event.features[0];
    if (feature) {
      setHoverInfo({
        x: event.point.x,
        y: event.point.y,
        gridId: feature.properties.grid_id,
        aqi: feature.properties.aqi,
        traffic: feature.properties.traffic,
        construction: feature.properties.construction,
        thermal: feature.properties.thermal,
        meteo: feature.properties.meteo
      });
    } else {
      setHoverInfo(null);
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-neutral-900 text-white px-4 py-2 flex items-center gap-2 pointer-events-auto shadow-md">
            <Layers className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">MAP LAYERS</span>
        </div>
        <div className="flex bg-white shadow-md border border-neutral-300 pointer-events-auto">
            {['heatmap', 'traffic', 'construction', 'thermal', 'meteo'].map(layer => (
                <button
                    key={layer}
                    onClick={() => setActiveLayer(layer as any)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                        activeLayer === layer 
                            ? 'bg-neutral-900 text-white' 
                            : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                >
                    {layer}
                </button>
            ))}
        </div>
      </div>

      <Map
        initialViewState={{
          longitude: 77.2090,
          latitude: 28.6139,
          zoom: 10
        }}
        mapStyle={MAP_STYLE as any}
        interactiveLayerIds={['grid-fill']}
        onClick={onClick}
        onMouseMove={onHover}
        onMouseLeave={() => setHoverInfo(null)}
        style={{ width: '100%', height: '100%' }}
        cursor={hoverInfo ? 'pointer' : 'default'}
      >
        {geojson && (
          <Source id="grid" type="geojson" data={geojson}>
            <Layer {...(fillLayerStyle as any)} />
            <Layer {...(lineLayerStyle as any)} />
            <Layer {...(selectedLineLayerStyle as any)} />
          </Source>
        )}
      </Map>

      {/* Tooltip */}
      {hoverInfo && (
        <div 
            className="absolute bg-white border border-neutral-300 p-3 shadow-lg pointer-events-none"
            style={{ left: hoverInfo.x + 10, top: hoverInfo.y + 10 }}
        >
            <div className="text-[10px] font-bold text-neutral-500 uppercase mb-1">GRID ID</div>
            <div className="text-xs font-mono font-bold bg-neutral-100 p-1 mb-2">{hoverInfo.gridId}</div>
            <div className="flex justify-between items-center border-t border-neutral-200 pt-2">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">
                  {activeLayer === 'heatmap' ? 'PREDICTED AQI' : `${activeLayer} %`}
                </span>
                <span className="text-sm font-black">
                  {activeLayer === 'heatmap' ? hoverInfo.aqi.toFixed(0) : hoverInfo[activeLayer]?.toFixed(0) || '0'}
                </span>
            </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-white border border-neutral-300 p-4 shadow-md pointer-events-auto">
        <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">AQI SCALE</h4>
        <div className="flex flex-col gap-2">
            {[
                { label: 'GOOD', color: 'bg-green-500', range: '0-50' },
                { label: 'SATISFACTORY', color: 'bg-yellow-500', range: '51-100' },
                { label: 'MODERATE', color: 'bg-orange-500', range: '101-200' },
                { label: 'POOR', color: 'bg-red-500', range: '201-300' },
                { label: 'VERY POOR', color: 'bg-purple-600', range: '301-400' },
                { label: 'SEVERE', color: 'bg-red-800', range: '401+' }
            ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-3 h-3 ${item.color}`} />
                    <span className="text-[10px] font-bold text-neutral-900 uppercase w-24">{item.label}</span>
                    <span className="text-[10px] font-medium text-neutral-500 w-12 text-right">{item.range}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}