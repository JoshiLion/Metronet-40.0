import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './kiosk-ui.css';

export default function SelectLab() {
  const nav = useNavigate();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase.from('labs').select('id, name').order('name');
      if (!alive) return;
      if (error) console.error(error);
      setLabs(data ?? []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const handleSelect = (labId) => {
    localStorage.setItem('kiosk.labId', String(labId));
    // Limpiamos estado de sesión previa si existiera
    localStorage.removeItem('kiosk.sessionId');
    localStorage.removeItem('kiosk.endsAt');
    nav(`/kiosk/${labId}/prof`);
  };

 return (
    <div className="kio">
      <div className="kio__wrap">
        <h1 className="kio__title">Selecciona laboratorio</h1>

        <div className="kio-card">
          <div className="kio-list">
            {loading ? 'Cargando…' : labs.map(lab => (
              <button
                key={lab.id}
                onClick={() => handleSelect(lab.id)}
                className="kio-list__item"
                title="Elegir laboratorio"
              >
                <span style={{ fontWeight: 600 }}>{lab.name}</span>
                <span>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
