import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './kiosk-ui.css';

export default function SeatSelect() {
  const { state } = useLocation();
  const { labId, sessionId } = useParams();
  const nav = useNavigate();

  const studentIdentifier = state?.studentIdentifier || ''; // viene de ScanQR
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!labId || !sessionId || !studentIdentifier) {
      nav(`/kiosk/${labId}/session/${sessionId}/scan`, { replace:true });
      return;
    }
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from('v_labtrack_machines')
        .select('*')
        .eq('session_id', sessionId)
        .order('machine_name', { ascending: true });
      if (!alive) return;
      if (error) console.error(error);
      setRows(data ?? []);
      setLoading(false);
    })();
    return ()=>{ alive=false; };
  }, [labId, sessionId, studentIdentifier, nav]);

  const machines = useMemo(() => rows.map(r => ({
    id: r.machine_id, name: r.machine_name,
    occupied: !!r.registration_id,
    student: r.student_name, matricula: r.student_identifier
  })), [rows]);

  const save = async () => {
    setError('');
    if (!selected) { setError('Selecciona una computadora.'); return; }
    setSaving(true);
    const { error } = await supabase.rpc('claim_machine', {
      p_session_id: Number(sessionId),
      p_machine_id: Number(selected),
      p_student_identifier: studentIdentifier
    });
    setSaving(false);

    if (error) {
      setError(
        error.message.includes('MACHINE_ALREADY_TAKEN') ? 'Esa máquina ya fue ocupada.' :
        error.message.includes('STUDENT_ALREADY_REGISTERED') ? 'Ya estás registrado en esta sesión.' :
        error.message.includes('SESSION_NOT_ACTIVE') ? 'La sesión ya terminó.' :
        'No se pudo registrar. Intenta de nuevo.'
      );
      return;
    }

    // éxito → volver al escaneo para el siguiente alumno
    nav(`/kiosk/${labId}/session/${sessionId}/scan`, { replace:true });
  };

  if (loading) return <div style={{ padding:24 }}>Cargando…</div>;

 return (
    <div className="kio">
      <div className="kio__wrap">
        <h1 className="kio__title">Selecciona tu computadora</h1>

        <div className="kio-seats">
          {machines.map(m => {
            const disabled = m.occupied;
            const active = selected === m.id;
            return (
              <button
                key={m.id}
                onClick={() => !disabled && setSelected(m.id)}
                disabled={disabled}
                className={
                  'kio-seat' +
                  (active ? ' kio-seat--active' : '') +
                  (disabled ? ' kio-seat--disabled' : '')
                }
                title={disabled ? `Ocupada por ${m.student ?? m.matricula}` : 'Disponible'}
              >
                {m.name}
              </button>
            );
          })}
        </div>

        {error && <div className="kio-error" style={{ marginTop:12 }}>{error}</div>}

        <div style={{ marginTop:16 }}>
          <button onClick={save} disabled={saving} className="kio-primary">
            {saving ? 'Registrando…' : 'Seleccionar'}
          </button>
        </div>
      </div>
    </div>
  );
}
