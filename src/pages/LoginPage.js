// src/pages/LoginPage.js
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import InputField from '../components/inputField'
import PrimaryButton from '../components/primaryButton'
import { ReactComponent as UserIcon } from '../assets/user.svg'
import { ReactComponent as LockIcon } from '../assets/lock.svg'
import './LoginPreview.css'  // reaprovechamos estilos

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  // 1) Construye el email
  const email = `${identifier}@metronet.local`

  // 2) Llama a supabase
  const { data, error: err } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  console.log('Login attempt:', { email, password, err, data })

  // 3) Apaga el loading
  setLoading(false)

  // 4) Muestra error si lo hay
  if (err) {
    setError(err.message)
  }
  // Si no hay err, tu AuthContext redirige automáticamente a /profile
}



  return (
    <div className="login-preview-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <div className="login-box__header">
          <h2>METRONET</h2>
        </div>

        <div className="login-box__fields">
          <InputField
            label="Matrícula / ID:"
            placeholder="Escribe tu matrícula o ID"
            icon={<UserIcon />}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <InputField
            label="Contraseña:"
            placeholder="Escribe tu contraseña"
            type="password"
            icon={<LockIcon />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="login-box__actions">
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? 'Cargando…' : 'Entrar'}
          </PrimaryButton>
        </div>
      </form>
    </div>
  )
}
