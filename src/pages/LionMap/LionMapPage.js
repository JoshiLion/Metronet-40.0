// src/pages/MapPage.js
import React from 'react'
import CampusMap from '../../components/Map/CampusMap'
import UserCard  from '../../components/UserCard/UserCard'

export default function LionMapPage() {
  return (
    // 👇 este wrapper solo existe en la página del mapa
    <div className="map-shell">
      <CampusMap />
    </div>
  );
}