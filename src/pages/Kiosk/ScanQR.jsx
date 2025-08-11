// src/pages/LabTrack/ScanQR.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import './kiosk-ui.css';

function useCountdown(endsAtIso) {
  const [left, setLeft] = useState(() =>
    Math.max(0, new Date(endsAtIso).getTime() - Date.now())
  );
  useEffect(() => {
    const id = setInterval(
      () => setLeft(Math.max(0, new Date(endsAtIso).getTime() - Date.now())),
      1000
    );
    return () => clearInterval(id);
  }, [endsAtIso]);
  const mm = String(Math.floor(left / 60000)).padStart(2, '0');
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
  return { left, label: `${mm}:${ss}` };
}

export default function ScanQR() {
  const { labId, sessionId } = useParams();
  const nav = useNavigate();

  const endsAt = localStorage.getItem('kiosk.endsAt');
  const { left, label } = useCountdown(
    endsAt || new Date(Date.now() + 60_000).toISOString()
  );

  const videoRef  = useRef(null);
  const readerRef = useRef(null);     // BrowserMultiFormatReader
  const stopRef   = useRef(null);     // () => controls.stop()

  const [matricula, setMatricula] = useState('');
  const [error, setError]         = useState('');
  const [camState, setCamState]   = useState('starting'); // starting|running|error

  // Guardas de navegación
  useEffect(() => {
    if (!labId || !sessionId || !endsAt) nav('/kiosk', { replace: true });
  }, [labId, sessionId, endsAt, nav]);

  useEffect(() => {
    if (left === 0) nav('/kiosk', { replace: true });
  }, [left, nav]);

  // Boot cámara (FRONTAL) y decodificación QR
  useEffect(() => {
    let cancelled = false;
    if (camState !== 'starting') return;

    async function boot() {
      setError('');
      try {
        const codeReader = new BrowserMultiFormatReader();
        // Solo QR para acelerar
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
        codeReader.hints = hints;
        readerRef.current = codeReader;

        const constraints = {
          video: {
            facingMode: { ideal: 'user' },     // 👈 frontal
            width:  { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        const controls = await codeReader.decodeFromConstraints(
          constraints,
          videoRef.current,
          (result, err, _controls) => {
            if (cancelled) return;
            if (result) {
              const raw   = result.getText().trim();
              const match = raw.match(/\b\d{7,12}\b/);
              const id    = match ? match[0] : raw;

              cancelled = true;
              try { _controls?.stop(); } catch {}
              stopRef.current = null;

              nav(`/kiosk/${labId}/session/${sessionId}/seat`, {
                state: { studentIdentifier: id }
              });
            }
          }
        );

        stopRef.current = () => controls?.stop?.();
        setCamState('running');
      } catch (e) {
        console.error(e);
        setError('No se pudo acceder a la cámara frontal. Revisa permisos o usa el modo manual.');
        setCamState('error');
      }
    }

    boot();

    return () => {
      try { stopRef.current?.(); } catch {}
      try { readerRef.current?.reset?.(); } catch {}
      stopRef.current = null;
      readerRef.current = null;
    };
  }, [camState, labId, sessionId, nav]);

  const continueSeat = () => {
    const id = (matricula || '').trim();
    if (!id) return setError('Ingresa la matrícula (o usa el QR).');
    nav(`/kiosk/${labId}/session/${sessionId}/seat`, {
      state: { studentIdentifier: id }
    });
  };

  return (
    <div className="kio">
      <div className="kio__wrap">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 className="kio__title">Regístrate</h1>
          <div className="kio-chip kio-chip--active" style={{ borderColor:'transparent' }}>⏱ {label}</div>
        </div>
        <p className="kio__subtitle">Acerca el QR ubicado al reverso de tu credencial</p>

        <div className="kio-form">
          <div className="kio-card" style={{ marginBottom: 16 }}>
            <div className="kio-camera">
              <video ref={videoRef} autoPlay muted playsInline />
              {camState !== 'running' && (
                <div className="kio-camera__overlay">
                  {camState === 'starting' ? 'Iniciando cámara…'
                   : camState === 'error' ? 'Cámara no disponible'
                   : 'Listo para escanear'}
                </div>
              )}
            </div>
          </div>

          <div className="kio-card">
            <label className="kio-label">¿Problemas con la cámara? Ingresa tu matrícula</label>
            <input
              value={matricula}
              onChange={e => setMatricula(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="Ej. 223111852"
              inputMode="numeric"
              className="kio-input"
            />
            {error && <div className="kio-error" style={{ marginTop: 8 }}>{error}</div>}
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <button onClick={continueSeat} className="kio-primary">Continuar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
