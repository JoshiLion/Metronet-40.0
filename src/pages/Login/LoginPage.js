// src/pages/Login/LoginPage.js
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import InputField from '../../components/InputField/inputField'
import PrimaryButton from '../../components/PrimaryButton/primaryButton'
import { ReactComponent as UserIcon } from '../../assets/iconos/user.svg'
import { ReactComponent as LockIcon } from '../../assets/iconos/lock.svg'
import './LoginPreview.css'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const email = `${identifier}@alumnos.upmh.edu.mx`
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      // login OK -> vuelve a donde ibas (o /)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = () => {
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
