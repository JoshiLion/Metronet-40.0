import React from 'react'
import UserCard  from '../../components/UserCard/UserCard'
import { useAuth } from '../../context/AuthContext'
import './HomePage.css'

export default function HomePage() {
  const { profile } = useAuth()
  if (!profile) return <p>Cargando...</p>

  return (
    <div className="homepage-container">
      <h2 className="homepage-title">Bienvenido, {profile.first_name || profile.identifier}</h2>
      <div className="homepage-card-wrapper">
        <UserCard user={profile} />
      
      </div>
    </div>
  )
}
