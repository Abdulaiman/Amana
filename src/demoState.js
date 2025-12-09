import { createContract, confirmByVendor, recordGoodsReceived, repay } from './mock/api';

// Simple event bus for demo state
let listeners = [];
let state = {
  step: 'idle', // idle, request, contract, vendor_wait, goods_received, repay, done
  scenario: 'Normal Flow',
  retailer: null,
  vendor: null,
  contract: null,
  logs: []
};

const notify = () => listeners.forEach(l => l({ ...state }));

export const subscribe = (listener) => {
  listeners.push(listener);
  listener(state);
  return () => listeners = listeners.filter(l => l !== listener);
};

export const setScenario = (scenario) => {
  state.scenario = scenario;
  log('System', `Scenario set to: ${scenario}`);
  notify();
};

export const log = (source, message, data = null) => {
  const entry = {
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    source,
    message,
    data
  };
  state.logs = [entry, ...state.logs];
  notify();
};

export const resetDemo = () => {
  state.step = 'idle';
  state.contract = null;
  state.logs = [];
  log('System', 'Demo reset');
  notify();
};

// Actions
export const startRequest = () => {
  state.step = 'request';
  log('Retailer', 'Started inventory request');
  notify();
};

export const generateContract = async () => {
  try {
    log('System', 'Generating Murabaha contract...');
    const contract = await createContract({ cost: 20000, markup: 1000 });
    state.contract = contract;
    state.step = 'contract';
    log('API', 'Contract created', contract);
    notify();
  } catch (err) {
    log('Error', err.message);
  }
};

export const submitToVendor = async () => {
  state.step = 'vendor_wait';
  log('Retailer', 'Signed contract. Waiting for vendor...');
  notify();
  
  // Auto-confirm if not in manual mode (simplified for now, can be toggled)
  // For now, we'll simulate the vendor action being triggered manually or auto
  // Let's assume the demo page has a button to "Simulate Vendor Action" or it happens automatically
  // The prompt says "Vendor demo page must show... Approve/Reject buttons".
  // So maybe we don't auto-confirm here. We just wait.
  // But for the single-page demo flow, we might want a trigger.
  // Let's leave it in 'vendor_wait' and let the UI trigger the next step.
};

export const vendorConfirm = async () => {
  try {
    log('Vendor', 'Attempting confirmation...');
    await confirmByVendor(state.contract.id, state.scenario);
    state.step = 'goods_received';
    log('API', 'Vendor confirmed. Payout released.');
    notify();
    return true;
  } catch (err) {
    log('Error', err.message);
    notify(); // Update logs
    return false;
  }
};

export const confirmGoods = async () => {
  try {
    await recordGoodsReceived(state.contract.id);
    state.step = 'repay';
    log('Retailer', 'Goods received. Contract active.');
    notify();
  } catch (err) {
    log('Error', err.message);
  }
};

export const makeRepayment = async () => {
  try {
    const res = await repay(state.contract.id, state.scenario);
    state.step = 'done';
    log('API', 'Repayment successful. Score updated.', res);
    notify();
    return true;
  } catch (err) {
    log('Error', err.message);
    return false;
  }
};
