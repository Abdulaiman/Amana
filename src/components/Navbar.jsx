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

  const handleNavClick = (e, targetId) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
    document.body.classList.remove('no-scroll');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo serif-logo">
          <span>AMANA</span>
        </Link>

        <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
          <a href="/#how-it-works" className="nav-link" onClick={(e) => handleNavClick(e, 'how-it-works')}>How It Works</a>
          <a href="/#about" className="nav-link" onClick={(e) => handleNavClick(e, 'about')}>About</a>
          <a href="/#faq" className="nav-link" onClick={(e) => handleNavClick(e, 'faq')}>FAQ</a>
          <a href="/#contact" className="nav-link" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>

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
                <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
                <Link to="/register" className="btn btn-cta btn-sm" onClick={closeMenu}>
                  Apply for Financing
                </Link>
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
