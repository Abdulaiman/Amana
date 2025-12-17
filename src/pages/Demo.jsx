import React, { useState, useEffect } from 'react';
import PhoneFrame from '../components/PhoneFrame';
import RetailerDashboard from '../components/RetailerDashboard';
import RetailerRequestFlow from '../components/RetailerRequestFlow';
import RetailerContract from '../components/RetailerContract';
import RetailerGoodsReceived from '../components/RetailerGoodsReceived';
import RetailerRepayment from '../components/RetailerRepayment';
import VendorDashboard from '../components/VendorDashboard';
import Button from '../components/Button';
import Confetti from '../components/Confetti';
import { 
  subscribe, 
  resetDemo, 
  startRequest, 
  generateContract, 
  submitToVendor, 
  vendorConfirm, 
  confirmGoods, 
  makeRepayment 
} from '../demoState';
import { getRetailer, getVendor } from '../mock/api';
import { Smartphone, Store, RefreshCw, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import './Demo.css';

const Demo = () => {
  const [state, setState] = useState({ step: 'idle', logs: [], scenario: 'Normal Flow' });
  const [retailer, setRetailer] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [viewMode, setViewMode] = useState('retailer'); // 'retailer' or 'vendor'

  useEffect(() => {
    const unsub = subscribe(setState);
    getRetailer().then(setRetailer);
    getVendor().then(setVendor);
    return unsub;
  }, []);

  const handleVendorConfirm = async () => {
    await vendorConfirm();
  };

  const getStepIndicator = () => {
    const steps = [
      { key: 'idle', label: 'Dashboard', icon: '🏠' },
      { key: 'request', label: 'Request', icon: '📦' },
      { key: 'contract', label: 'Contract', icon: '📋' },
      { key: 'vendor_wait', label: 'Pending', icon: '⏳' },
      { key: 'goods_received', label: 'Delivered', icon: '✅' },
      { key: 'repay', label: 'Repay', icon: '💳' },
      { key: 'done', label: 'Complete', icon: '🎉' },
    ];
    const currentIndex = steps.findIndex(s => s.key === state.step);
    return { steps, currentIndex };
  };

  const renderScreen = () => {
    if (viewMode === 'vendor') {
      const incomingRequest = state.step === 'vendor_wait' ? state.contract : null;
      return (
        <VendorDashboard 
          vendor={vendor} 
          incomingRequest={incomingRequest}
          onConfirmRequest={handleVendorConfirm}
          isMobile={true}
        />
      );
    }

    switch (state.step) {
      case 'idle':
        return <RetailerDashboard retailer={retailer} onStartRequest={startRequest} />;
      case 'request':
        return <RetailerRequestFlow onNext={generateContract} />;
      case 'contract':
        return <RetailerContract contract={state.contract} onSign={submitToVendor} />;
      case 'vendor_wait':
        return (
          <div className="state-container">
            <div className="state-icon-wrapper">
              <div className="state-icon-bg"></div>
              <div className="state-icon-pulse"></div>
              <span className="state-icon">⏳</span>
            </div>
            <h3 className="state-title">Awaiting Vendor</h3>
            <p className="state-desc">Alhaji Dankoli is reviewing your request...</p>
            <div className="tip-card">
              <div className="tip-icon"><ArrowRight size={14} /></div>
              <div className="tip-text">
                <strong>Tip:</strong> Switch to <span className="highlight">Vendor Portal</span> to confirm the order
              </div>
            </div>
          </div>
        );
      case 'goods_received':
        return <RetailerGoodsReceived onConfirm={confirmGoods} />;
      case 'repay':
        return <RetailerRepayment contract={state.contract} onRepay={makeRepayment} />;
      case 'done':
        return (
          <div className="state-container state-done">
            <Confetti />
            <div className="success-burst"></div>
            <div className="state-icon-wrapper success">
              <span className="state-icon">🎉</span>
            </div>
            <h3 className="state-title success-title">Cycle Complete!</h3>
            <p className="state-desc">Repayment successful. Your Amana Score has increased.</p>
            <div className="success-stats">
              <div className="success-stat">
                <span className="stat-value">+15</span>
                <span className="stat-label">Score Points</span>
              </div>
              <div className="success-stat">
                <span className="stat-value">₦5K</span>
                <span className="stat-label">Limit Increase</span>
              </div>
            </div>
            <Button onClick={resetDemo} variant="primary" className="glow-primary restart-btn">
              <RefreshCw size={16} /> Start New Cycle
            </Button>
          </div>
        );
      default:
        return <div>Unknown Step</div>;
    }
  };

  const { steps, currentIndex } = getStepIndicator();

  return (
    <div className="demo-page">
      {/* Animated Background */}
      <div className="demo-bg">
        <div className="demo-bg-gradient"></div>
        <div className="demo-bg-grid"></div>
        <div className="demo-bg-orb demo-bg-orb-1"></div>
        <div className="demo-bg-orb demo-bg-orb-2"></div>
        <div className="demo-bg-orb demo-bg-orb-3"></div>
      </div>

      {/* Header Section */}
      <div className="demo-header">
        <div className="demo-badge">
          <Sparkles size={14} />
          <span>Interactive Demo</span>
        </div>
        <h1 className="demo-title">
          Experience <span className="text-gradient">Amana</span> in Action
        </h1>
        <p className="demo-subtitle">
          Walk through a complete Murabaha financing cycle. Switch between Retailer and Vendor views to see both sides of the transaction.
        </p>
      </div>

      {/* Feature Pills */}
      <div className="demo-features">
        <div className="feature-pill">
          <ShieldCheck size={14} />
          <span>100% Sharia Compliant</span>
        </div>
        <div className="feature-pill">
          <Zap size={14} />
          <span>Instant Processing</span>
        </div>
      </div>

      {/* View Toggle */}
      <div className="demo-toggle-container">
        <div className="demo-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'retailer' ? 'active retailer-active' : ''}`}
            onClick={() => setViewMode('retailer')}
          >
            <Smartphone size={18} />
            <span>Retailer App</span>
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'vendor' ? 'active vendor-active' : ''}`}
            onClick={() => setViewMode('vendor')}
          >
            <Store size={18} />
            <span>Vendor Portal</span>
          </button>
          <div className={`toggle-slider ${viewMode === 'vendor' ? 'vendor' : ''}`}></div>
        </div>
      </div>

      {/* Progress Indicator */}
      {viewMode === 'retailer' && (
        <div className="progress-container">
          <div className="progress-bar">
            {steps.slice(0, -1).map((step, index) => (
              <React.Fragment key={step.key}>
                <div className={`progress-step ${index <= currentIndex ? 'active' : ''} ${index === currentIndex ? 'current' : ''}`}>
                  <div className="step-dot">
                    <span className="step-icon">{step.icon}</span>
                  </div>
                  <span className="step-label">{step.label}</span>
                </div>
                {index < steps.length - 2 && (
                  <div className={`progress-line ${index < currentIndex ? 'filled' : ''}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Phone Frame */}
      <div className="demo-phone-container">
        <div className="phone-glow"></div>
        <div className="phone-reflection"></div>
        <PhoneFrame>
          {renderScreen()}
        </PhoneFrame>
      </div>

      {/* Reset Control */}
      <button className="reset-button" onClick={resetDemo}>
        <RefreshCw size={14} />
        <span>Reset Demo</span>
      </button>

      {/* Guide Card */}
      <div className="demo-guide">
        <h3>How It Works</h3>
        <div className="guide-steps">
          <div className="guide-step">
            <div className="guide-number">1</div>
            <div className="guide-content">
              <strong>Request Inventory</strong>
              <p>Retailer selects goods and submits request</p>
            </div>
          </div>
          <div className="guide-step">
            <div className="guide-number">2</div>
            <div className="guide-content">
              <strong>Vendor Confirms</strong>
              <p>Switch to Vendor Portal to approve the order</p>
            </div>
          </div>
          <div className="guide-step">
            <div className="guide-number">3</div>
            <div className="guide-content">
              <strong>Complete Repayment</strong>
              <p>Retailer receives goods and repays over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
