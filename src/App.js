// src/App.js
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import LoginPage      from './pages/Login/LoginPage'
import LabSessionApp  from './pages/LabSession/LabSessionApp.js'

import PrivateRoute   from './components/PrivateRoute/PrivateRoute'
import AppLayout      from './components/AppLayout/AppLayout'
import CampusMap from './components/Map/CampusMap.jsx'

import HomePage       from './pages/Home/HomePage'
import LionMapPage from './pages/LionMap/LionMapPage.js'
import ProfilePage    from './pages/Profile/ProfilePage'
import LabTrackPage   from './pages/LabTrack/LabTrackPage'

export default function App() {
  return (
    <Routes>
      {/* 1) Login: pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2) Flujo de Sesión de Laboratorio: también pública */}
      <Route path="/lab/session/*" element={<LabSessionApp />} />

      {/* 3) Rutas privadas con sidebar y header */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route index       element={<HomePage      />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="lab"     element={<LabTrackPage/>} />
          <Route path="map" element={<LionMapPage />} />
        </Route>
      </Route>

      {/* 4) Cualquier otra → login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
