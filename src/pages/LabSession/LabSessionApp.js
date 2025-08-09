// src/pages/LabSession/LabSessionApp.js
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { LabSessionProvider } from './LabSessionContext'

import ProfessorLogin from './ProfessorLogin/ProfessorLogin'
import ClassForm      from './ClassForm/ClassForm'
import QRScanner      from './QRScanner/QRScanner'
import MachineGrid    from './MachineGrid/MachineGrid'
import Timer          from './Timer/Timer'

export default function LabSessionApp() {
  return (
    <LabSessionProvider>
      <Routes>
        {/* 1) Validación de profesor */}
        <Route path="/"       element={<ProfessorLogin />} />
        {/* 2) Datos de la clase */}
        <Route path="class"   element={<ClassForm      />} />
        {/* 3) Escaneo de QR */}
        <Route path="scan"    element={<QRScanner      />} />
        {/* 4) Selección de máquina */}
        <Route path="machines" element={<MachineGrid   />} />
      </Routes>

      {/* Timer fijo en todas las pantallas */}
      <Timer />
    </LabSessionProvider>
  )
}
