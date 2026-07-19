import React from 'react';
import PhoneFrame from './PhoneFrame';
import { Smartphone, Download, ShieldCheck, Zap, Bell, Landmark, ShoppingCart, CheckCircle, Clock } from 'lucide-react';
import './AppPromo.css';

const AppPromo = () => {
  return (
    <section id="download-app" className="app-promo">
      <div className="app-promo-container">
        <div className="app-promo-visual">
          <PhoneFrame>
            <div className="mock-app-screen">
              <div className="mock-header">
                <div className="mock-user-info">
                  <div className="mock-avatar">AA</div>
                  <div>
                    <div className="mock-user-name">Alhaji Aminu</div>
                    <div className="mock-user-role">Kano Trader</div>
                  </div>
                </div>
                <div className="mock-notification-btn">
                  <Bell size={14} />
                </div>
              </div>

              <div className="mock-balance-card">
                <div className="card-top">
                  <small>Available Murabaha Limit</small>
                  <Landmark size={14} className="card-icon" />
                </div>
                <h2>₦850,000</h2>
                <div className="mock-progress-container">
                  <div className="mock-progress-bar" style={{ width: '85%' }}></div>
                </div>
                <div className="card-bottom">
                  <span>Total Limit: ₦1,000,000</span>
                </div>
              </div>

              <div className="mock-quick-actions">
                <div className="mock-action-card">
                  <span className="action-num">2</span>
                  <span className="action-label">Active Orders</span>
                </div>
                <div className="mock-action-card">
                  <span className="action-num text-success">₦45,000</span>
                  <span className="action-label">Payment Due Jul 25</span>
                </div>
              </div>

              <div className="mock-section-title">Recent Orders</div>

              <div className="mock-list">
                <div className="mock-list-item">
                  <div className="mock-item-icon bg-brand-subtle text-brand">
                    <ShoppingCart size={14} />
                  </div>
                  <div className="mock-item-details">
                    <div className="mock-item-name">Dangote Sugar (50 Bags)</div>
                    <div className="mock-item-time">Fulfillment in progress</div>
                  </div>
                  <div className="mock-item-status status-pending">Active</div>
                </div>
                <div className="mock-list-item">
                  <div className="mock-item-icon bg-brand-subtle text-brand">
                    <CheckCircle size={14} />
                  </div>
                  <div className="mock-item-details">
                    <div className="mock-item-name">Golden Penny Flour</div>
                    <div className="mock-item-time">Delivered on July 18</div>
                  </div>
                  <div className="mock-item-status status-paid">Paid</div>
                </div>
                <div className="mock-list-item">
                  <div className="mock-item-icon bg-warning-subtle text-warning">
                    <Clock size={14} />
                  </div>
                  <div className="mock-item-details">
                    <div className="mock-item-name">Vegetable Oil (20 Jerr...)</div>
                    <div className="mock-item-time">Awaiting verification</div>
                  </div>
                  <div className="mock-item-status status-awaiting">Awaiting</div>
                </div>
              </div>
            </div>
          </PhoneFrame>
        </div>

        <div className="app-promo-content">
          <div className="badge-pill">Mobile App</div>
          <h2>Take Your Stall <span className="text-brand">Everywhere</span></h2>
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
            <a href="https://drive.google.com/uc?export=download&id=1Yqz9jshwEwVvSSpPSKDOWBOSBKV1pUW2" className="btn btn-primary">
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
