// src/pages/LabSession/ProfessorLogin/ProfessorLogin.js
import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../supabaseClient'
import { LabSessionContext } from '../LabSessionContext'
import './ProfessorLogin.css'

export default function ProfessorLogin() {
  const [code, setCode]     = useState('')
  const [error, setError]   = useState('')
  const { setProfessor }    = useContext(LabSessionContext)
  const navigate            = useNavigate()
  const maxDigits           = 6

  const handleButtonClick = (digit) => {
    if (code.length < maxDigits) {
      setCode((prev) => prev + digit)
      setError('')
    }
  }

  const handleBackspace = () => {
    setCode((prev) => prev.slice(0, -1))
    setError('')
  }

  const handleConfirm = async () => {
    if (code.length === 0) {
      setError('Ingresa tu número de empleado')
      return
    }

    // Consulta en Supabase
    const { data, error: fetchError } = await supabase
      .from('professors')
      .select('id, full_name, avatar_url, employee_number')
      .eq('employee_number', code)
      .single()

    if (fetchError || !data) {
      setError('Número de empleado no válido')
      setCode('')
    } else {
      // Guardamos el profe y avanzamos
      setProfessor(data)
      navigate('/lab/session/class')
    }
  }

  return (
    <div className="professor-login">
      <h2 className="pl-title">LabTrack</h2>
      <p className="pl-instruction">Ingresa tu número de empleado</p>

      {error && <div className="pl-error">{error}</div>}

      <div className="pl-dots">
        {Array.from({ length: maxDigits }).map((_, i) => (
          <span
            key={i}
            className={`pl-dot ${i < code.length ? 'filled' : ''}`}
          />
        ))}
      </div>

      <div className="pl-keypad">
        {['1','2','3','4','5','6','7','8','9','0'].map((d) => (
          <button
            key={d}
            onClick={() => handleButtonClick(d)}
            className="pl-key"
          >
            {d}
          </button>
        ))}
        <button className="pl-back" onClick={handleBackspace}>←</button>
        <button className="pl-ok"  onClick={handleConfirm}>OK</button>
      </div>
    </div>
  )
}
