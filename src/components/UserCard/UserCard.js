import React, { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import './UserCard.css'
import { ReactComponent as DefaultAvatar } from '../../assets/iconos/user.svg'

export default function UserCard({ user }) {
  const [avatarUrl, setAvatarUrl] = useState(null)

  // Carga URL pública de Supabase Storage
  useEffect(() => {
    if (user.avatar_url) {
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(user.avatar_url)

      console.log('Avatar público:', data.publicUrl)
      setAvatarUrl(data.publicUrl)
    }
  }, [user.avatar_url])

  const {
    first_name,
    last_name,
    identifier,
    role,
    students,
    professors
  } = user

  const fullName = [first_name, last_name]
    .filter(Boolean)
    .join(' ') || identifier

  // Obtén el nombre del programa desde students.programs
  const programName = students?.programs?.name || 'Sin programa'

  return (
    <div className="user-card">
      <div className="user-card__header">
        <div className="user-card__avatar">
          {avatarUrl
            ? <img
                src={avatarUrl}
                alt="Avatar"
                className="avatar-img"
                onError={e => console.error('IMG load error:', e.target.src)}
              />
            : <DefaultAvatar />
          }
        </div>
        <div className="user-card__info">
          <h3 className="user-card__name">{fullName}</h3>
          <p className="user-card__id">{identifier}</p>

          {role === 'student' && (
            <p className="user-card__career">{programName}</p>
          )}

          {role === 'professor' && (
            <p className="user-card__career">
              {professors?.department || 'Sin departamento'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
