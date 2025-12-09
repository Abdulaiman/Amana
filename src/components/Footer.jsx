import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>Amana</h3>
          <p>Sharia-Compliant Inventory Financing</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Product</h4>
            <Link to="/problem">Problem</Link>
            <Link to="/solution">Solution</Link>
            <Link to="/how-it-works">How It Works</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/team">Team</Link>
            <Link to="/impact">Impact</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <Link to="/faq">FAQ</Link>
            <Link to="/tech-and-security">Security</Link>
            <Link to="/admin-playground">Admin</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Amana. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
