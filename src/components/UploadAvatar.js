// src/components/UploadAvatar.js
import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function UploadAvatar() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${profile.id}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // 1) Sube al bucket
    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      console.error(uploadError)
      setLoading(false)
      return
    }

    // 2) Guarda la ruta en profiles.avatar_url
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ avatar_url: fileName })
      .eq('id', profile.id)

    if (dbError) console.error(dbError)
    setLoading(false)
    // Opcional: refrescar el profile en el contexto
    window.location.reload()
  }

  return (
    <div>
      <label>
        {loading ? 'Subiendo…' : 'Cambiar avatar:'}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
        />
      </label>
    </div>
  )
}
