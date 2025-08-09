// src/pages/LabSession/Timer/Timer.js
import React, { useContext, useEffect, useState } from 'react'
import { LabSessionContext } from '../LabSessionContext'
import './Timer.css'

export default function Timer() {
  const { labSession } = useContext(LabSessionContext)
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (!labSession.end_time) return
    const end = new Date(labSession.end_time).getTime()

    const tick = () => {
      const now = Date.now()
      const diff = Math.max(0, end - now)
      setTimeLeft(diff)
      if (diff === 0) clearInterval(timer)
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [labSession.end_time])

  if (timeLeft === null) return null

  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)
    .toString()
    .padStart(2, '0')

  return (
    <div className={`timer ${timeLeft === 0 ? 'session-ended' : ''}`}>
      {timeLeft > 0 ? `${minutes}:${seconds}` : '¡Tiempo agotado!'}
    </div>
  )
}
