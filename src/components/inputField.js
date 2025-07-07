// src/components/InputField.js
import './InputField.css'

export default function InputField({ label, icon, ...inputProps }) {
  return (
    <div className="input-group">
      <label className="input-group__label">{label}</label>
      <div className="input-wrapper">
        {/* aquí “esparcimos” todas las props que le pases: value, onChange, type, placeholder... */}
        <input
          className="input-wrapper__input"
          {...inputProps}
        />
        {icon && (
          <div className="input-wrapper__icon">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
