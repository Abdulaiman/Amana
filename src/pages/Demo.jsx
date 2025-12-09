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
import { Smartphone, Store, RefreshCw } from 'lucide-react';

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
    // Optional: Auto-switch back or let user do it. Let's let user do it for clarity.
    // setViewMode('retailer'); 
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
          <div className="flex flex-col items-center justify-center h-full text-center p-md">
            <div className="text-4xl mb-md animate-pulse">⏳</div>
            <h3 className="text-primary mb-sm">Waiting for Vendor</h3>
            <p className="text-muted text-sm">Alhaji Dankoli is reviewing your request...</p>
            <div className="mt-lg p-sm bg-yellow-900/20 border border-yellow-500/30 rounded text-xs text-yellow-500">
              Tip: Switch to <strong>Vendor Portal</strong> to confirm.
            </div>
          </div>
        );
      case 'goods_received':
        return <RetailerGoodsReceived onConfirm={confirmGoods} />;
      case 'repay':
        return <RetailerRepayment contract={state.contract} onRepay={makeRepayment} />;
      case 'done':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-md">
            <Confetti />
            <div className="text-6xl mb-md animate-bounce">🎉</div>
            <h3 className="text-primary mb-sm">Cycle Complete!</h3>
            <p className="text-muted mb-lg text-sm">Repayment successful. Your Amana Score has increased.</p>
            <Button onClick={resetDemo} variant="primary" className="glow-primary">Start New Cycle</Button>
          </div>
        );
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="container section flex flex-col items-center">
      <div className="mb-xl text-center max-w-2xl">
        <h1 className="text-primary mb-sm">Live Demo</h1>
        <p className="text-muted">Experience the full Murabaha cycle. Switch between the Retailer App and Vendor Portal to see both sides of the transaction.</p>
      </div>

      {/* View Toggle */}
      <div className="glass-panel p-1 rounded-full mb-lg flex relative z-10">
        <button 
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${viewMode === 'retailer' ? 'bg-primary text-slate-900 shadow-[0_0_15px_rgba(45,212,191,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          onClick={() => setViewMode('retailer')}
        >
          <Smartphone size={16} /> Retailer App
        </button>
        <button 
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${viewMode === 'vendor' ? 'bg-accent text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          onClick={() => setViewMode('vendor')}
        >
          <Store size={16} /> Vendor Portal
        </button>
      </div>

      {/* Phone Frame */}
      <div className="relative mb-xl">
        <div className="absolute inset-0 bg-teal-500/10 blur-3xl rounded-full transform scale-75 pointer-events-none"></div>
        <PhoneFrame>
          {renderScreen()}
        </PhoneFrame>
      </div>

      {/* Reset Control */}
      <Button size="sm" variant="outline" onClick={resetDemo} className="opacity-50 hover:opacity-100 transition-opacity">
        <RefreshCw size={14} className="mr-2" /> Reset Simulation
      </Button>
    </div>
  );
};

export default Demo;
