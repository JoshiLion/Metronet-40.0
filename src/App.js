import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage     from './pages/LoginPage'
import HomePage      from './pages/HomePage'
import ProfilePage   from './pages/ProfilePage'
import LabTrackPage  from './pages/LabTrackPage'
import PrivateRoute  from './components/PrivateRoute'
import AppLayout     from './components/AppLayout'

export default function App() {
  return (
    <Routes>
      {/* 1) Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2) Rutas privadas */}
      <Route element={<PrivateRoute />}>
        {/* AppLayout monta el sidebar + header y un <Outlet /> */}
        <Route element={<AppLayout />}>
          {/* index equivale a path="/" */}
          <Route index       element={<HomePage      />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="lab"     element={<LabTrackPage/>} />
        </Route>
      </Route>

      {/* 3) Fallback: si es usuario autenticado redirige a home, si no, a login */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  )
}
