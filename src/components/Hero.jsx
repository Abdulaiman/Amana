import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, TrendingUp } from 'lucide-react';
import GooglePlayBadge from './GooglePlayBadge';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="badge-pill">
          <span className="badge-dot"></span>
          Now In Testing
        </div>
        <h1>
          Sharia-Compliant <br />
          Inventory Financing
        </h1>
        <p className="hero-subhead">
          A software-only Murabaha engine enabling instant credit for informal retailers without Riba.
        </p>
        <div className="hero-actions">
          <Link to="/demo" className="btn btn-primary btn-lg">
            Launch Demo
          </Link>
          <GooglePlayBadge size="md" />
        </div>
      </div>

      <div className="hero-cards">
        <div className="benefit-card">
          <div className="icon-box">
            <ShieldCheck size={24} />
          </div>
          <h3>Halal Credit</h3>
          <p>Fixed markup Murabaha, 100% Sharia compliant with no interest.</p>
        </div>
        <div className="benefit-card">
          <div className="icon-box">
            <Zap size={24} />
          </div>
          <h3>Fast Restock</h3>
          <p>Finance goods instantly and restock your stall the same day.</p>
        </div>
        <div className="benefit-card">
          <div className="icon-box">
            <TrendingUp size={24} />
          </div>
          <h3>Trusted Risk Engine</h3>
          <p>Digital and social collateral replace physical collateral.</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
