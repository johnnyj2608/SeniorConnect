import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { ReactComponent as MenuIcon } from '../assets/menu.svg'

const Navbar = () => {
  const navigate = useNavigate()
  const [navbarOpen, setNavbarOpen] = useState(false);

  const handleResize = () => {
    if (window.innerWidth > 820) {
      setNavbarOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="app-header">
      <h1>Senior Connect</h1>

      <button className="navbar-toggle" onClick={() => setNavbarOpen(!navbarOpen)}>
        <MenuIcon />  
      </button>

      <div className={`nav-links ${navbarOpen ? "open" : ""}`}>
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

export default Navbar
