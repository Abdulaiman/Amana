import React from 'react';
import Card from './Card';
import Button from './Button';
import './RetailerDashboard.css';
import { CreditCard, TrendingUp, ShoppingBag } from 'lucide-react';

const RetailerDashboard = ({ retailer, onStartRequest }) => {
  if (!retailer) return null;

  return (
    <div className="retailer-dashboard">
      <div className="dashboard-header">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-white">Salam, {retailer.name.split(' ')[0]}</h2>
            <p className="stall-info">{retailer.stall}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
            {retailer.name.charAt(0)}
          </div>
        </div>
      </div>

      <div className="credit-card-visual">
        <div className="card-chip"></div>
        <div className="card-logo" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             <img src="/logo.png" alt="Amana" style={{ height: '16px', width: '16px' }} />
             <span>AMANA</span>
        </div>
        <div className="credit-info">
          <span className="label">Available Limit</span>
          <span className="value">₦{retailer.creditLimit.toLocaleString()}</span>
        </div>
        <div className="card-footer">
          <div className="score-badge">
            <span className="score-label">Score</span>
            <span className="score-value">{retailer.amanaScore}</span>
          </div>
          <div className="card-number">•••• 4242</div>
        </div>
      </div>

      <div className="action-area">
        <Button variant="primary" className="btn-block glow-primary" onClick={onStartRequest}>
          <ShoppingBag size={18} className="mr-2" />
          Request Inventory
        </Button>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="empty-state">
          <TrendingUp size={24} className="mb-2 opacity-50" />
          No recent transactions
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;
