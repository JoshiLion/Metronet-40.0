// src/components/Map/CampusMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { supabase } from '../../supabaseClient';

import BuildingInfoModal from './BuildingInfoModal';
// Si ya pusiste el parchado, puedes usar:
// import buildingsGeo from '../../data/buildings.patched.geojson';
import buildingsGeo from '../../data/buildings.geojson';

const MAP_STYLE =
  'https://api.maptiler.com/maps/01987e2d-191e-7be0-8a2c-4b9960d9708d/style.json?key=0uHroK8eNgw194tPKrzI';

const CENTER = [-98.88905, 19.94569];
const BOUNDS = [[-98.895, 19.94], [-98.882, 19.95]];

const SOURCE_ID = 'buildings';
const FILL_LAYER_ID = 'buildings-fill';
const POINT_LAYER_ID = 'buildings-points';

/* ---------- Helpers defensivos ---------- */
function styleReady(map) {
  try { return !!map?.getStyle?.(); } catch { return false; }
}
function hasSource(map, id) {
  try { return !!map?.getSource?.(id); } catch { return false; }
}
function hasLayer(map, id) {
  try {
    const style = map?.getStyle?.();
    return !!style?.layers?.some(l => l.id === id);
  } catch { return false; }
}
function firstSymbolId(map) {
  try { return map?.getStyle?.()?.layers?.find(l => l.type === 'symbol')?.id; }
  catch { return undefined; }
}
function safeSetFeatureState(map, source, id, state) {
  try {
    if (!styleReady(map) || id == null || !hasSource(map, source)) return;
    map.setFeatureState({ source, id }, state);
  } catch (e) { console.warn('skip setFeatureState:', e); }
}
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
/* ---------------------------------------- */

/** Trae datos reales de Supabase para el edificio dado */
async function fetchBuildingData(buildingId) {
  // 1) Personal (JOIN embebido a profiles)
  const staffQ = supabase
    .from('building_staff')
    .select(`
      title,
      room_code,
      profiles:profile_id (
        first_name,
        last_name,
        avatar_url,
        identifier,
        email
      )
    `)
    .eq('building_id', buildingId)
    .order('title', { ascending: true });

  // 2) Programas del edificio
  const programsQ = supabase
    .from('building_programs')
    .select(`programs ( id, name )`)
    .eq('building_id', buildingId);

  // 3) Aulas/Oficinas (rooms)
  const roomsQ = supabase
    .from('rooms')
    .select(`id, code, kind`)
    .eq('building_id', buildingId)
    .order('code', { ascending: true });

  const [staffRes, programsRes, roomsRes] = await Promise.all([staffQ, programsQ, roomsQ]);

  if (staffRes.error)    console.error('staff error', staffRes.error);
  if (programsRes.error) console.error('programs error', programsRes.error);
  if (roomsRes.error)    console.error('rooms error', roomsRes.error);

  // Normaliza Personal para la card
  const personal = (staffRes.data || [])
    .filter(r => r?.profiles)
    .map(r => {
      const p = r.profiles;
      const name = [p.first_name ?? '', p.last_name ?? ''].join(' ').trim() || (p.identifier || 'Sin nombre');
      // Gmail compose directo
      const gmailUrl = p.email
        ? `https://mail.google.com/mail/?view=cm&fs=1&to=${
            encodeURIComponent(p.email)
          }&su=${encodeURIComponent('Consulta')}`
        : null;
      return {
        name,
        role: r.title || 'Docente',
        room: r.room_code || null,
        avatar: p.avatar_url || null,
        employee: p.identifier || null,
        contactUrl: gmailUrl
      };
    });

  const programs = (programsRes.data || [])
    .map(r => r?.programs?.name)
    .filter(Boolean);

  const rooms = roomsRes.data || [];
  const aulas = rooms
    .filter(r => (r.kind || '').toLowerCase().includes('aula') || (r.kind || '').toLowerCase() === 'classroom')
    .map(r => r.code);
  const oficinas = rooms
    .filter(r => (r.kind || '').toLowerCase().includes('oficina') || (r.kind || '').toLowerCase() === 'office')
    .map(r => r.code);

  return { personal, carreras: programs, aulas, oficinas };
}

