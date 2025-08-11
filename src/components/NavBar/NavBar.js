import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../context/AuthContext'
import NavItem from './NavItem'
import { ReactComponent as MenuIcon }   from '../../assets/iconos/menu.svg'
import { ReactComponent as CloseIcon }  from '../../assets/iconos/close.svg'
import { ReactComponent as ProfileIcon }from '../../assets/iconos/user.svg'
import { ReactComponent as LabIcon }    from '../../assets/iconos/monitor.svg'
import { ReactComponent as LogoutIcon } from '../../assets/iconos/logout.svg'
import { ReactComponent as MapIcon }    from '../../assets/iconos/map.svg'
import './NavBar.css'

const isMobile = () => window.matchMedia('(max-width: 768px)').matches

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()

  useEffect(() => {
    const openEvt   = () => setOpen(true)
    const closeEvt  = () => setOpen(false)
    const toggleEvt = () => setOpen(v => !v)
    document.addEventListener('open-sidebar', openEvt)
    document.addEventListener('close-sidebar', closeEvt)
    document.addEventListener('toggle-sidebar', toggleEvt)
    const onEsc = (e) => { if (e.key === 'Escape' && isMobile()) setOpen(false) }
    window.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('open-sidebar', openEvt)
      document.removeEventListener('close-sidebar', closeEvt)
      document.removeEventListener('toggle-sidebar', toggleEvt)
      window.removeEventListener('keydown', onEsc)
    }
  }, [])

  if (!profile) return null

  const items = [
    { id: 'profile', label: 'Mi perfil', icon: ProfileIcon, path: '/' },
    { id: 'map',     label: 'Mapa',      icon: MapIcon,     path: '/map' },
    ...(profile.role === 'professor' && profile.is_lab_admin
      ? [{ id: 'lab', label: 'LabTrack', icon: LabIcon, path: '/lab' }]
      : [])
  ]

  const go = (path) => () => {
    navigate(path)
    if (isMobile()) setOpen(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
    if (isMobile()) setOpen(false)
  }

  return (
    <>
      <nav
        className={`navbar ${open ? 'navbar--open' : 'navbar--closed'}`}
        role="navigation" aria-label="Menú lateral"
      >
        {/* TOGGLE superior */}
        <div className="navbar__toggle-container">
          <button
            className="navbar__toggle"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            title="Menú"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Sección NAV */}
        <div className="navbar__section">
          
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
                  onClick={go(item.path)}
                />
              )
            })}
          </div>
        </div>

        {/* Footer */}
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

      {/* Backdrop móvil */}
      <div className="navbar__backdrop" onClick={() => setOpen(false)} />
    </>
  )
}
