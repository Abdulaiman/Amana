import React from 'react';
import Button from './Button';
import Card from './Card';

const RetailerRepayment = ({ contract, onRepay }) => {
  return (
    <div className="flex flex-col h-full p-md gap-lg">
      <div className="text-center">
        <h3 className="text-primary mb-xs">Repayment Due</h3>
        <p className="text-muted text-sm">Contract #{contract?.id}</p>
      </div>

      <Card className="text-center py-lg">
        <div className="text-muted mb-sm">Outstanding Amount</div>
        <div className="text-3xl font-bold text-primary">
          ₦{contract?.total.toLocaleString()}
        </div>
      </Card>

      <div className="mt-auto">
        <Button variant="primary" className="btn-block" onClick={onRepay}>
          Repay ₦{contract?.total.toLocaleString()}
        </Button>
        <p className="text-center text-xs text-muted mt-sm">
          Repaying early increases your Amana Score.
        </p>
      </div>
    </div>
  );
};

export default RetailerRepayment;
