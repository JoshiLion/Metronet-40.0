// src/pages/GuestMapPage.js
import React from 'react'
import CampusMap from '../components/Map/CampusMap' // ajusta si tu ruta difiere
import './GuestMapPage.css'

export default function GuestMapPage() {
  return (
    <div className="guest-map-shell">
      {/* Solo el mapa, sin header ni navbar */}
      <CampusMap />
    </div>
  )
}
