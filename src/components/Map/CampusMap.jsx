// src/components/Map/CampusMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { supabase } from '../../supabaseClient';

import BuildingInfoModal from './BuildingInfoModal';
// Este import puede llegar como objeto o como URL según tu bundler
import buildingsGeo from '../../data/buildings.geojson';

const MAP_STYLE =
  'https://api.maptiler.com/maps/01987e2d-191e-7be0-8a2c-4b9960d9708d/style.json?key=0uHroK8eNgw194tPKrzI';

const CENTER = [-98.88905, 19.94569];
const BOUNDS = [[-98.895, 19.94], [-98.882, 19.95]];

const SOURCE_ID = 'buildings';
const FILL_LAYER_ID = 'buildings-fill';
const POINT_LAYER_ID = 'buildings-points';

// ---- Helper robusto para evitar crasheos cuando el style no está listo ----
function safeSetFeatureState(map, source, id, state) {
  try {
    if (!map || !map.style) return;
    if (id === null || id === undefined) return;
    if (typeof map.getSource !== 'function') return;
    const src = map.getSource(source);
    if (!src) return;
    if (typeof map.isStyleLoaded === 'function' && !map.isStyleLoaded()) return;
    map.setFeatureState({ source, id }, state);
  } catch (e) {
    console.warn('skip setFeatureState:', e);
  }
}

// Carga robusta del GeoJSON (objeto o URL)
async function loadGeoJSON(maybeObjOrUrl) {
  if (maybeObjOrUrl && typeof maybeObjOrUrl === 'object') return maybeObjOrUrl;
  if (typeof maybeObjOrUrl === 'string') {
    const res = await fetch(maybeObjOrUrl);
    if (!res.ok) throw new Error(`GeoJSON HTTP ${res.status}`);
    return await res.json();
  }
  const res = await fetch('/data/buildings.geojson');
  if (!res.ok) throw new Error(`GeoJSON (public) HTTP ${res.status}`);
  return await res.json();
}

