import React from 'react';
import Button from './Button';
import Card from './Card';
import ShariaNotice from './ShariaNotice';

const RetailerContract = ({ contract, onSign }) => {
  if (!contract) return null;

  return (
    <div className="flex flex-col h-full p-md gap-md overflow-y-auto">
      <h3 className="text-primary text-center">Murabaha Offer</h3>
      
      <Card className="bg-soft">
        <div className="flex justify-between mb-sm">
          <span className="text-muted">Cost of Goods</span>
          <span className="font-bold">₦{contract.cost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-sm">
          <span className="text-muted">Profit Markup (Fixed)</span>
          <span className="font-bold text-accent">+ ₦{contract.markup.toLocaleString()}</span>
        </div>
        <div className="border-t border-gray-300 my-sm"></div>
        <div className="flex justify-between text-lg">
          <span className="font-bold">Total Repayment</span>
          <span className="font-bold text-primary">₦{contract.total.toLocaleString()}</span>
        </div>
      </Card>

      <div className="text-sm text-muted text-center">
        Due in {contract.dueDays} days
      </div>

      <ShariaNotice />

      <div className="mt-auto">
        <Button variant="primary" className="btn-block" onClick={onSign}>
          Accept Murabaha Terms
        </Button>
      </div>
    </div>
  );
};

export default RetailerContract;
