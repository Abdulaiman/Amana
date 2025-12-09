import React from 'react';

const ShariaNotice = () => {
  return (
    <div className="bg-green-50 border border-green-100 p-sm rounded-md text-xs text-green-800 flex gap-sm items-start">
      <span className="text-lg">☪️</span>
      <p>
        <strong>Sharia Compliant:</strong> This is a Murabaha transaction (cost-plus sale). 
        The markup is fixed and agreed upon instantly. No interest (Riba) is charged.
      </p>
    </div>
  );
};

export default ShariaNotice;
