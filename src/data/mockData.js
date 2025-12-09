export const MOCK_RETAILER = {
  id: "ret-001",
  name: "Musa Ali",
  stall: "Stall 4, Farm Centre",
  amanaScore: 34,
  creditLimit: 20000,
  outstanding: 0,
  bvnMatched: true
};

export const MOCK_VENDOR = {
  id: "vend-001",
  name: "Alhaji Dankoli",
  bank: "Zenith Bank",
  account: "0123456789",
  walletBalance: 120000,
  prices: { screenGuard: 500, charger: 1000 }
};

export const MOCK_CONTRACT = {
  id: "ct-001",
  cost: 20000,
  markup: 1000,
  total: 21000,
  dueDays: 10,
  status: "draft" // draft, pending_vendor, active, completed
};
