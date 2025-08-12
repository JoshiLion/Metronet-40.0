// src/components/Map/BuildingInfoModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./BuildingInfoModal.css";
import { supabase } from "../../supabaseClient";
import { ReactComponent as DefaultAvatar } from "../../assets/iconos/user.svg";

const BRAND = "#71007B";

export default function BuildingInfoModal({ building, onClose }) {
  // building.highlight: { reason: 'person' | ..., meta: { identifier?, name? } }

  const baseData = useMemo(() => {
    const carreras = Array.isArray(building?.carreras) ? building.carreras : [];
    const aulas    = Array.isArray(building?.aulas)    ? building.aulas    : [];
    const oficinas = Array.isArray(building?.oficinas) ? building.oficinas : [];
    // ⬇ conserva employee (identifier) y name para emparejar
    const personal = (Array.isArray(building?.personal) ? building.personal : []).map(p => ({
      title: p?.name || "Sin nombre",
      rawName: p?.name || null,
      employee: p?.employee || null,
      subtitle: [p?.role, p?.room].filter(Boolean).join(" · ") || undefined,
      avatarPath: p?.avatar || null,
      contactUrl: p?.contactUrl || null
    }));
    return { Carreras: carreras, Aulas: aulas, Oficinas: oficinas, Personal: personal };
  }, [building]);

  const tabs = Object.keys(baseData);
  const [active, setActive] = useState(tabs[0] || "Carreras");

  // Animación abrir/cerrar
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOpen(true), 10); return () => clearTimeout(t); }, []);
  const handleClose = () => { setClosing(true); setOpen(false); setTimeout(() => onClose?.(), 260); };

  // Subrayado animado
  const tabsRef = useRef(null);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });
  const recalcUnderline = () => {
    const wrap = tabsRef.current; if (!wrap) return;
    const btn = wrap.querySelector(`button[data-tab="${active}"]`); if (!btn) return;
    const wRect = wrap.getBoundingClientRect(); const bRect = btn.getBoundingClientRect();
    setUnderline({ left: bRect.left - wRect.left, width: bRect.width });
  };
  useEffect(() => { recalcUnderline(); window.addEventListener("resize", recalcUnderline); return () => window.removeEventListener("resize", recalcUnderline); }, [active]);

  // Convierte avatar_path -> URL pública
  const [personalWithPhotos, setPersonalWithPhotos] = useState([]);
  useEffect(() => {
    const list = baseData.Personal || [];
    const resolved = list.map((p) => {
      if (!p.avatarPath) return { ...p, avatarUrl: null };
      if (/^https?:\/\//i.test(p.avatarPath)) return { ...p, avatarUrl: p.avatarPath };
      const { data } = supabase.storage.from("avatars").getPublicUrl(p.avatarPath);
      return { ...p, avatarUrl: data?.publicUrl || null };
    });
    setPersonalWithPhotos(resolved);
  }, [baseData.Personal]);

  const photo =
    building?.image360 || building?.photo_url || building?.image_url ||
    "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?q=80&w=1400&auto=format&fit=crop";

  // --- Destacar profesor seleccionado
  const listWrapRef = useRef(null);
  const rowRefs = useRef({}); // key -> element
  const [flashKey, setFlashKey] = useState(null);

  // Normaliza clave de match: primero identifier; si no, nombre (lower)
  const computeKey = (item) => (item.employee ? `id:${item.employee}` : item.rawName ? `nm:${item.rawName.toLowerCase().trim()}` : null);

  useEffect(() => {
    const h = building?.highlight;
    if (!h || h?.reason !== 'person') return;

    // fuerza pestaña Personal
    setActive('Personal');

    const run = () => {
      const meta = h.meta || {};
      const wantKey = meta.identifier ? `id:${String(meta.identifier)}` :
                      meta.name ? `nm:${String(meta.name).toLowerCase().trim()}` : null;
      if (!wantKey) return;

      // encuentra la fila
      const node = rowRefs.current[wantKey];
      if (!node) return;

      // scroll + flash
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setFlashKey(wantKey);
      setTimeout(() => setFlashKey(null), 1200);
    };

    // espera un ciclo para que la pestaña cambie y se pinte la lista
    const t = setTimeout(run, 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building?.highlight, personalWithPhotos]);

  const listToRender = active === "Personal" ? personalWithPhotos : baseData[active];
  const isPersonal   = active === "Personal";

  return (
    <>
      <button className={`card-scrim ${open && !closing ? "open" : ""}`} onClick={handleClose} aria-label="Cerrar panel" />

      <aside className={["card-panel", open ? "open" : "", closing ? "closing" : ""].join(" ")} role="dialog" aria-label={`Info de ${building?.name || "Edificio"}`}>
        <div className="card-cover">
          <img src={photo} alt={building?.name || "Edificio"} />
          <button className="card-close" onClick={handleClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke="#111" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <div className="card-360">360°</div>
        </div>

        <div className="card-tabs" ref={tabsRef}>
          {tabs.map((tab) => (
            <button key={tab} data-tab={tab} onClick={() => setActive(tab)} className={`card-tab ${active === tab ? "active" : ""}`} aria-current={active === tab ? "true" : "false"}>
              {tab}
            </button>
          ))}
          <span className="card-underline" style={{ left: underline.left + "px", width: underline.width + "px", background: BRAND }} />
        </div>

        <div className="card-list" ref={listWrapRef}>
          {(listToRender || []).map((item, i) => {
            if (!isPersonal) {
              const title = typeof item === "string" ? item : item?.title || "";
              const subtitle = typeof item === "string" ? null : item?.subtitle || null;
              return <Row key={i} title={title} subtitle={subtitle} />;
            }

            const keyId = computeKey(item);
            const isFlash = keyId && flashKey === keyId;

            return (
              <Row
                key={keyId || i}
                rowRef={(el) => { if (keyId) rowRefs.current[keyId] = el; }}
                title={item.title}
                subtitle={item.subtitle}
                avatarUrl={item.avatarUrl}
                showAvatar
                className={isFlash ? "flash" : ""}
                action={
                  item.contactUrl ? (
                    <a href={item.contactUrl} className="card-action" target="_blank" rel="noopener noreferrer">
                      Contactar
                      <svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  ) : (
                    <button className="card-action">
                      Contactar
                      <svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )
                }
              />
            );
          })}
        </div>
      </aside>
    </>
  );
}

function Row({ title, subtitle, avatarUrl, action, showAvatar = false, className = "", rowRef }) {
  const rowClass = `card-row ${showAvatar ? 'card-row--with-avatar' : 'card-row--simple'} ${className}`;
  return (
    <div className={rowClass} ref={rowRef}>
      {showAvatar && (
        <div className="card-avatar">
          {avatarUrl ? <img src={avatarUrl} alt={title} onError={(e) => { e.currentTarget.src = ""; e.currentTarget.alt = ""; }} /> : <DefaultAvatar />}
        </div>
      )}
      <div className="card-row-text">
        <p className="card-row-title">{title}</p>
        {subtitle && <p className="card-row-sub">{subtitle}</p>}
      </div>
      {action || null}
    </div>
  );
}
