import React from 'react';
import PhoneFrame from './PhoneFrame';
import { Smartphone, Download, ShieldCheck, Zap } from 'lucide-react';
import './AppPromo.css';

const AppPromo = () => {
  return (
    <section id="download-app" className="app-promo">
      <div className="app-promo-container">
        <div className="app-promo-visual">
          <PhoneFrame>
            <div className="mock-app-screen">
              <div className="mock-header">
                <div className="mock-user-icon"></div>
                <div className="mock-logo-text">Amana</div>
              </div>
              <div className="mock-balance-card">
                <small>Available Credit</small>
                <h2>₦850,000</h2>
                <div className="mock-progress"></div>
              </div>
              <div className="mock-stats">
                <div className="mock-stat"></div>
                <div className="mock-stat"></div>
              </div>
              <div className="mock-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="mock-list-item">
                     <div className="mock-item-icon"></div>
                     <div className="mock-item-text"></div>
                  </div>
                ))}
              </div>
            </div>
          </PhoneFrame>
        </div>
        
        <div className="app-promo-content">
          <div className="badge-pill">Mobile App</div>
          <h2>Take Your Stall <br/><span className="text-gradient">Everywhere</span></h2>
          <p>
            Download the Amana mobile app to manage your inventory financing, 
            request restocks, and track your repayments on the go.
          </p>
          
          <div className="app-features-list">
            <div className="app-feature-item">
               <ShieldCheck size={20} className="feature-icon" />
               <span>Instant Credit Approvals</span>
            </div>
            <div className="app-feature-item">
               <Zap size={20} className="feature-icon" />
               <span>One-Tap Restock Requests</span>
            </div>
          </div>

          <div className="app-download-actions">
            <a href="/builds/amana-latest.apk" className="btn btn-primary btn-lg glow-primary d-flex align-items-center gap-2">
              <Download size={20} />
              <span>Download for Android</span>
            </a>
            <p className="download-hint">Supports Android 8.0 and above</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPromo;
