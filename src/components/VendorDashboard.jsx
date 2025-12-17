import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import './VendorDashboard.css';
import { withdrawVendor } from '../mock/api';
import { Wallet, ArrowDownLeft, Check, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const VendorDashboard = ({ vendor, incomingRequest, onConfirmRequest, isMobile = false }) => {
  const [withdrawing, setWithdrawing] = useState(false);
  const [localBalance, setLocalBalance] = useState(vendor?.walletBalance || 0);

  const { addToast } = useToast();

  const handleWithdraw = async () => {
    setWithdrawing(true);
    await withdrawVendor(localBalance);
    setLocalBalance(0);
    setWithdrawing(false);
    addToast('Withdrawal successful!', 'success');
  };

  if (!vendor) return <div className="p-md text-center text-muted">Loading vendor...</div>;

  return (
    <div className={`vendor-dashboard ${isMobile ? 'mobile-view' : ''}`}>
      <div className="vendor-header">
        {!isMobile && <h2>Vendor Portal</h2>}
        <div className="vendor-profile">
          <div className="avatar">{vendor.name.charAt(0)}</div>
          <div>
            <div className="font-bold text-white">{vendor.name}</div>
            <div className="text-xs text-muted">{vendor.bank} •••• {vendor.account.slice(-4)}</div>
          </div>
        </div>
      </div>

      <div className={`dashboard-grid ${isMobile ? 'flex flex-col gap-md' : ''}`}>
        <Card className="balance-card">
          <div className="flex items-center gap-sm mb-sm text-primary text-sm uppercase font-bold">
            <Wallet size={16} /> Wallet Balance
          </div>
          <div className="balance-amount text-white">₦{localBalance.toLocaleString()}</div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleWithdraw}
            disabled={localBalance === 0 || withdrawing}
            className="w-full mt-sm"
          >
            <ArrowDownLeft size={16} className="mr-2" />
            {withdrawing ? 'Processing...' : 'Withdraw to Bank'}
          </Button>
        </Card>

        <Card title="Incoming Requests" className="requests-card">
          {incomingRequest ? (
            <div className="request-item">
              <div className="request-details">
                <div className="flex justify-between items-start mb-xs">
                  <div className="font-bold text-white">Order #{incomingRequest.id}</div>
                  <div className="text-primary font-bold">₦{incomingRequest.cost.toLocaleString()}</div>
                </div>
                <div className="text-xs text-muted mb-md">20x Screen Guard, 10x Charger</div>
              </div>
              <div className="request-actions grid grid-cols-2 gap-sm">
                <Button variant="primary" size="sm" onClick={onConfirmRequest} className="glow-primary">
                  <Check size={16} className="mr-1" /> Confirm
                </Button>
                <Button variant="danger" size="sm">
                  <X size={16} className="mr-1" /> Reject
                </Button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="text-muted text-sm">No pending requests</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;
