
// src/pages/LabSession/QRScanner/QRScanner.js
import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { LabSessionContext } from '../LabSessionContext'
import './QRScanner.css'

export default function QRScanner() {
  const { labSession } = useContext(LabSessionContext)
  const navigate = useNavigate()

  if (!labSession.id) {
    return <p>No hay sesión iniciada. Vuelve al inicio.</p>
  }

  const handleNext = () => {
    // Aquí iría la lógica de lectura de QR + supabase lookup
    navigate('/lab/session/machines')
  }

  return (
    <div className="qr-scanner">
      <h2>Escanea tu QR (placeholder)</h2>
      <div className="qr-box">[ Aquí iría tu componente de cámara ]</div>
      <button onClick={handleNext}>Siguiente</button>
    </div>
  )
}
