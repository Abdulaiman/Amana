import React from 'react';

const Team = () => {
  return (
    <div className="container section">
      <h1 className="text-center text-primary mb-xl">Our Team</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg max-w-4xl mx-auto">
        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-md"></div>
          <h3 className="font-bold text-lg">Mahmud Nasir Rabiu</h3>
          <p className="text-accent font-medium">Co-Founder</p>
        </div>

        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-md"></div>
          <h3 className="font-bold text-lg">Abdulazeez rabiu</h3>
          <p className="text-accent font-medium">Co-Founder</p>
        </div>

        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-md"></div>
          <h3 className="font-bold text-lg">Ismail Mahadi</h3>
          <p className="text-accent font-medium">Co-founder</p>
        </div>
        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-md"></div>
          <h3 className="font-bold text-lg">Muhammad Sani Auwal</h3>
          <p className="text-accent font-medium">Co-founder</p>
        </div>
      </div>
    </div>
  );
};

export default Team;
