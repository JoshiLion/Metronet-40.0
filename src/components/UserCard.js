import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import './UserCard.css'
import { ReactComponent as DefaultAvatar } from '../assets/user.svg'

export default function UserCard({ user }) {
  const [avatarUrl, setAvatarUrl] = useState(null)

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

  const { first_name, last_name, identifier, students, professors, role } = user
  const fullName = [first_name, last_name].filter(Boolean).join(' ') || identifier
console.log('profile.avatar_url =', user.avatar_url)
  return (
    <div className="user-card">
      <div className="user-card__header">
        <div className="user-card__avatar">
          {avatarUrl
  ? <img 
      src={avatarUrl} 
      alt="Avatar" 
      className="avatar-img"
      onError={(e) => console.error('IMG load error:', e.target.src)}
    />
  : <DefaultAvatar />
}

        </div>
        <div className="user-card__info">
          <h3 className="user-card__name">{fullName}</h3>
          <p className="user-card__id">{identifier}</p>
          {role === 'student' && <p className="user-card__career">{students?.career}</p>}
          {role === 'professor' && <p className="user-card__career">{professors?.department}</p>}
        </div>
      </div>
    </div>
  )
}
