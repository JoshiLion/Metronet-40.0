import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import NavItem from './NavItem'
import { ReactComponent as MenuIcon }   from '../assets/menu.svg'
import { ReactComponent as CloseIcon }  from '../assets/close.svg'
import { ReactComponent as ProfileIcon }from '../assets/user.svg'
import { ReactComponent as LabIcon }    from '../assets/monitor.svg'
import { ReactComponent as LogoutIcon } from '../assets/logout.svg'
import './NavBar.css'

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()

  // Si no hay profile aún, no renderices nada
  if (!profile) return null

  // Botones siempre visibles
  const items = [
    { id: 'profile', label: 'Mi perfil', icon: ProfileIcon, path: '/' }
  ]

  // Mostrar LabTrack solo a profesores encargados
if (
  profile.role === 'professor' &&
  profile.is_lab_admin  // ← aquí
) {
  items.push({ id: 'lab', label: 'LabTrack', icon: LabIcon, path: '/lab' })
}

  // Handler de logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <nav className={`navbar ${open ? 'navbar--open' : 'navbar--closed'}`}>
      {/* Toggle */}
      <div className="navbar__toggle-container">
        <button
          className="navbar__toggle"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Lista de ítems según rol */}
      <div className="navbar__list">
        {items.map(item => {
          const selected = location.pathname === item.path
          return (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              selected={selected}
              open={open}
              onClick={() => navigate(item.path)}
            />
          )
        })}
      </div>

      {/* Botón de salir al fondo */}
      <div className="navbar__footer">
        <NavItem
          icon={LogoutIcon}
          label="Salir"
          selected={false}
          open={open}
          onClick={handleLogout}
        />
      </div>
    </nav>
  )
}
