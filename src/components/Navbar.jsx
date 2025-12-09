import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <ShieldCheck className="logo-icon" size={28} />
          <span>Amana</span>
        </Link>
        
        <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
          <Link to="/problem" className={`nav-link ${isActive('/problem')}`}>Problem</Link>
          <Link to="/solution" className={`nav-link ${isActive('/solution')}`}>Solution</Link>
          <Link to="/how-it-works" className={`nav-link ${isActive('/how-it-works')}`}>How It Works</Link>
          <Link to="/demo" className={`nav-link ${isActive('/demo')}`}>Demo</Link>
          <Link to="/team" className={`nav-link ${isActive('/team')}`}>Team</Link>
          <Link to="/contact" className="btn btn-primary btn-sm glow-effect">Contact</Link>
        </div>

        <button className="navbar-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
