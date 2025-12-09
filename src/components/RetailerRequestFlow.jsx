import React, { useState, useEffect } from 'react';
import Button from './Button';
import Loader from './Loader';

const RetailerRequestFlow = ({ onNext }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-md">
        <Loader size="lg" />
        <p className="text-muted">Verifying location & stock...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-md gap-lg">
      <div>
        <h3 className="text-primary mb-sm">Select Items</h3>
        <p className="text-muted text-sm">Choose items to restock from Alhaji Dankoli.</p>
      </div>

      <div className="flex-1">
        <div className="item-row flex justify-between items-center p-sm border-b">
          <div>
            <div className="font-bold">Screen Guard (x20)</div>
            <div className="text-sm text-muted">₦500/unit</div>
          </div>
          <div className="font-bold">₦10,000</div>
        </div>
        <div className="item-row flex justify-between items-center p-sm border-b">
          <div>
            <div className="font-bold">USB Charger (x10)</div>
            <div className="text-sm text-muted">₦1,000/unit</div>
          </div>
          <div className="font-bold">₦10,000</div>
        </div>
        <div className="flex justify-between items-center p-sm mt-md bg-soft rounded">
          <div className="font-bold">Total Cost</div>
          <div className="font-bold text-lg">₦20,000</div>
        </div>
      </div>

      <Button variant="primary" className="btn-block" onClick={onNext}>
        Generate Contract
      </Button>
    </div>
  );
};

export default RetailerRequestFlow;
