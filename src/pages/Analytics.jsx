import React from 'react';
import Chart from '../components/Chart';

const Analytics = () => {
  return (
    <div className="container section">
      <div className="mb-xl text-center">
        <h1 className="text-primary">Pilot Analytics</h1>
        <p className="text-muted">Live performance metrics from the Kano pilot.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200">
          <h3 className="mb-md font-bold text-gray-700">Financed Volume (Weekly)</h3>
          <Chart type="line" data={[10, 25, 45, 30, 60, 85, 100]} width={300} height={200} />
        </div>

        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200">
          <h3 className="mb-md font-bold text-gray-700">Top SKU Categories</h3>
          <Chart type="bar" data={[80, 55, 30, 20]} width={300} height={200} />
          <div className="flex justify-between text-xs text-muted mt-sm px-sm">
            <span>Phones</span>
            <span>Chargers</span>
            <span>Cases</span>
            <span>Audio</span>
          </div>
        </div>

        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200">
          <h3 className="mb-md font-bold text-gray-700">Repayment Rate</h3>
          <div className="flex justify-center">
            <Chart type="donut" data={[95, 3, 2]} width={200} height={200} />
          </div>
          <div className="flex justify-center gap-md mt-md text-xs">
            <span className="flex items-center gap-xs"><span className="w-2 h-2 bg-[#0B5B5B] rounded-full"></span> On Time</span>
            <span className="flex items-center gap-xs"><span className="w-2 h-2 bg-[#D4A247] rounded-full"></span> Late</span>
            <span className="flex items-center gap-xs"><span className="w-2 h-2 bg-gray-300 rounded-full"></span> Default</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
