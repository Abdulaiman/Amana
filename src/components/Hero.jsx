import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, TrendingUp } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-glow-bg"></div>
      <div className="hero-content">
        <div className="badge-pill">
          <span className="badge-dot"></span>
          Now In Testing
        </div>
        <h1>
          Sharia-Compliant <br />
          <span className="text-gradient">Inventory Financing</span>
        </h1>
        <p className="hero-subhead">
          A software-only Murabaha engine enabling instant credit for informal retailers without Riba.
        </p>
        <div className="hero-actions">
          <Link to="/demo" className="btn btn-primary btn-lg glow-primary">
            Launch Demo
          </Link>
          <a href="https://drive.google.com/uc?export=download&id=1Yqz9jshwEwVvSSpPSKDOWBOSBKV1pUW2" className="btn btn-outline btn-lg">
            Download for Android
          </a>
        </div>
      </div>
      
      <div className="hero-cards">
        <div className="benefit-card glass-panel">
          <div className="icon-box">
            <ShieldCheck size={32} />
          </div>
          <h3>Halal Credit</h3>
          <p>Fixed markup Murabaha, 100% Sharia compliant with no interest.</p>
        </div>
        <div className="benefit-card glass-panel">
          <div className="icon-box accent">
            <Zap size={32} />
          </div>
          <h3>Fast Restock</h3>
          <p>Finance goods instantly and restock your stall the same day.</p>
        </div>
        <div className="benefit-card glass-panel">
          <div className="icon-box">
            <TrendingUp size={32} />
          </div>
          <h3>Trusted Risk Engine</h3>
          <p>Digital and social collateral replace physical collateral.</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
