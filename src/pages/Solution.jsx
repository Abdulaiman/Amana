import React from 'react';
import ShariaNotice from '../components/ShariaNotice';

const Solution = () => {
  return (
    <div className="container section">
      <h1 className="text-center text-primary mb-xl">The Solution — Digital Murabaha</h1>
      
      <div className="max-w-3xl mx-auto bg-white p-xl rounded-lg shadow-md border border-gray-200">
        <p className="text-lg mb-lg">
          Amana introduces a software-only, Sharia-compliant Murabaha engine that provides:
        </p>
        
        <ul className="list-disc pl-xl mb-lg space-y-sm text-muted">
          <li>Credit in goods, not cash</li>
          <li>No interest</li>
          <li>Fixed markup known upfront</li>
          <li>Instant vendor payout</li>
          <li>Digital collateral instead of physical collateral</li>
        </ul>
        
        <p className="font-bold text-primary mb-lg">
          We solve both religious and financial exclusion at once.
        </p>

        <ShariaNotice />
      </div>
    </div>
  );
};

export default Solution;
