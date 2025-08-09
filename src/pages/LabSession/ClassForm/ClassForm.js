// src/pages/LabSession/ClassForm/ClassForm.js
import React, { useContext } from 'react'
import { useNavigate }     from 'react-router-dom'
import { LabSessionContext } from '../LabSessionContext'
import { supabase }        from '../../../supabaseClient'
import './ClassForm.css'

export default function ClassForm() {
  const { professor, setLabSession } = useContext(LabSessionContext)
  const navigate = useNavigate()

  // Si alguien entra sin profe, lo avisamos
  if (!professor) {
    return <p>Profesor no autenticado. Vuelve al inicio.</p>
  }

  const handleStartClass = async () => {
    // Datos de ejemplo; luego reemplázalos por selects/inputs
    const start = new Date().toISOString()
    const durationMs = 60 * 60 * 1000 // 1 hora
    const end   = new Date(Date.now() + durationMs).toISOString()
    const labId = 1 // Reemplaza por el lab real seleccionado

    // Inserta en la tabla sessions
    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          professor_id: professor.id,
          start_time:   start,
          end_time:     end,
          lab_id:       labId
        }
      ])
      .select('id')
      .single()

    if (error) {
      console.error('Error al crear sesión:', error)
      return
    }

    // Guardamos el ID y tiempos en el contexto
    setLabSession({
      id:         data.id,
      start_time: start,
      end_time:   end,
      lab_id:     labId
    })

    // Avanzamos al escaneo de alumnos
    navigate('/lab/session/scan')
  }

  return (
    <div className="class-form">
      <h2>Datos de la clase</h2>
      <p><strong>Profesor:</strong> {professor.full_name}</p>
      {/* Aquí irán tus selects de programa/cuatrimestre/grupo/horas */}
      <button onClick={handleStartClass}>
        Iniciar clase
      </button>
    </div>
  )
}
