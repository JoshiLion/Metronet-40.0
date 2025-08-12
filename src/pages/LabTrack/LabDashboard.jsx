// src/pages/LabTrack/LabDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; // <-- ajusta si tu path es otro
import './labtrack-ui.css';

export default function LabDashboard() {
  const nav = useNavigate();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('labs')
        .select('id, name, location, capacity')
        .order('name', { ascending: true });
      if (!isMounted) return;
      if (error) console.error(error);
      setLabs(data ?? []);
      setLoading(false);
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="lt-container">
      <header className="lt-header">
        <h1>Registros de Laboratorio</h1>
        <p className="lt-muted">Selecciona un laboratorio para ver sus sesiones</p>
      </header>

      {loading ? (
        <div className="lt-skeleton-list">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="lt-skeleton-card" />)}
        </div>
      ) : (
        <div className="lt-grid">
          {labs.map(lab => (
            <button
              key={lab.id}
              className="lt-card clickable"
              onClick={() => nav(`/labtrack/${lab.id}`)}
            >
              <div className="lt-card-title">{lab.name}</div>
              <div className="lt-card-sub">
                {lab.location ? `Ubicación: ${lab.location}` : 'Sin ubicación'}
              </div>
              <div className="lt-pill">Capacidad: {lab.capacity ?? '—'}</div>
            </button>
          ))}
        </div>
      )}

      <div className="lt-footer">
        <button
          className="lt-primary"
          onClick={() => nav('/kiosk')} // dejar listo para la Parte 2
          title="Configurar nueva sesión de laboratorio"
        >
          Configurar nueva sesión de laboratorio
        </button>
      </div>
    </div>
  );
}


