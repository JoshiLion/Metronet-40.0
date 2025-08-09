// src/components/Map/CampusMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import BuildingInfoModal from './BuildingInfoModal';
import buildingsData from '../../data/buildings.json'; // Asegúrate de tener src/data/buildings.json

export default function CampusMap() {
  const mapContainer = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/01987e2d-191e-7be0-8a2c-4b9960d9708d/style.json?key=0uHroK8eNgw194tPKrzI',
      center: [-98.88905, 19.94569],
      zoom: 16.7,
      minZoom: 15,
      maxZoom: 18,
      maxBounds: [
        [-98.895, 19.94],  // SW límite
        [-98.882, 19.95]   // NE límite
      ]
    });

    map.on('load', () => {
      setMapInstance(map);

     // 1) Añadimos la fuente GeoJSON de edificios
map.addSource('buildings', {
  type: 'geojson',
  data: buildingsData
});

// 2) Dibujamos círculos en cada punto para poder hacer click
map.addLayer({
  id: 'buildings-fill',
  type: 'fill',
  source: 'buildings',
  paint: {
    'fill-color': '#71007B',
    'fill-opacity': 0.2,          // transparencia para ver el mapa de fondo
    'fill-outline-color': '#71007B'
  }
});


      // 3) Handler de click para abrir modal
      map.on('click', 'buildings-fill', e => {
        const props = e.features[0].properties;
        setSelectedBuilding({
          id:          props.id,
          name:        props.name,
          description: props.description,
          image360:    props.image360_url,
          carreras:    JSON.parse(props.carreras || '[]'),
          aulas:       JSON.parse(props.aulas || '[]'),
          oficinas:    JSON.parse(props.oficinas || '[]'),
          personal:    JSON.parse(props.personal || '[]'),
        });
      });

      // 4) Cambiar cursor al pasar por encima
      map.on('mouseenter', 'buildings-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'buildings-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    return () => map.remove();
  }, []);

  return (
    <>
      <div
        ref={mapContainer}
        style={{ width: '100%', height: '100vh' }}
      />
      {selectedBuilding && (
        <BuildingInfoModal
          building={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
        />
      )}
    </>
  );
}
