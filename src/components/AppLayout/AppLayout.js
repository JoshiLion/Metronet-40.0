import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavBar from '../NavBar/NavBar'
import Header from '../Header/Header'
import './AppLayout.css'

export default function AppLayout() {
  const location = useLocation()

  // Guarda la última ruta visitada (evita guardar /login)
  useEffect(() => {
    const path = location.pathname + location.search + location.hash
    if (location.pathname !== '/login') {
      localStorage.setItem('lastPath', path)
    }
  }, [location])

  return (
    <div className="app-container">
      <NavBar />
      <div className="main-area">
        <Header />
        <main className="main-content">
          {/* Aquí React Router pinta HomePage, ProfilePage, LabTrackPage… */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
