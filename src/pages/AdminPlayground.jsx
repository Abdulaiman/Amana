import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { getLedger, clearLedger } from '../mock/ledger';
import { setScenario, resetDemo } from '../demoState';

const AdminPlayground = () => {
  const [ledger, setLedger] = useState([]);
  const [autoConfirm, setAutoConfirm] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLedger(getLedger());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container section">
      <h1 className="text-center text-primary mb-xl">Admin Playground</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold mb-md">System Controls</h2>
          
          <div className="flex flex-col gap-md">
            <div className="flex items-center justify-between p-sm bg-soft rounded">
              <span>Vendor Auto-Confirm</span>
              <Button 
                size="sm" 
                variant={autoConfirm ? "success" : "outline"}
                onClick={() => setAutoConfirm(!autoConfirm)}
              >
                {autoConfirm ? "ON" : "OFF"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-sm bg-soft rounded">
              <span>Reset Demo State</span>
              <Button size="sm" variant="danger" onClick={resetDemo}>Reset</Button>
            </div>

            <div className="flex items-center justify-between p-sm bg-soft rounded">
              <span>Clear Ledger</span>
              <Button size="sm" variant="danger" onClick={clearLedger}>Clear</Button>
            </div>
          </div>
        </div>

        <div className="bg-white p-lg rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold mb-md">Ledger ({ledger.length})</h2>
          <div className="h-64 overflow-y-auto border border-gray-200 rounded p-sm bg-soft font-mono text-xs">
            {ledger.length === 0 ? (
              <div className="text-muted text-center mt-lg">No transactions yet</div>
            ) : (
              ledger.map((tx) => (
                <div key={tx.id} className="mb-sm pb-sm border-b border-gray-300 last:border-0">
                  <div className="flex justify-between text-primary font-bold">
                    <span>{tx.type.toUpperCase()}</span>
                    <span>₦{tx.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-muted">{tx.description}</div>
                  <div className="text-gray-400 text-[10px]">{tx.timestamp}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPlayground;
