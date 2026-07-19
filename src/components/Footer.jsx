import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();

  const handleNavClick = (e, targetId) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer islamic-pattern">
      <div className="footer-container">
        <div className="footer-brand">
          <h3 className="serif-logo-footer">AMANA</h3>
          <p className="footer-tagline">Sharia-compliant trade financing for Nigeria's traders</p>
          <p className="footer-cac">CAC Registered</p>
        </div>
        
        <div className="footer-col">
          <h4>Navigation</h4>
          <a href="/#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')}>How It Works</a>
          <a href="/#about" onClick={(e) => handleNavClick(e, 'about')}>About</a>
          <a href="/#faq" onClick={(e) => handleNavClick(e, 'faq')}>FAQ</a>
        </div>

        <div className="footer-col" id="contact">
          <h4>Contact</h4>
          <a href="mailto:service.amanafinance@gmail.com" className="email-link">service.amanafinance@gmail.com</a>
        </div>

        <div className="footer-col">
          <h4>Legal</h4>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AMANA. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/terms">Terms and Conditions</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
