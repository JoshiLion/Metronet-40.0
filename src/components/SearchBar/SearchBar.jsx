import React, { useEffect, useMemo, useRef, useState } from "react";
import "./SearchBar.css";
import { supabase } from "../../supabaseClient";

const BRAND = "#71007B";

function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/**
 * Tipos soportados:
 *  - person: perfiles + building_staff
 *  - building: tabla buildings (si existe)
 *  - program: tabla programs + building_programs
 *  - room: tabla rooms (aulas / oficinas)
 */
export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 300);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // Esc: cerrar
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQ("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click fuera (desktop)
  useEffect(() => {
    const onDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Focus al abrir
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Consulta principal
  useEffect(() => {
    const run = async () => {
      const term = debouncedQ.trim();
      if (!term) { setResults([]); return; }
      setLoading(true);

      try {
        const acc = [];

        // ---- A) PERSONAL por nombre o matrícula
        const { data: profiles, error: pErr } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, identifier")
          .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,identifier.ilike.%${term}%`)
          .limit(15);

        if (!pErr && Array.isArray(profiles) && profiles.length) {
          const rows = await Promise.all(
            profiles.map(async (p) => {
              const { data: staff, error: sErr } = await supabase
                .from("building_staff")
                .select("building_id, room_code, title")
                .eq("profile_id", p.id)
                .limit(1)
                .single();
              if (sErr || !staff) return null;
              const full = [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || p.identifier;
              return {
                type: "person",
                title: full,
                subtitle: [staff.title || "Docente", staff.room_code].filter(Boolean).join(" · "),
                buildingId: String(staff.building_id || "").toLowerCase().trim(),
                extra: { profile_id: p.id, identifier: p.identifier, name: full }
              };
            })
          );
          acc.push(...rows.filter(Boolean));
        }

        // ---- B) EDIFICIOS por nombre (si existe la tabla)
        try {
          const { data: buildings, error: bErr } = await supabase
            .from("buildings")
            .select("id, name")
            .or(`id.ilike.%${term}%,name.ilike.%${term}%`)
            .limit(10);
          if (!bErr && Array.isArray(buildings)) {
            acc.push(
              ...buildings.map(b => ({
                type: "building",
                title: b.name || (b.id || "").toUpperCase(),
                subtitle: "Edificio",
                buildingId: String(b.id).toLowerCase().trim()
              }))
            );
          }
        } catch { /* ignore si no existe tabla */ }

        // ---- C) CARRERAS (PROGRAMS) + en qué edificio(s) están
        try {
          const { data: programs, error: prErr } = await supabase
            .from("programs")
            .select("id, name, building_programs(building_id)")
            .ilike("name", `%${term}%`)
            .limit(10);
          if (!prErr && Array.isArray(programs)) {
            programs.forEach(pr => {
              const bps = Array.isArray(pr.building_programs) ? pr.building_programs : [];
              // si hay varios edificios, generamos una entrada por edificio
              bps.forEach(bp => {
                if (!bp?.building_id) return;
                acc.push({
                  type: "program",
                  title: pr.name,
                  subtitle: "Carrera",
                  buildingId: String(bp.building_id).toLowerCase().trim()
                });
              });
              // sin edificio asociado: igual mostramos, pero sin “Ubicar”
              if (bps.length === 0) {
                acc.push({
                  type: "program",
                  title: pr.name,
                  subtitle: "Carrera",
                  buildingId: null
                });
              }
            });
          }
        } catch { /* ignore */ }

        // ---- D) AULAS / OFICINAS (ROOMS) por código o tipo
        try {
          const { data: rooms, error: rErr } = await supabase
            .from("rooms")
            .select("id, code, kind, building_id")
            .or(`code.ilike.%${term}%,kind.ilike.%${term}%`)
            .limit(15);
          if (!rErr && Array.isArray(rooms)) {
            acc.push(
              ...rooms.map(r => ({
                type: "room",
                title: r.code,
                subtitle: (r.kind || "Espacio"),
                buildingId: String(r.building_id || "").toLowerCase().trim()
              }))
            );
          }
        } catch { /* ignore */ }

        setResults(acc);
      } catch (e) {
        console.error("[SearchBar] error:", e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [debouncedQ]);

  const handleSelect = (item) => {
    // Si no tiene building, no ubicamos (solo mostramos)
    if (!item?.buildingId) return;

    const ev = new CustomEvent("locate-building", {
      detail: { buildingId: item.buildingId, reason: item.type, openModal: true }
    });
    window.dispatchEvent(ev);

    setOpen(false);
    setQ("");
  };

  const filtered = useMemo(() => results, [results]);

  return (
    <div className="search-wrap-left" ref={wrapRef}>
      {!open && (
        <button className="search-fab" aria-label="Buscar" onClick={() => setOpen(true)}>
          <IconSearch />
        </button>
      )}

      {open && (
        <div className="search-shell">
          {/* Solo el input tiene forma de “pill” */}
          <div className="search-input-pill">
            <IconSearch color={BRAND} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Escribe qué quieres encontrar…"
            />
            {!!q && (
              <button
                className="search-clear"
                aria-label="Cerrar"
                onClick={() => { setQ(""); setOpen(false); }}
              >
                <IconX />
              </button>
            )}
          </div>

          {/* Resultados: tarjeta aparte (bordes 16px) */}
          {q && (
            <div className="search-results-card">
              {loading && <div className="search-empty">Buscando…</div>}
              {!loading && filtered.length === 0 && (
                <div className="search-empty">No se encontraron resultados para “{q}”.</div>
              )}
              {!loading && filtered.map((r, i) => (
                <ResultRow
                  key={`${r.type}-${r.title}-${i}`}
                  title={r.title}
                  subtitle={resolveSubtitle(r)}
                  canLocate={!!r.buildingId}
                  onLocate={() => handleSelect(r)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function resolveSubtitle(r) {
  if (r.subtitle) return r.subtitle;
  if (r.type === "person")   return "Personal";
  if (r.type === "building") return "Edificio";
  if (r.type === "program")  return "Carrera";
  if (r.type === "room")     return "Espacio";
  return "";
}

function ResultRow({ title, subtitle, canLocate, onLocate }) {
  return (
    <div className="row">
      <div className="row-avatar"><IconUser /></div>
      <div className="row-text">
        <p className="row-title">{title}</p>
        {subtitle && <p className="row-sub">{subtitle}</p>}
      </div>
      {canLocate && (
        <button className="row-action" onClick={onLocate}>
          <span>Ubicar</span>
          <span className="row-action__arrow"><IconArrowRight /></span>
        </button>
      )}
    </div>
  );
}

/* ----- Iconos SVG sin dependencias ----- */
function IconSearch({ color = "#666" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
      <path d="M20 20L17 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="#71007B" strokeWidth="2" />
      <path d="M4 20c2.5-3 5-4 8-4s5.5 1 8 4" stroke="#71007B" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="#71007B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
