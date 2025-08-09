// src/pages/LabSession/MachineGrid/MachineGrid.js
import React, { useContext } from 'react'
import { LabSessionContext } from '../LabSessionContext'
import './MachineGrid.css'

export default function MachineGrid() {
  const { labSession, professor } = useContext(LabSessionContext)

  if (!labSession.id) {
    return <p>No hay sesión activa.</p>
  }

  // Placeholder: lista dummy de máquinas
  const machines = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `PC ${i + 1}`,
  }))

  const handleSelect = (machine) => {
    // Aquí insertarías en session_registrations
    console.log('Registrando en máquina', machine.id)
    // Luego volverías a screen de QR o mostrarías feedback
  }

  return (
    <div className="machine-grid">
      <h2>Selecciona tu computadora</h2>
      <div className="grid">
        {machines.map((m) => (
          <div
            key={m.id}
            className="machine-card"
            onClick={() => handleSelect(m)}
          >
            {m.name}
          </div>
        ))}
      </div>
    </div>
  )
}
