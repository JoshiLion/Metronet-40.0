// src/components/Map/CampusMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { supabase } from '../../supabaseClient';

import BuildingInfoModal from './BuildingInfoModal';
import SearchBar from '../SearchBar/SearchBar';
import buildingsGeo from '../../data/buildings.geojson';

const MAP_STYLE =
  'https://api.maptiler.com/maps/01987e2d-191e-7be0-8a2c-4b9960d9708d/style.json?key=0uHroK8eNgw194tPKrzI';

const CENTER = [-98.88905, 19.94569];
const BOUNDS = [[-98.895, 19.94], [-98.882, 19.95]];

const SOURCE_ID = 'buildings';
const FILL_LAYER_ID = 'buildings-fill';
const POINT_LAYER_ID = 'buildings-points';

function styleReady(map) { try { return !!map?.getStyle?.(); } catch { return false; } }
function hasSource(map, id) { try { return !!map?.getSource?.(id); } catch { return false; } }
function hasLayer(map, id) { try { return !!map?.getStyle?.()?.layers?.some(l => l.id === id); } catch { return false; } }
function firstSymbolId(map) { try { return map?.getStyle?.()?.layers?.find(l => l.type === 'symbol')?.id; } catch { return undefined; } }
function safeSetFeatureState(map, source, id, state) { try { if (!styleReady(map) || id == null || !hasSource(map, source)) return; map.setFeatureState({ source, id }, state); } catch {} }

async function loadGeoJSON(maybeObjOrUrl) {
  if (maybeObjOrUrl && typeof maybeObjOrUrl === 'object') return maybeObjOrUrl;
  if (typeof maybeObjOrUrl === 'string') { const res = await fetch(maybeObjOrUrl); if (!res.ok) throw new Error(`GeoJSON HTTP ${res.status}`); return await res.json(); }
  const res = await fetch('/data/buildings.geojson'); if (!res.ok) throw new Error(`GeoJSON (public) HTTP ${res.status}`); return await res.json();
}

