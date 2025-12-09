import React from 'react';

const TechSecurity = () => {
  return (
    <div className="container section">
      <h1 className="text-center text-primary mb-xl">Architecture & Security</h1>
      
      <div className="max-w-3xl mx-auto mb-xl">
        <div className="bg-black text-green-400 p-lg rounded-lg font-mono text-sm mb-lg overflow-x-auto">
          <pre>{`
Frontend (React)
     ↓
Mock API Layer (local JSON)
     ↓
Amana Engine (credit + sharia + fraud)
     ↓
Ledger + Settlement
          `}</pre>
        </div>

        <div className="grid gap-md">
          <div className="bg-white p-md rounded border border-gray-200">
            <h3 className="font-bold mb-xs">Psychometric Scoring</h3>
            <p className="text-sm text-muted">Behavioral data analysis to assess willingness to repay.</p>
          </div>
          <div className="bg-white p-md rounded border border-gray-200">
            <h3 className="font-bold mb-xs">Social Guarantor</h3>
            <p className="text-sm text-muted">Community-based trust network for verification.</p>
          </div>
          <div className="bg-white p-md rounded border border-gray-200">
            <h3 className="font-bold mb-xs">Trinity Verification</h3>
            <p className="text-sm text-muted">Identity, Location, and Business validation.</p>
          </div>
          <div className="bg-white p-md rounded border border-gray-200">
            <h3 className="font-bold mb-xs">Repayment Engine</h3>
            <p className="text-sm text-muted">Automated collection and reconciliation system.</p>
          </div>
          <div className="bg-white p-md rounded border border-gray-200">
            <h3 className="font-bold mb-xs">Vendor Payout</h3>
            <p className="text-sm text-muted">Direct settlement to vendor to prevent diversion of funds.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechSecurity;
