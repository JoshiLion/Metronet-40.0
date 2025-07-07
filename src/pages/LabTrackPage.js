// src/pages/LabTrackPage.js
import React from 'react'
import './LabTrackPage.css'
import { ReactComponent as ArrowIcon } from '../assets/close.svg'

const labs = [
  { id: 1, name: 'Laboratorio de cómputo 1' },
  { id: 2, name: 'Laboratorio de cómputo 2' }
]

export default function LabTrackPage() {
  return (
    <div className="labtrack-container">
      <h2 className="labtrack-title">Laboratorios de cómputo</h2>
      <ul className="labtrack-list">
        {labs.map(lab => (
          <li key={lab.id} className="labtrack-item">
            <span>{lab.name}</span>
            <ArrowIcon className="labtrack-icon" />
          </li>
        ))}
      </ul>
    </div>
  )
}
