import React, { useState } from 'react'
import { ReactComponent as EyeOpen } from '../../assets/eye-open.svg'
import { ReactComponent as EyeClose } from '../../assets/eye-close.svg'

const PasswordField = ({ value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="password-field-wrapper">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder="Password"
        required
        className="password-input"
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
        aria-label="Toggle password visibility"
      >
        {showPassword ? (
          <EyeClose className="eye-close" />
        ) : (
          <EyeOpen className="eye-open" />
        )}
      </button>
    </div>
  )
}

export default PasswordField
