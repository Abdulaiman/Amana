import React, { useState, useEffect } from 'react';
import VendorDashboard from '../components/VendorDashboard';
import { getVendor } from '../mock/api';
import { subscribe, vendorConfirm } from '../demoState';

const VendorDemo = () => {
  const [vendor, setVendor] = useState(null);
  const [demoState, setDemoState] = useState({ step: 'idle', contract: null });

  useEffect(() => {
    getVendor().then(setVendor);
    const unsub = subscribe(setDemoState);
    return unsub;
  }, []);

  const handleConfirm = async () => {
    await vendorConfirm();
    // In a real app, we'd refresh the vendor data here to show balance update
    // For this demo, we might need a way to signal the dashboard to update or just rely on local state
  };

  const incomingRequest = demoState.step === 'vendor_wait' ? demoState.contract : null;

  return (
    <div className="container section">
      <div className="mb-xl text-center">
        <h1 className="text-primary">Vendor Dashboard</h1>
        <p className="text-muted">Manage incoming orders and withdrawals.</p>
      </div>

      <VendorDashboard 
        vendor={vendor} 
        incomingRequest={incomingRequest}
        onConfirmRequest={handleConfirm}
      />
    </div>
  );
};

export default VendorDemo;
