import React, { useState } from 'react';
import './BuildingInfoModal.css'; // aquí pones tu CSS con #71007B y #ECF0F5

export default function BuildingInfoModal({ building, onClose }) {
  const tabs = ['Carreras', 'Aulas', 'Oficinas', 'Personal'];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Carreras':
        return building.carreras.map((c, i) => <li key={i}>{c}</li>);
      case 'Aulas':
        return building.aulas.map((a, i) => <li key={i}>{a}</li>);
      case 'Oficinas':
        return building.oficinas.map((o, i) => <li key={i}>{o}</li>);
      case 'Personal':
        return building.personal.map((p, i) => (
          <li key={i} className="staff-item">
            <div>
              <strong>{p.name}</strong><br/>
              <small>{p.role}</small>
            </div>
            <a href={p.contactUrl} className="contact-link">Contactar →</a>
          </li>
        ));
      default:
        return null;
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-window">
        <button className="close-btn" onClick={onClose}>×</button>
        {building.image360 &&
          <div className="image-360">
            {/* aquí podrías integrar un visor 360 si quieres */}
            <img src={building.image360} alt="Vista 360°" />
          </div>
        }
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
          {renderContent()}
        </ul>
      </div>
    </div>
  );
}