export default function CampusMap() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const mapReadyRef = useRef(false);

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const selectedIdRef = useRef(null); // evita el closure viejo

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: CENTER,
      zoom: 16.7,
      minZoom: 15,
      maxZoom: 18,
      maxBounds: BOUNDS,
      attributionControl: true
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    map.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserLocation: true,
      showUserHeading: true
    }), 'top-right');

    map.on('load', async () => {
      mapReadyRef.current = true;

      // 1) Cargar GeoJSON
      let gj;
      try {
        gj = await loadGeoJSON(buildingsGeo);
      } catch (err) {
        console.error('[CampusMap] Error cargando GeoJSON:', err);
        return;
      }
      const count = Array.isArray(gj?.features) ? gj.features.length : 0;
      console.log(`[CampusMap] GeoJSON features: ${count}`);
      if (!count) return;

      // 2) Fuente con promoteId
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, { type: 'geojson', data: gj, promoteId: 'id' });
      }

      // 3) Capas encima de labels
      const firstSymbolId = map.getStyle()?.layers?.find(l => l.type === 'symbol')?.id;

      if (!map.getLayer(FILL_LAYER_ID)) {
        map.addLayer({
          id: FILL_LAYER_ID,
          type: 'fill',
          source: SOURCE_ID,
          filter: ['any',
            ['==', ['geometry-type'], 'Polygon'],
            ['==', ['geometry-type'], 'MultiPolygon']
          ],
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], '#71007B',
              '#71007B'
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], 0.38,
              0.22
            ],
            'fill-antialias': true
          }
        }, firstSymbolId);
      }

      if (!map.getLayer(POINT_LAYER_ID)) {
        map.addLayer({
          id: POINT_LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], 8,
              6
            ],
            'circle-opacity': 0.9,
            'circle-stroke-width': 2,
            'circle-color': '#71007B',
            'circle-stroke-color': '#ECF0F5'
          }
        }, firstSymbolId);
      }

      // ---- Enfoque y highlight
      const focusFeature = (f) => {
        const id = f.id ?? f.properties?.id;
        if (id == null) return;

        const prev = selectedIdRef.current;
        if (prev && prev !== id) {
          safeSetFeatureState(map, SOURCE_ID, prev, { selected: false });
        }
        safeSetFeatureState(map, SOURCE_ID, id, { selected: true });
        selectedIdRef.current = id;
        setSelectedId(id);

        if (f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon') {
          const [minX, minY, maxX, maxY] = turf.bbox(f);
          map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 80, duration: 800 });
        } else if (f.geometry?.type === 'Point') {
          map.easeTo({ center: f.geometry.coordinates, zoom: Math.max(map.getZoom(), 17), duration: 600 });
        }
      };

      // ---- Abre modal y carga personal desde Supabase
      const openModalFromFeature = async (feature) => {
        if (!feature) return;

        const props = feature.properties || {};
        const featureId = feature.id ?? props.id ?? null;

        // Derivar buildingId (usa tus claves en properties: ud3, ud2, etc.)
        let buildingId =
          props.building_id ||
          props.ud3 || props.ud2 || props.ud1 ||
          props.cafeteria || props.arquitectura || props.culturales || props.hangar ||
          null;

        if (!buildingId && typeof props.nombre === 'string') {
          const up = props.nombre.toUpperCase().trim();
          if (/^UD\d+$/.test(up)) buildingId = up.toLowerCase();
        }

        let personal = [];
        try {
          if (buildingId) {
            const { data: staffRows, error } = await supabase
              .from('building_staff')
              .select(`
                title,
                room_code,
                profiles (
                  first_name,
                  last_name,
                  avatar_url,
                  identifier
                )
              `)
              .eq('building_id', buildingId)
              .order('title', { ascending: true });

            if (error) throw error;

            personal = (staffRows || [])
              .filter(r => r?.profiles)
              .map(r => ({
                name: `${r.profiles.first_name ?? ''} ${r.profiles.last_name ?? ''}`.trim() || 'Sin nombre',
                role: r.title || 'Docente',
                room: r.room_code || null,
                avatar: r.profiles.avatar_url || null,
                employee: r.profiles.identifier || null
              }));
          } else {
            console.warn('No pude inferir buildingId del feature. Props:', props);
          }
        } catch (e) {
          console.error('Supabase error building_staff:', e);
        }

        setSelectedBuilding({
          id: buildingId || featureId,
          name: props.nombre ?? props.name ?? 'Edificio',
          description: props.descripcion ?? props.description ?? '',
          image360: props.image360_url ?? props.foto ?? null,
          carreras: [], aulas: [], oficinas: [],
          personal
        });

        // highlight + zoom
        if (featureId != null) {
          const prev = selectedIdRef.current;
          if (prev && prev !== featureId) {
            safeSetFeatureState(map, SOURCE_ID, prev, { selected: false });
          }
          safeSetFeatureState(map, SOURCE_ID, featureId, { selected: true });
          selectedIdRef.current = featureId;
          setSelectedId(featureId);
        }
        focusFeature(feature);
      };

      // Interacción
      map.on('click', FILL_LAYER_ID, async (e) => {
        await openModalFromFeature(e.features?.[0]);
      });
      map.on('click', POINT_LAYER_ID, async (e) => {
        await openModalFromFeature(e.features?.[0]);
      });

      const setPointer = () => (map.getCanvas().style.cursor = 'pointer');
      const unsetPointer = () => (map.getCanvas().style.cursor = '');
      map.on('mouseenter', FILL_LAYER_ID, setPointer);
      map.on('mouseleave', FILL_LAYER_ID, unsetPointer);
      map.on('mouseenter', POINT_LAYER_ID, setPointer);
      map.on('mouseleave', POINT_LAYER_ID, unsetPointer);
    });

    mapRef.current = map;
    return () => {
      mapReadyRef.current = false;
      try { map.remove(); } catch {}
      mapRef.current = null;
    };
  }, []);

  return (
    <>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
      {selectedBuilding && (
        <BuildingInfoModal
          building={selectedBuilding}
          onClose={() => {
            const map = mapRef.current;
            const prev = selectedIdRef.current;
            if (map && map.style && prev != null) {
              safeSetFeatureState(map, SOURCE_ID, prev, { selected: false });
            }
            selectedIdRef.current = null;
            setSelectedId(null);
            setSelectedBuilding(null);
          }}
        />
      )}
    </>
  );
}
