// src/App.js
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage     from './pages/Login/LoginPage';
import LabSessionApp from './pages/LabSession/LabSessionApp.js';

import PrivateRoute  from './components/PrivateRoute/PrivateRoute';
import AppLayout     from './components/AppLayout/AppLayout';
import CampusMap     from './components/Map/CampusMap.jsx';

import HomePage      from './pages/Home/HomePage';
import LionMapPage   from './pages/LionMap/LionMapPage.js';
import ProfilePage   from './pages/Profile/ProfilePage';
import LabTrackPage  from './pages/LabTrack/LabTrackPage';
import QRBatch from './pages/Tools/QRBatch.jsx'

// 🆕 LabTrack (admin) - vistas nuevas (lazy)
const LabDashboard        = lazy(() => import('./pages/LabTrack/LabDashboard'));         // /labtrack
const LabSessions         = lazy(() => import('./pages/LabTrack/LabSessions'));          // /labtrack/:labId
const LabSessionMachines  = lazy(() => import('./pages/LabTrack/LabSessionMachines'));   // /labtrack/:labId/s/:sessionId

// 🆕 Kiosco (tablet) - flujo parte 2 (lazy)
const KioskSelectLab      = lazy(() => import('./pages/Kiosk/SelectLab'));               // /kiosk
const KioskAuthProfessor  = lazy(() => import('./pages/Kiosk/AuthProfessor'));           // /kiosk/:labId/prof
const KioskClassSetup     = lazy(() => import('./pages/Kiosk/ClassSetup'));              // /kiosk/:labId/setup
const KioskScanQR         = lazy(() => import('./pages/Kiosk/ScanQR'));                  // /kiosk/:labId/session/:sessionId/scan
const KioskSeatSelect     = lazy(() => import('./pages/Kiosk/SeatSelect'));              // /kiosk/:labId/session/:sessionId/seat

export default function App() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
      <Routes>
        {/* 1) Login: pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2) Modo invitado: público, SIN layout (solo mapa full-screen) */}
        <Route
          path="/guest-map"
          element={
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'var(--color-bg, #ECF0F5)',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', inset: 0 }}>
                <CampusMap />
              </div>
            </div>
          }
        />

        {/* 3) Flujo de Sesión de Laboratorio (legacy): pública */}
        <Route path="/lab/session/*" element={<LabSessionApp />} />

        {/* 4) 🆕 Kiosco (tablet): público */}
        <Route path="/kiosk" element={<KioskSelectLab />} />
        <Route path="/kiosk/:labId/prof" element={<KioskAuthProfessor />} />
        <Route path="/kiosk/:labId/setup" element={<KioskClassSetup />} />
        <Route path="/kiosk/:labId/session/:sessionId/scan" element={<KioskScanQR />} />
        <Route path="/kiosk/:labId/session/:sessionId/seat" element={<KioskSeatSelect />} />
        <Route path="/tools/qr" element={<QRBatch />} />

        {/* 5) Rutas privadas con sidebar y header */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route index           element={<HomePage     />} />
            <Route path="profile"  element={<ProfilePage  />} />
            <Route path="map"      element={<LionMapPage  />} />

            {/* Legacy LabTrack (tu página actual) */}
            <Route path="lab"      element={<LabTrackPage />} />

            {/* 🆕 LabTrack (admin) por rutas dedicadas */}
            <Route path="labtrack"                         element={<LabDashboard />} />
            <Route path="labtrack/:labId"                  element={<LabSessions />} />
            <Route path="labtrack/:labId/s/:sessionId"     element={<LabSessionMachines />} />
          </Route>
        </Route>

        {/* 6) Cualquier otra → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