export default function CampusMap() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const selectedIdRef = useRef(null);

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
      // 1) Carga del GeoJSON (con properties.building_id ya presente)
      let gj;
      try { gj = await loadGeoJSON(buildingsGeo); }
      catch (err) { console.error('[CampusMap] GeoJSON:', err); return; }
      if (!Array.isArray(gj?.features) || !gj.features.length) {
        console.warn('[CampusMap] GeoJSON vacío'); return;
      }

      // 2) Fuente
      if (!hasSource(map, SOURCE_ID)) {
        try { map.addSource(SOURCE_ID, { type: 'geojson', data: gj, promoteId: 'id' }); }
        catch (e) { console.warn('addSource skipped:', e); }
      }

      // 3) Capas por encima de labels
      const symbolId = firstSymbolId(map);

      if (!hasLayer(map, FILL_LAYER_ID)) {
        try {
          map.addLayer({
            id: FILL_LAYER_ID,
            type: 'fill',
            source: SOURCE_ID,
            filter: ['any',
              ['==', ['geometry-type'], 'Polygon'],
              ['==', ['geometry-type'], 'MultiPolygon']
            ],
            paint: {
              'fill-color': '#71007B',
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'selected'], false], 0.38,
                0.22
              ],
              'fill-outline-color': 'rgba(0,0,0,0)'
            }
          }, symbolId);
        } catch (e) { console.warn('addLayer FILL skipped:', e); }
      }

      if (!hasLayer(map, POINT_LAYER_ID)) {
        try {
          map.addLayer({
            id: POINT_LAYER_ID,
            type: 'circle',
            source: SOURCE_ID,
            filter: ['==', ['geometry-type'], 'Point'],
            paint: {
              'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 8, 6],
              'circle-opacity': 0.9,
              'circle-stroke-width': 2,
              'circle-color': '#71007B',
              'circle-stroke-color': '#ECF0F5'
            }
          }, symbolId);
        } catch (e) { console.warn('addLayer POINT skipped:', e); }
      }

      const focusFeature = (f) => {
        const id = f.id ?? f.properties?.id;
        if (id == null) return;

        const prev = selectedIdRef.current;
        if (prev && prev !== id) safeSetFeatureState(map, SOURCE_ID, prev, { selected: false });
        safeSetFeatureState(map, SOURCE_ID, id, { selected: true });
        selectedIdRef.current = id;

        if (f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon') {
          const [minX, minY, maxX, maxY] = turf.bbox(f);
          map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 80, duration: 800 });
        } else if (f.geometry?.type === 'Point') {
          map.easeTo({ center: f.geometry.coordinates, zoom: Math.max(map.getZoom(), 17), duration: 600 });
        }
      };

      // --- Abre modal y carga detalles desde Supabase
      const openModalFromFeature = async (feature) => {
        if (!feature) return;

        const props = feature.properties || {};
        const featureId = feature.id ?? props.id ?? null;

        // 🔴 Punto A: toma SIEMPRE el building_id del GeoJSON
        let buildingId = (props.building_id || '').toLowerCase().trim();

        // Fallback por si alguna feature antigua no lo trae
        if (!buildingId && typeof props.nombre === 'string') {
          const up = props.nombre.toUpperCase().trim();
          if (/^UD\d+$/.test(up)) buildingId = up.toLowerCase();
        }
        if (!buildingId) {
          console.warn('No pude inferir buildingId del feature. Props:', props);
        }

        // Pide datos reales
        let carreras = [], aulas = [], oficinas = [], personal = [];
        try {
          if (buildingId) {
            const fetched = await fetchBuildingData(buildingId);
            carreras = fetched.carreras;
            aulas    = fetched.aulas;
            oficinas = fetched.oficinas;
            personal = fetched.personal;
          }
        } catch (e) {
          console.error('Supabase error (detalles edificio):', e);
        }

        setSelectedBuilding({
          id: buildingId || featureId,
          name: props.nombre ?? props.name ?? 'Edificio',
          description: props.descripcion ?? props.description ?? '',
          image360: props.photo_url || props.image360_url || props.foto || null,
          carreras, aulas, oficinas, personal
        });

        if (featureId != null) {
          const prev = selectedIdRef.current;
          if (prev && prev !== featureId) safeSetFeatureState(map, SOURCE_ID, prev, { selected: false });
          safeSetFeatureState(map, SOURCE_ID, featureId, { selected: true });
          selectedIdRef.current = featureId;
        }
        focusFeature(feature);
      };

      map.on('click', FILL_LAYER_ID, async (e) => { await openModalFromFeature(e.features?.[0]); });
      map.on('click', POINT_LAYER_ID, async (e) => { await openModalFromFeature(e.features?.[0]); });

      const setPointer = () => (map.getCanvas().style.cursor = 'pointer');
      const unsetPointer = () => (map.getCanvas().style.cursor = '');
      map.on('mouseenter', FILL_LAYER_ID, setPointer);
      map.on('mouseleave', FILL_LAYER_ID, unsetPointer);
      map.on('mouseenter', POINT_LAYER_ID, setPointer);
      map.on('mouseleave', POINT_LAYER_ID, unsetPointer);
    });

    mapRef.current = map;
    return () => {
      try { map.remove(); } catch {}
      mapRef.current = null;
      selectedIdRef.current = null;
    };
  }, []);

  return (
    <div className="bi-host" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} className="map-canvas" style={{ position: 'absolute', inset: 0 }} />
      {selectedBuilding && (
        <BuildingInfoModal
          building={selectedBuilding}
          onClose={() => {
            const map = mapRef.current;
            const prev = selectedIdRef.current;
            if (styleReady(map) && prev != null) {
              safeSetFeatureState(map, SOURCE_ID, prev, { selected: false });
            }
            selectedIdRef.current = null;
            setSelectedBuilding(null);
          }}
        />
      )}
    </div>
  );
}
