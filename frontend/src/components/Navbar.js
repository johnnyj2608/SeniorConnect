import React from 'react'
import { useNavigate } from 'react-router-dom';


const Header = () => {
  const navigate = useNavigate()

  return (
    <div className="app-header">
      <h1>Senior Connect</h1>
      <div>
        <button onClick={() => navigate('/')}>
          <span className="button-text">Home</span>
        </button>
        <button onClick={() => navigate('/members')}>
          <span className="button-text">Members</span>
        </button>
        <button onClick={() => navigate('/reports')}>
          <span className="button-text">Reports</span>
        </button>
        <button onClick={() => navigate('/auditlog')}>
          <span className="button-text">Audit Log</span>
        </button>
        <button onClick={() => navigate('/settings')}>
          <span className="button-text">Settings</span>
        </button>
      </div>
    </div>
  )
}

export default Header
