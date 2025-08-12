import React from 'react'
import UserCard  from '../../components/UserCard/UserCard'
import { useAuth } from '../../context/AuthContext'
import './HomePage.css'

export default function HomePage() {
  const { profile } = useAuth()
  if (!profile) return <p>Cargando...</p>

  // Datos semidinámicos para la tarjeta
  const quarter = profile?.students?.quarter ?? '8'
  const group   = profile?.students?.group_name ?? 'B'
  const average = profile?.students?.average_grade ?? '9.01'

  // Calificaciones (de tu captura)
  const grades = [
    { subject: 'Administración de Proyectos de Tecnologías de Información', c1: '10',   c2: '8.75', c3: '0', faltas: '0', promedio: '6.25', promWarn: true },
    { subject: 'Diseño de Interfaces',                                    c1: '7.95', c2: '8',    c3: '0', faltas: '2', promedio: '5.32', promWarn: true },
    { subject: 'Gestión de Desarrollo de Software',                       c1: '7.9',  c2: '8',    c3: '0', faltas: '0', promedio: '5.3',  promWarn: true },
    { subject: 'Industria 4.0 VII Videojuegos',                           c1: '9.17', c2: '8.45', c3: '0', faltas: '2', promedio: '5.87', promWarn: true },
    { subject: 'Inglés VIII',                                             c1: '8.13', c2: '6.88', c3: '0', faltas: '4', promedio: '5',    promWarn: true, warnC2: true },
    { subject: 'Sistemas Inteligentes',                                   c1: '8.40', c2: '7.88', c3: '0', faltas: '5', promedio: '5.43', promWarn: true },
    { subject: 'Tecnologías de Virtualización',                           c1: '6.71', c2: '9.23', c3: '0', faltas: '1', promedio: '5.31', promWarn: true, warnC1: true },
    { subject: 'Tecnologías y Aplicaciones en Internet',                  c1: '9.1',  c2: '9.5',  c3: '0', faltas: '4', promedio: '6.2',  promWarn: false },
  ]

return (
  <div className="profile-page">
    <div className="profile-page__header">
      <span className="profile-page__icon">👤</span>
      <h1>Mi perfil</h1>
    </div>

    <div className="profile-grid">
      {/* Columna izquierda */}
      <aside className="left-col">
        <div className="card user-summary">
          <UserCard user={profile} />

          <div className="info-block">
            <h3>Información</h3>
            <div className="info-row"><span>Cuatrimestre:</span><strong>{quarter}</strong></div>
            <div className="info-row"><span>Grupo:</span><strong>{group}</strong></div>
            <div className="info-row"><span>Promedio:</span><strong>{average}</strong></div>
          </div>
        </div>

        <div className="card notices">
          <div className="notices__header">
            <h3>Avisos</h3><span className="today">Hoy</span>
          </div>
          <ul className="notices__list">
            <li><span className="dot dot--purple" />Reunión con tutor académico · 17:00</li>
            <li><span className="dot dot--purple" />Entrega de reporte en Proyecto Integrador</li>
            <li><span className="dot dot--purple" />Actualización de calificaciones disponible</li>
          </ul>
        </div>
      </aside>

      {/* Columna derecha: horario */}
      <section className="card schedule">
        <div className="schedule__header">
          <h3>Horario</h3>
          <button className="btn btn--ghost">Exportar PDF</button>
        </div>

        {/* 👇 slider horizontal SOLO para el horario */}
        <div className="calendar-scroll">
          <div className="calendar">
            {/* Encabezado de días */}
            <div className="calendar__row calendar__row--head">
              <div className="cell time" />
              <div className="cell">Lun</div>
              <div className="cell">Mar</div>
              <div className="cell">Mié</div>
              <div className="cell">Jue</div>
              <div className="cell">Vie</div>
            </div>

            {/* Horas */}
            {['7:00','8:00','9:00','10:00','11:00','12:00','13:00','14:00'].map(t => (
              <div key={t} className="calendar__row">
                <div className="cell time">{t}</div>
                <div className="cell" /><div className="cell" /><div className="cell" /><div className="cell" /><div className="cell" />
              </div>
            ))}

            {/* Eventos (mock) */}
            <div className="event e1"><strong>Sistemas Inteligentes</strong><span>8:00 – 10:00</span></div>
            <div className="event e2"><strong>Desarrollo Web</strong><span>10:00 – 12:00</span></div>
            <div className="event e3"><strong>Bases de Datos</strong><span>12:00 – 14:00</span></div>
            <div className="event e4"><strong>Calidad de Software</strong><span>9:00 – 11:00</span></div>
            <div className="event e5"><strong>Proyecto Integrador</strong><span>11:00 – 13:00</span></div>
          </div>
        </div>
      </section>
    </div>

    {/* Calificaciones */}
    <section className="card grades">
      <div className="grades__header">
        <h3>Calificaciones</h3>
        <div className="grades__toolbar">
          <select className="select">
            <option>Todos los cursos</option>
            {grades.map(g => <option key={g.subject}>{g.subject}</option>)}
          </select>
          <button className="btn btn--ghost">Exportar CSV</button>
        </div>
      </div>

      <div className="table table--grades">
        <div className="tr tr--head">
          <div>Materia</div>
          <div>1er corte</div>
          <div>2do corte</div>
          <div>3er corte</div>
          <div>Faltas</div>
          <div>Promedio</div>
        </div>

        {grades.map(row => (
          <div className="tr" key={row.subject}>
            <div>{row.subject}</div>
            <div className={row.warnC1 ? 'warn' : ''}>{row.c1}</div>
            <div className={row.warnC2 ? 'warn' : ''}>{row.c2}</div>
            <div>{row.c3}</div>
            <div>{row.faltas}</div>
            <div className={row.promWarn ? 'warn' : ''}>{row.promedio}</div>
          </div>
        ))}
      </div>
    </section>
  </div>
)

}
