import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './kiosk-ui.css';
import { supabase } from '../../supabaseClient';

const btn = (active) => ({
  padding:'12px 16px', border:'1px solid ' + (active?'#71007B':'#e5e7eb'),
  borderRadius:12, background: active?'#F5EAF7':'#fff',
  cursor:'pointer', fontWeight:600
});

export default function ClassSetup() {
  const { labId } = useParams();
  const nav = useNavigate();
  const profIdentifier = localStorage.getItem('kiosk.profIdentifier') || '';
  const [programs, setPrograms] = useState([]);
  const [programId, setProgramId] = useState(null);
  const [quarter, setQuarter] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [hours, setHours] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!labId || !profIdentifier) { nav('/kiosk', { replace:true }); return; }
    let alive = true;
    (async () => {
      const [{ data: progs, error: e1 }, { data: tab, error: e2 }] = await Promise.all([
        supabase.from('programs').select('id, name').order('name'),
        supabase.from('tablets').select('id').eq('lab_id', labId).limit(1).single()
      ]);
      if (!alive) return;
      if (e1) console.error(e1);
      if (e2) console.warn('No hay tablet ligada al lab, crea una en "tablets"'); // seguimos, validamos al guardar
      setPrograms(progs ?? []);
      setLoading(false);
    })();
    return ()=>{ alive=false; };
  }, [labId, profIdentifier, nav]);

  const start = async () => {
    setError('');
    if (!programId || !quarter || !groupName || !hours) {
      setError('Completa todos los campos.');
      return;
    }
    // buscamos una tablet asociada al lab
    const { data: tablet, error: te } = await supabase
      .from('tablets').select('id').eq('lab_id', labId).limit(1).single();
    if (te || !tablet) { setError('No hay tablet configurada para este laboratorio.'); return; }

    setSaving(true);
    const { data, error } = await supabase.rpc('start_session', {
      p_tablet_id: tablet.id,
      p_prof_identifier: profIdentifier,
      p_program_id: programId,
      p_quarter: quarter,
      p_group_name: groupName,
      p_duration_hours: hours
    });
    setSaving(false);

    if (error) { setError(error.message); return; }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      setError('No se pudo crear la sesión. Intenta de nuevo.');
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    localStorage.setItem('kiosk.sessionId', String(row.session_id));
    localStorage.setItem('kiosk.endsAt', String(row.ends_at));
    nav(`/kiosk/${labId}/session/${row.session_id}/scan`);
  };

  if (loading) return <div style={{ padding:24 }}>Cargando…</div>;

   return (
    <div className="kio">
      <div className="kio__wrap">
       

        <div className="kio-card">
             <h1 className="kio__title">Configurar clase</h1>
          <div className="kio-field">
            <label className="kio-label">Programa educativo</label>
            <select
              value={programId ?? ''}
              onChange={e=>setProgramId(Number(e.target.value))}
              className="kio-select"
            >
              <option value="" disabled>Selecciona un programa</option>
              {programs.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="kio-field">
            <label className="kio-label">Cuatrimestre</label>
            <div className="kio-options">
              {[1,2,3,4,5,6,7,8,9].map(q=>(
                <button key={q}
                        onClick={()=>setQuarter(q)}
                        className={`kio-chip ${quarter===q ? 'kio-chip--active':''}`}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="kio-field">
            <label className="kio-label">Grupo asignado</label>
            <div className="kio-options">
              {['A','B','C','D'].map(g=>(
                <button key={g}
                        onClick={()=>setGroupName(g)}
                        className={`kio-chip ${groupName===g ? 'kio-chip--active':''}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="kio-field">
            <label className="kio-label">Horas de clase</label>
            <div className="kio-options">
              {[1,2,3,4].map(h=>(
                <button key={h}
                        onClick={()=>setHours(h)}
                        className={`kio-chip ${hours===h ? 'kio-chip--active':''}`}>
                  {h}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="kio-error">{error}</div>}

          <div style={{ marginTop: 50 }}>
            <button onClick={start} disabled={saving} className="kio-primary">
              {saving ? 'Creando sesión…' : 'Iniciar clase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
