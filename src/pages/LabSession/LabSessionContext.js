// src/pages/LabSession/LabSessionContext.js
import React, { createContext, useState } from 'react'

export const LabSessionContext = createContext(null)

export function LabSessionProvider({ children }) {
  const [professor, setProfessor] = useState(null)
  const [labSession, setLabSession] = useState({
    id: null,
    start_time: null,
    end_time: null,
    lab_id: null,
  })

  return (
    <LabSessionContext.Provider
      value={{ professor, setProfessor, labSession, setLabSession }}
    >
      {children}
    </LabSessionContext.Provider>
  )
}
