// src/components/Map/BuildingInfoModal.jsx
import React, { useState } from 'react';
import './BuildingInfoModal.css';

export default function BuildingInfoModal({ building, onClose }) {
  const tabs = ['Carreras', 'Aulas', 'Oficinas', 'Personal'];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const carreras = building.carreras || [];
  const aulas    = building.aulas || [];
  const oficinas = building.oficinas || [];
  const personal = building.personal || [];

  return (
    <div className="modal-backdrop">
      <div className="modal-window">
        <button className="close-btn" onClick={onClose}>×</button>

        {building.image360 && (
          <div className="image-360">
            <img src={building.image360} alt="Vista 360°" />
          </div>
        )}

        <h3 className="title">{building.name}</h3>

        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              className={tab === activeTab ? 'tab active' : 'tab'}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <ul className="tab-content">
          {activeTab === 'Carreras' && carreras.map((c, i) => <li key={i}>{c}</li>)}
          {activeTab === 'Aulas'    && aulas.map((a, i) => <li key={i}>{a}</li>)}
          {activeTab === 'Oficinas' && oficinas.map((o, i) => <li key={i}>{o}</li>)}
          {activeTab === 'Personal' && personal.map((p, i) => (
            <li key={i} className="staff-item">
              <div>
                <strong>{p.name || p.nombre}</strong><br/>
                <small>{p.role || p.puesto}</small>
              </div>
              {p.contactUrl && <a href={p.contactUrl} className="contact-link">Contactar →</a>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
