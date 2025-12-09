import { MOCK_RETAILER, MOCK_VENDOR, MOCK_CONTRACT } from '../data/mockData';
import { seedTransaction } from './ledger';

const DELAY = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getRetailer = async () => {
  await DELAY(300);
  return { ...MOCK_RETAILER };
};

export const getVendor = async () => {
  await DELAY(300);
  return { ...MOCK_VENDOR };
};

export const createContract = async ({ cost, markup }) => {
  await DELAY(500);
  return {
    ...MOCK_CONTRACT,
    cost,
    markup,
    total: cost + markup,
    status: 'draft'
  };
};

export const confirmByVendor = async (contractId, scenario) => {
  await DELAY(700);
  
  if (scenario === 'Vendor Price Inflation') {
    throw new Error('Price update blocked — Exceeds market benchmark.');
  }
  if (scenario === 'GPS Mismatch') {
    throw new Error('Request blocked — Location mismatch. Contact support.');
  }

  // Success case
  seedTransaction({
    type: 'vendor_payout',
    amount: MOCK_CONTRACT.cost,
    description: `Payout for Contract ${contractId}`,
    status: 'completed'
  });

  return { success: true };
};

export const recordGoodsReceived = async (contractId) => {
  await DELAY(300);
  // In a real app, we'd update the contract status here
  return { success: true, status: 'active' };
};

export const repay = async (contractId, scenario) => {
  await DELAY(500);
  
  let amount = MOCK_CONTRACT.total;
  let status = 'completed';
  let description = `Repayment for Contract ${contractId}`;
  let newScore = MOCK_RETAILER.amanaScore + 5;

  if (scenario === 'Partial Repayment') {
    amount = MOCK_CONTRACT.total / 2;
    status = 'partial';
    description = `Partial Repayment for Contract ${contractId}`;
    newScore = MOCK_RETAILER.amanaScore + 1; // Smaller score increase
  } else if (scenario === 'Late Repayment') {
    description = `Late Repayment for Contract ${contractId}`;
    newScore = MOCK_RETAILER.amanaScore - 2; // Score penalty
  }

  seedTransaction({
    type: 'repayment',
    amount: amount,
    description: description,
    status: status
  });

  return { 
    success: true, 
    newScore: newScore,
    partial: scenario === 'Partial Repayment'
  };
};

export const withdrawVendor = async (amount) => {
  await DELAY(1000);
  seedTransaction({
    type: 'withdrawal',
    amount: amount,
    description: 'Vendor Withdrawal to Bank',
    status: 'completed'
  });
  return { success: true };
};
