// src/pages/LabTrack/LabSessions.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './labtrack-ui.css';

function fmtRange(start, end) {
  try {
    const s = new Date(start), e = new Date(end);
    const optsDate = { year: 'numeric', month: 'short', day: '2-digit' };
    const optsTime = { hour: '2-digit', minute: '2-digit' };
    return `${s.toLocaleDateString('es-MX', optsDate)} · ${s.toLocaleTimeString('es-MX', optsTime)}–${e.toLocaleTimeString('es-MX', optsTime)}`;
  } catch { return '-'; }
}

export default function LabSessions() {
  const { labId } = useParams();
  const nav = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [labName, setLabName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [labRes, sesRes] = await Promise.all([
        supabase.from('labs').select('name').eq('id', labId).single(),
        supabase
          .from('v_labtrack_sessions')
          .select('*')
          .eq('lab_id', labId)
          .order('start_time', { ascending: false })
      ]);

      if (!alive) return;
      if (labRes.data) setLabName(labRes.data.name);
      if (sesRes.error) console.error(sesRes.error);
      setSessions(sesRes.data ?? []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [labId]);

  return (
    <div className="lt-container">
      <header className="lt-header">
        <h1>{labName || `Laboratorio ${labId}`}</h1>
        <p className="lt-muted">Sesiones y registros de alumnos</p>
        <button className="lt-link" onClick={() => nav(-1)}>← Regresar</button>
      </header>

      {loading ? (
        <div className="lt-skeleton-list">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="lt-skeleton-card" />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="lt-empty">No hay sesiones registradas para este laboratorio.</div>
      ) : (
        <div className="lt-grid">
     {sessions.map(s => (
  <button
    key={s.session_id}
    className="lt-card clickable lt-session-row"
    onClick={() => nav(`/labtrack/${labId}/s/${s.session_id}`)}
    title="Ver registros de alumnos"
  >
    <div className="lt-card-left">
      <div className="lt-card-title">
        {s.program_name ?? 'Programa'} · {s.group_name} (Cuatri {s.quarter})
      </div>
      <div className="lt-card-sub">{fmtRange(s.start_time, s.end_time)}</div>
    </div>

    <div className="lt-card-right">
      <span className="lt-badge">Asistentes: {s.attendees}</span>
      <span className="lt-note">
        Profesor: {s.professor_name ?? s.professor_identifier ?? '—'}
      </span>
    </div>
  </button>
))}
        </div>
      )}
    </div>
  );
}
