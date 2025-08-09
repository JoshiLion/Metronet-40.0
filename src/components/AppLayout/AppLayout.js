import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar      from '../NavBar/NavBar'
import Header      from '../Header/Header'
import './AppLayout.css'

export default function AppLayout() {
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
