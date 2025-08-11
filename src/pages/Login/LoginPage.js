// src/pages/LoginPage.js
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import InputField from '../../components/InputField/inputField'
import PrimaryButton from '../../components/PrimaryButton/primaryButton'
import { ReactComponent as UserIcon } from '../../assets/iconos/user.svg'
import { ReactComponent as LockIcon } from '../../assets/iconos/lock.svg'
import './LoginPreview.css'  // reaprovechamos estilos

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 1) Construye el email
    const email = `${identifier}@alumnos.upmh.edu.mx`

    // 2) Llama a supabase
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    console.log('Login attempt:', { email, err, data })

    // 3) Apaga el loading
    setLoading(false)

    // 4) Muestra error si lo hay
    if (err) {
      setError(err.message)
    }
    // Si no hay err, tu AuthContext redirige automáticamente a /profile
  }

  const handleGuest = () => {
    // Ruta pública sin layout (solo mapa)
    navigate('/guest-map', { replace: true })
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

          {/* link morado dentro de la card (no envía el form) */}
          <button
            type="button"
            className="guest-link login-box__guest"
            onClick={handleGuest}
          >
            Ingresa como invitado
          </button>
        </div>
      </form>
    </div>
  )
}
