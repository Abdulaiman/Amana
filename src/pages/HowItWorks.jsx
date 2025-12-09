import React from 'react';

const HowItWorks = () => {
  return (
    <div className="container section">
      <h1 className="text-center text-primary mb-xl">How It Works</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
        <div className="bg-white p-lg rounded-lg shadow-sm">
          <h2 className="text-accent mb-md">Retailer Flow</h2>
          <ol className="list-decimal pl-lg space-y-sm text-muted">
            <li>Retailer requests inventory (e.g., ₦20,000).</li>
            <li>Amana generates a Murabaha offer (Cost + Markup).</li>
            <li>Retailer accepts the offer.</li>
            <li>Amana pays the Vendor directly.</li>
            <li>Retailer collects goods from Vendor.</li>
            <li>Retailer sells goods and repays Amana later.</li>
          </ol>
        </div>

        <div className="bg-white p-lg rounded-lg shadow-sm">
          <h2 className="text-primary mb-md">Vendor Flow</h2>
          <ol className="list-decimal pl-lg space-y-sm text-muted">
            <li>Vendor receives order notification.</li>
            <li>Vendor confirms stock availability.</li>
            <li>Amana instantly credits Vendor's wallet.</li>
            <li>Vendor hands over goods to Retailer.</li>
            <li>Vendor withdraws funds to bank account.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
