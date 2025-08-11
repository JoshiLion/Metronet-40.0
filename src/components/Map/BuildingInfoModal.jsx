import React, { useEffect, useMemo, useRef, useState } from "react";
import "./BuildingInfoModal.css";
import { supabase } from "../../supabaseClient";
import { ReactComponent as DefaultAvatar } from "../../assets/iconos/user.svg";

const BRAND = "#71007B";

export default function BuildingInfoModal({ building, onClose }) {
  // Normaliza lo que ya viene del CampusMap:
  // carreras: string[], aulas: string[], oficinas: string[], personal: {name, role, room, avatar, contactUrl}[]
  const baseData = useMemo(() => {
    const carreras = Array.isArray(building?.carreras) ? building.carreras : [];
    const aulas    = Array.isArray(building?.aulas)    ? building.aulas    : [];
    const oficinas = Array.isArray(building?.oficinas) ? building.oficinas : [];
    const personal = (Array.isArray(building?.personal) ? building.personal : []).map(p => ({
      title: p?.name || "Sin nombre",
      subtitle: [p?.role, p?.room].filter(Boolean).join(" · ") || undefined,
      avatarPath: p?.avatar || null,      // ruta en bucket o URL completa
      contactUrl: p?.contactUrl || null   // link a Gmail compose si hubo email
    }));
    return { Carreras: carreras, Aulas: aulas, Oficinas: oficinas, Personal: personal };
  }, [building]);

  const tabs = Object.keys(baseData);
  const [active, setActive] = useState(tabs[0] || "Carreras");

  // ------- Animación de entrada/salida
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 10);
    return () => clearTimeout(t);
  }, []);
  const handleClose = () => {
    setClosing(true);
    setOpen(false);
    setTimeout(() => onClose?.(), 260);
  };

  // ------- Subrayado animado
  const tabsRef = useRef(null);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });
  const recalcUnderline = () => {
    const wrap = tabsRef.current;
    if (!wrap) return;
    const btn = wrap.querySelector(`button[data-tab="${active}"]`);
    if (!btn) return;
    const wRect = wrap.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setUnderline({ left: bRect.left - wRect.left, width: bRect.width });
  };
  useEffect(() => {
    recalcUnderline();
    window.addEventListener("resize", recalcUnderline);
    return () => window.removeEventListener("resize", recalcUnderline);
  }, [active]);

  // ------- Convierte avatar_path -> URL pública (como en UserCard)
  const [personalWithPhotos, setPersonalWithPhotos] = useState([]);
  useEffect(() => {
    const list = baseData.Personal || [];
    const resolved = list.map((p) => {
      if (!p.avatarPath) return { ...p, avatarUrl: null };

      // Ya es URL pública
      if (/^https?:\/\//i.test(p.avatarPath)) {
        return { ...p, avatarUrl: p.avatarPath };
      }

      // Ruta dentro del bucket 'avatars'
      const { data } = supabase.storage.from("avatars").getPublicUrl(p.avatarPath);
      return { ...p, avatarUrl: data?.publicUrl || null };
    });

    setPersonalWithPhotos(resolved);
  }, [baseData.Personal]);

  const photo =
    building?.image360 ||
    building?.photo_url ||
    building?.image_url ||
    "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?q=80&w=1400&auto=format&fit=crop";

  const listToRender = active === "Personal" ? personalWithPhotos : baseData[active];
  const isPersonal   = active === "Personal";

  return (
    <>
      {/* Scrim dentro del host del mapa (no tapa navbar) */}
      <button
        className={`card-scrim ${open && !closing ? "open" : ""}`}
        onClick={handleClose}
        aria-label="Cerrar panel"
      />

      {/* Panel: derecha desktop / bottom-sheet móvil */}
      <aside
        className={["card-panel", open ? "open" : "", closing ? "closing" : ""].join(" ")}
        role="dialog"
        aria-label={`Info de ${building?.name || "Edificio"}`}
      >
        {/* Cover + cerrar + 360 */}
        <div className="card-cover">
          <img src={photo} alt={building?.name || "Edificio"} />
          <button className="card-close" onClick={handleClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="card-360">360°</div>
        </div>

        {/* Tabs con subrayado */}
        <div className="card-tabs" ref={tabsRef}>
          {tabs.map((tab) => (
            <button
              key={tab}
              data-tab={tab}
              onClick={() => setActive(tab)}
              className={`card-tab ${active === tab ? "active" : ""}`}
              aria-current={active === tab ? "true" : "false"}
            >
              {tab}
            </button>
          ))}
          <span
            className="card-underline"
            style={{ left: underline.left + "px", width: underline.width + "px", background: BRAND }}
          />
        </div>

        {/* Lista */}
        <div className="card-list">
          {(listToRender || []).map((item, i) => {
            if (!isPersonal) {
              // Carreras / Aulas / Oficinas => SIN avatar
              const title = typeof item === "string" ? item : item?.title || "";
              const subtitle = typeof item === "string" ? null : item?.subtitle || null;
              return <Row key={i} title={title} subtitle={subtitle} />;
            }

            // Personal => CON avatar (si hay)
            return (
              <Row
                key={i}
                title={item.title}
                subtitle={item.subtitle}
                avatarUrl={item.avatarUrl}
                showAvatar
                action={
                  item.contactUrl ? (
                    <a href={item.contactUrl} className="card-action" target="_blank" rel="noopener noreferrer">
                      Contactar
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  ) : (
                    <button className="card-action">
                      Contactar
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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

/** Row genérico de la lista.
 *  - showAvatar=false => NO se renderiza bloque de avatar
 *  - showAvatar=true  => si avatarUrl existe, img; si no, DefaultAvatar
 */
function Row({ title, subtitle, avatarUrl, action, showAvatar = false }) {
  const rowClass = `card-row ${showAvatar ? 'card-row--with-avatar' : 'card-row--simple'}`;

  return (
    <div className={rowClass}>
      {showAvatar && (
        <div className="card-avatar">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={title}
              onError={(e) => { e.currentTarget.src = ""; e.currentTarget.alt = ""; }}
            />
          ) : (
            <DefaultAvatar />
          )}
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

