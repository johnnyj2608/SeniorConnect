import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as MenuIcon } from '../../assets/menu.svg';

const navLinks = [
  { path: '/', label: 'home' },
  { path: '/members', label: 'members' },
  { path: '/registry', label: 'registry' },
  { path: '/settings', label: 'settings' },
];

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [navbarOpen, setNavbarOpen] = useState(false);

  const navRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 820) setNavbarOpen(false);
    };

    const handleClickOutside = (event) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setNavbarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setNavbarOpen(false);
  };

  return (
    <div className="app-header">
      <h1>Senior Connect</h1>
      <span>
        <button
          className="navbar-toggle"
          ref={toggleRef}
          onClick={() => setNavbarOpen((prev) => !prev)}
        >
          <MenuIcon />
        </button>

        <div className={`nav-links${navbarOpen ? ' open' : ''}`} ref={navRef}>
          {navLinks.map(({ path, label }) => (
            <button key={path} onClick={() => handleNavigate(path)}>
              <span>{t(`general.${label}`)}</span>
            </button>
          ))}
        </div>
      </span>
    </div>
  );
};

export default Navbar;