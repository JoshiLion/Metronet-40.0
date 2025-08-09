// src/pages/LabTrack/LabTrackPage.js
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ReactComponent as ArrowIcon } from '../../assets/iconos/close.svg'
import './LabTrackPage.css'

const labs = [
  { id: 1, name: 'Laboratorio de cómputo 1' },
  { id: 2, name: 'Laboratorio de cómputo 2' }
]

export default function LabTrackPage() {
  const navigate = useNavigate()

  return (
    <div className="labtrack-container">
      <h2 className="labtrack-title">Laboratorios de cómputo</h2>
      <ul className="labtrack-list">
        {labs.map(lab => (
          <li
            key={lab.id}
            className="labtrack-item"
            onClick={() => navigate(`/lab/${lab.id}`)}
          >
            <span>{lab.name}</span>
            <ArrowIcon className="labtrack-icon" />
          </li>
        ))}
      </ul>

      {/* Botón para ir al registro de sesión */}
      <button
        className="labtrack-session-button"
        onClick={() => navigate('/lab/session')}
      >
        → Registrar sesión de laboratorio
      </button>
    </div>
  )
}
