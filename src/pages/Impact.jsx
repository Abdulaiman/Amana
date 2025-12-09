import React from 'react';

const Impact = () => {
  return (
    <div className="container section">
      <h1 className="text-center text-primary mb-xl">Pilot Impact Plan</h1>
      
      <div className="max-w-3xl mx-auto grid gap-lg">
        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-accent mb-md">Pilot Targets</h2>
          <div className="grid grid-cols-2 gap-md">
            <div>
              <div className="text-3xl font-bold text-primary">₦100k</div>
              <div className="text-muted text-sm">Initial Capital</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">&lt; 3%</div>
              <div className="text-muted text-sm">Target Default Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">6-8</div>
              <div className="text-muted text-sm">Cycles Planned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-muted text-sm">Sharia Compliant</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-primary mb-md">Data Collection Goals</h2>
          <ul className="list-disc pl-lg space-y-sm text-muted">
            <li>Repayment reliability vs. Amana Score</li>
            <li>Average cycle time (restock to repayment)</li>
            <li>SKU demand velocity</li>
            <li>Fraud attempt patterns (GPS/Price)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Impact;
