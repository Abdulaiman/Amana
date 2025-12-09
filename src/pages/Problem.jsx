import React from 'react';

const Problem = () => {
  return (
    <div className="container section">
      <h1 className="text-center text-primary mb-xl">The Problem</h1>
      
      <div className="flex flex-col gap-lg max-w-3xl mx-auto">
        <div className="p-lg bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-danger mb-sm">1. The Riba Barrier</h3>
          <p className="text-muted">
            Most traders refuse conventional loans because they involve interest (Riba), 
            which is forbidden in Islam. This locks millions of honest, high-performing 
            traders out of formal credit.
          </p>
        </div>

        <div className="p-lg bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-danger mb-sm">2. The Stock-Out Trap</h3>
          <p className="text-muted">
            Retailers frequently run out of stock and lose 30–40% weekly revenue while 
            waiting to gather cash to restock. They don’t have a sales problem — they 
            have a capital timing problem.
          </p>
        </div>

        <div className="p-lg bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-danger mb-sm">3. The Informal Economy Blind Spot</h3>
          <p className="text-muted">
            Financial institutions lack visibility into informal traders, so they cannot 
            underwrite them. This creates a structural exclusion.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Problem;
