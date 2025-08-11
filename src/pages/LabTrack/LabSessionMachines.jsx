// src/pages/LabTrack/LabSessionMachines.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
// Agrega la importación
import { ReactComponent as LabIcon } from '../../assets/iconos/monitor.svg';

import './labtrack-ui.css';

export default function LabSessionMachines() {
  const { labId, sessionId } = useParams();
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [labName, setLabName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: machines, error }, { data: lab }] = await Promise.all([
        supabase
          .from('v_labtrack_machines')
          .select('*')
          .eq('session_id', sessionId)
          .order('machine_name', { ascending: true }),
        supabase.from('labs').select('name').eq('id', labId).single()
      ]);
      if (!alive) return;
      if (error) console.error(error);
      setRows(machines ?? []);
      if (lab) setLabName(lab.name);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [labId, sessionId]);

  // Derivar lista de máquinas (ocupadas + libres)
  const machines = useMemo(() => {
    return rows.map(r => ({
      id: r.machine_id,
      name: r.machine_name,
      occupied: !!r.registration_id,
      studentName: r.student_name || '',
      matricula: r.student_identifier || ''
    }));
  }, [rows]);

  return (
    <div className="lt-container">
      <header className="lt-header">
        <h1>{labName || `Laboratorio ${labId}`}</h1>
        <p className="lt-muted">Sesión #{sessionId} · Máquinas y ocupación</p>
        <button className="lt-link" onClick={() => nav(-1)}>← Regresar</button>
      </header>

      {loading ? (
        <div className="lt-skeleton-grid">
          {Array.from({ length: 16 }).map((_, i) => <div key={i} className="lt-skeleton-tile" />)}
        </div>
      ) : machines.length === 0 ? (
        <div className="lt-empty">No hay máquinas registradas para este laboratorio.</div>
      ) : (
        <div className="lt-grid-machines">
          {machines.map(m => (
            <div key={m.id} className={`lt-machine ${m.occupied ? 'occupied' : 'free'}`}>
              <div className="lt-machine-title">
                <LabIcon style={{
                  width: '16px',
                  height: '16px',
                  fill: 'var(--brand)',
                  marginRight: '6px'
                }} />
                {m.name}
              </div>

              {m.occupied ? (
                <div className="lt-machine-body">
                  <div className="lt-strong">{m.studentName}</div>
                  <div className="lt-mono">{m.matricula}</div>
                </div>
              ) : (
                <div className="lt-machine-body lt-muted">Libre</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
