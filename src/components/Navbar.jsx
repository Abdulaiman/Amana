import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isVendor, isAdmin } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) { document.body.classList.add('no-scroll'); }
    else { document.body.classList.remove('no-scroll'); }
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.classList.remove('no-scroll');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Amana Logo" />
          <span>Amana</span>
        </Link>

        <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
          <Link to="/#problem" className="nav-link" onClick={closeMenu}>Problem</Link>
          <Link to="/#solution" className="nav-link" onClick={closeMenu}>Solution</Link>
          <a href="#download-app" className="nav-link" onClick={closeMenu}>App</a>
          <Link to="/demo" className={`nav-link ${isActive('/demo')}`} onClick={closeMenu}>Demo</Link>

          <div className="navbar-actions">
            {user ? (
              <Link
                to={isVendor ? "/vendor" : (isAdmin ? "/admin" : "/dashboard")}
                className="btn btn-primary btn-sm"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <a href="https://drive.google.com/uc?export=download&id=1Yqz9jshwEwVvSSpPSKDOWBOSBKV1pUW2" download className="nav-link hide-mobile">Download App</a>
                <Link to="/login" className={`nav-link ${isActive('/login')}`} onClick={closeMenu}>Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>Get Started</Link>
              </>
            )}
          </div>

          <div className="mobile-theme-toggle">
            <ThemeToggle />
          </div>
        </div>

        <div className="desktop-toggle">
          <ThemeToggle />
        </div>

        <button className="navbar-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
