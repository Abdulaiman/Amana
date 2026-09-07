import React from 'react';

const FAQ = () => {
  return (
    <div className="container section">
      <h1 className="text-center text-primary mb-xl">Frequently Asked Questions</h1>
      
      <div className="max-w-2xl mx-auto space-y-md">
        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-primary mb-xs">Q: How does this financing work?</h3>
          <p className="text-muted">A: It is 100% Halal Murabaha (cost-plus inventory sale). Amana purchases the inventory you request and sells it to you at an agreed, transparent profit margin.</p>
        </div>

        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-primary mb-xs">Q: Is there interest?</h3>
          <p className="text-muted">A: No. Only a fixed markup agreed upfront.</p>
        </div>

        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-primary mb-xs">Q: Do I need collateral?</h3>
          <p className="text-muted">A: No. We use digital and social trust.</p>
        </div>

        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-primary mb-xs">Q: What if someone defaults?</h3>
          <p className="text-muted">A: Their BVN is flagged and Amana Score resets in this demo.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
