// src/components/NavItem.js
import React from 'react'
import './NavItem.css'

export default function NavItem({
  icon: Icon,
  label,
  selected = false,
 onClick,
 open = false
}) {
  return (
    <button
      className={`nav-item ${open ? 'nav-item--open' : ''}`}
      onClick={onClick}
      title={label}
    >
      <div
        className={
          'nav-item__icon-wrapper' +
          (selected ? ' nav-item__icon-wrapper--selected' : '')
        }
      >
        <Icon className="nav-item__icon" />
      </div>
      {open && (
        <span className="nav-item__label">{label}</span>
      )}
    </button>
  )
}
