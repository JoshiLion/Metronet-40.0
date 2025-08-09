// src/pages/ProfilePage.js
import { useAuth } from '../../context/AuthContext'
import './ProfilePage.css'

export default function ProfilePage() {
  const { profile } = useAuth()
  if (!profile) return <p>Cargando perfil…</p>

  const fullName = `${profile.first_name} ${profile.last_name}`

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Mi Perfil</h2>
        <p><strong>Nombre:</strong> {fullName}</p>
        <p><strong>ID:</strong> {profile.identifier}</p>
        <p><strong>Rol:</strong> {profile.role}</p>
        {profile.role === 'student' && (
          <>
            <p><strong>Cuatrimestre:</strong> {profile.students.quarter}</p>
            <p><strong>Grupo:</strong> {profile.students.group_name}</p>
            <p><strong>Carrera:</strong> {profile.students.career}</p>
            <p><strong>Promedio:</strong> {profile.students.average_grade}</p>
          </>
        )}
        {profile.role === 'professor' && (
          <>
            <p><strong>Departamento:</strong> {profile.professors.department}</p>
            <p><strong>Cargo:</strong> {profile.professors.title}</p>
          </>
        )}
        {profile.is_lab_admin && (
          <button className="view-registrations">
            Ver registros de laboratorio
          </button>
        )}
      </div>
    </div>
  )
}
