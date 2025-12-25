import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isVendor, isAdmin } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
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
          <img src="/logo.png" alt="Amana Logo" className="logo-img" style={{ height: '32px', width: '32px' }} />
          <span>Amana</span>
        </Link>
        
        <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
          <Link to="/problem" className={`nav-link ${isActive('/problem')}`} onClick={closeMenu}>Problem</Link>
          <Link to="/solution" className={`nav-link ${isActive('/solution')}`} onClick={closeMenu}>Solution</Link>
          <Link to="/how-it-works" className={`nav-link ${isActive('/how-it-works')}`} onClick={closeMenu}>How It Works</Link>
          <a href="#download-app" className="nav-link" onClick={closeMenu}>App</a>
          <Link to="/demo" className={`nav-link ${isActive('/demo')}`} onClick={closeMenu}>Demo</Link>
          
          {user ? (
             <>
                <Link 
                    to={isVendor ? "/vendor" : (isAdmin ? "/admin" : "/dashboard")} 
                    className="btn btn-primary btn-sm glow-effect"
                    onClick={closeMenu}
                >
                    Dashboard
                </Link>
             </>
          ) : (
            <>
              <a href="/builds/amana-latest.apk" download className="nav-link hide-mobile">Download App</a>
              <Link to="/login" className={`nav-link ${isActive('/login')}`} onClick={closeMenu}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm glow-effect" onClick={closeMenu}>Get Started</Link>
            </>
          )}
          
          {/* Theme Toggle - visible on mobile menu */}
          <div className="mobile-theme-toggle">
            <ThemeToggle />
          </div>
        </div>

        {/* Theme Toggle - visible on desktop */}
        <div className="desktop-theme-toggle">
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

