import React from 'react';
import Button from './Button';
// import { CheckCircle } from 'lucide-react'; // Removed missing dependency

const RetailerGoodsReceived = ({ onConfirm }) => {
  return (
    <div className="flex flex-col h-full p-md gap-lg items-center justify-center text-center">
      <div className="text-6xl mb-md">📦</div>
      <h3 className="text-primary">Vendor Paid!</h3>
      <p className="text-muted">
        Alhaji Dankoli has received ₦20,000.
        Please collect your goods now.
      </p>

      <div className="w-full mt-auto">
        <Button variant="success" className="btn-block" onClick={onConfirm}>
          Mark as Received
        </Button>
      </div>
    </div>
  );
};

export default RetailerGoodsReceived;