async function fetchBuildingData(buildingId) {
  const staffQ = supabase
    .from('building_staff')
    .select(`title, room_code, profiles:profile_id ( first_name, last_name, avatar_url, identifier, email )`)
    .eq('building_id', buildingId)
    .order('title', { ascending: true });

  const programsQ = supabase.from('building_programs').select(`programs ( id, name )`).eq('building_id', buildingId);
  const roomsQ    = supabase.from('rooms').select(`id, code, kind`).eq('building_id', buildingId).order('code', { ascending: true });

  const [staffRes, programsRes, roomsRes] = await Promise.all([staffQ, programsQ, roomsQ]);

  const personal = (staffRes.data || []).filter(r => r?.profiles).map(r => {
    const p = r.profiles;
    const name = [p.first_name ?? '', p.last_name ?? ''].join(' ').trim() || (p.identifier || 'Sin nombre');
    const gmailUrl = p.email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(p.email)}&su=${encodeURIComponent('Consulta')}` : null;
    return {
      name,
      role: r.title || 'Docente',
      room: r.room_code || null,
      avatar: p.avatar_url || null,
      employee: p.identifier || null,   // ⬅ importante para emparejar
      contactUrl: gmailUrl
    };
  });

  const programs = (programsRes.data || []).map(r => r?.programs?.name).filter(Boolean);
  const rooms    = roomsRes.data || [];
  const aulas    = rooms.filter(r => (r.kind || '').toLowerCase().includes('aula')    || (r.kind || '').toLowerCase() === 'classroom').map(r => r.code);
  const oficinas = rooms.filter(r => (r.kind || '').toLowerCase().includes('oficina') || (r.kind || '').toLowerCase() === 'office').map(r => r.code);

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
      trackUserLocation: true, showUserLocation: true, showUserHeading: true
    }), 'top-right');

    map.on('load', async () => {
      // cargar geojson + índice por building_id
      const gj = await loadGeoJSON(buildingsGeo);
      const featuresIndex = new Map((gj.features || []).map(f => {
        const bid = String(f?.properties?.building_id ?? '').toLowerCase().trim();
        const key = bid || String(f.id ?? f?.properties?.id ?? '');
        return [key, f];
      }));

      if (!hasSource(map, SOURCE_ID)) map.addSource(SOURCE_ID, { type: 'geojson', data: gj, promoteId: 'id' });
      const symbolId = firstSymbolId(map);

      if (!hasLayer(map, FILL_LAYER_ID)) {
        map.addLayer({
          id: FILL_LAYER_ID, type: 'fill', source: SOURCE_ID,
          filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']],
          paint: {
            'fill-color': '#71007B',
            'fill-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.38, 0.22],
            'fill-outline-color': 'rgba(0,0,0,0)'
          }
        }, symbolId);
      }
      if (!hasLayer(map, POINT_LAYER_ID)) {
        map.addLayer({
          id: POINT_LAYER_ID, type: 'circle', source: SOURCE_ID, filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 8, 6],
            'circle-opacity': 0.9, 'circle-stroke-width': 2,
            'circle-color': '#71007B', 'circle-stroke-color': '#ECF0F5'
          }
        }, symbolId);
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

      const openModalFromFeature = async (feature) => {
        if (!feature) return;
        const props = feature.properties || {};
        const featureId = feature.id ?? props.id ?? null;

        let buildingId = (props.building_id || '').toLowerCase().trim();
        if (!buildingId && typeof props.nombre === 'string') {
          const up = props.nombre.toUpperCase().trim();
          if (/^UD\d+$/.test(up)) buildingId = up.toLowerCase();
        }

        let carreras=[], aulas=[], oficinas=[], personal=[];
        try {
          if (buildingId) {
            const fetched = await fetchBuildingData(buildingId);
            carreras=fetched.carreras; aulas=fetched.aulas; oficinas=fetched.oficinas; personal=fetched.personal;
          }
        } catch (e) { console.error('Supabase error:', e); }

        // ⬇ recoge highlight pendiente (si vino del buscador)
        const highlight = map.__pendingHighlight || null;
        map.__pendingHighlight = null;

        setSelectedBuilding({
          id: buildingId || featureId,
          name: props.nombre ?? props.name ?? 'Edificio',
          description: props.descripcion ?? props.description ?? '',
          image360: props.photo_url || props.image360_url || props.foto || null,
          carreras, aulas, oficinas, personal,
          highlight // ⬅ pasa meta a la card
        });

        if (featureId != null) {
          const prev = selectedIdRef.current;
          if (prev && prev !== featureId) safeSetFeatureState(map, SOURCE_ID, prev, { selected: false });
          safeSetFeatureState(map, SOURCE_ID, featureId, { selected: true });
          selectedIdRef.current = featureId;
        }
        focusFeature(feature);
      };

      map.__featuresIndex = featuresIndex;
      map.__openModalFromFeature = openModalFromFeature;

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

    // ← escucha “Ubicar” y guarda highlight para el modal
    const onLocate = async (e) => {
      const id = String(e?.detail?.buildingId || '').toLowerCase().trim();
      const openModal = !!e?.detail?.openModal;
      if (!id || !mapRef.current) return;

      const feature = mapRef.current.__featuresIndex?.get(id);
      if (!feature) return;

      // guarda meta (reason + meta con identifier/name) para el modal
      mapRef.current.__pendingHighlight = { reason: e?.detail?.reason, meta: e?.detail?.meta || null };

      if (openModal && typeof mapRef.current.__openModalFromFeature === 'function') {
        await mapRef.current.__openModalFromFeature(feature);
      }
    };
    window.addEventListener('locate-building', onLocate);

    return () => {
      try { map.remove(); } catch {}
      mapRef.current = null;
      selectedIdRef.current = null;
      window.removeEventListener('locate-building', onLocate);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
      <SearchBar />
      {selectedBuilding && (
        <BuildingInfoModal
          building={selectedBuilding}
          onClose={() => {
            const map = mapRef.current;
            if (styleReady(map)) {
              const prev = map && (map.__lastSelectedId || null);
              if (prev != null) safeSetFeatureState(map, SOURCE_ID, prev, { selected: false });
            }
            setSelectedBuilding(null);
          }}
        />
      )}
    </div>
  );
}
