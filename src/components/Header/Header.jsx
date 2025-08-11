import React from 'react'
import './Header.css'
import { ReactComponent as UserIcon } from '../../assets/iconos/user.svg'
import { ReactComponent as BellIcon } from '../../assets/iconos/bell.svg'
import { ReactComponent as MenuIcon } from '../../assets/iconos/menu.svg'

export default function Header() {
  const toggleSidebar = () =>
    document.dispatchEvent(new CustomEvent('toggle-sidebar'))

  return (
    <header className="app-header" role="banner">
      <div className="app-header__left">
        {/* Hamburguesa (solo visible en móvil por CSS) */}
        <button
          className="header__menu"
          aria-label="Abrir menú"
          onClick={toggleSidebar}
        >
          <MenuIcon />
        </button>

        <h1 className="app-header__brand">
          
          METRONET
        </h1>
      </div>

      <div className="app-header__right">
        <button className="icon-btn" aria-label="Notificaciones">
          <BellIcon className="icon" />
        </button>
        <button className="icon-btn" aria-label="Perfil">
          <UserIcon className="icon" />
        </button>
      </div>
    </header>
  )
}
