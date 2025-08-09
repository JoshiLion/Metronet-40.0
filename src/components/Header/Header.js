import React from 'react'
import './Header.css'
import { ReactComponent as UserIcon } from '../../assets/iconos/user.svg'
import { ReactComponent as BellIcon } from '../../assets/iconos/bell.svg'  // futuro

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__left">
        
        <h1 className="app-header__title">METRONET</h1>
      </div>
      <div className="app-header__right">
        <button className="icon-button">
          <BellIcon className="icon-button__icon" />
        </button>
        <button className="icon-button">
          <UserIcon className="icon-button__icon" />
        </button>
      </div>
    </header>
  )
}
