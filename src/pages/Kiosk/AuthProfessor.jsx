import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './kiosk-ui.css';

const digits = ['1','2','3','4','5','6','7','8','9','0'];

export default function AuthProfessor() {
  const { labId } = useParams();
  const nav = useNavigate();
  const [code, setCode] = useState('');

  useEffect(() => {
    // si alguien entra directo sin labId, redirige
    if (!labId) nav('/kiosk', { replace:true });
  }, [labId, nav]);

  const push = d => setCode(prev => (prev + d).slice(0, 12));
  const back = () => setCode(prev => prev.slice(0, -1));
  const clear = () => setCode('');

  const confirm = () => {
    if (!code) return;
    localStorage.setItem('kiosk.profIdentifier', code);
    nav(`/kiosk/${labId}/setup`);
  };

return (
  <div className="kio">
    <div className="kio__wrap">
      <div className="kio-form">
        <div className="kio-card">
          {/* Título dentro de la card */}
          <div className="kio-card__header">
            <h1 className="kio-card__title">LabTrack</h1>
          </div>

          {/* Pad + input con mismo ancho/altura */}
          <div className="kio-pad">
            <input
              className="kio-pin"
              value={code}
              onChange={(e)=>setCode(e.target.value.replace(/\D/g,''))}
              placeholder="Número de empleado"
              inputMode="numeric"
            />

            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} className="kio-key" onClick={()=>push(String(n))}>{n}</button>
            ))}

            <button className="kio-key" onClick={clear}>C</button>
            <button className="kio-key" onClick={()=>push('0')}>0</button>
            <button className="kio-key" onClick={back}>⌫</button>
          </div>

          <div className="kio-actions">
            <button className="kio-primary" onClick={confirm}>Validar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}

const keyStyle = {
  padding:'16px 0', border:'1px solid #e5e7eb', borderRadius:10, background:'#fff',
  fontSize:18, cursor:'pointer'
};
const primaryBtn = {
  background:'#71007B', color:'#fff', border:0, padding:'12px 18px', borderRadius:10, cursor:'pointer', fontWeight:600
};
