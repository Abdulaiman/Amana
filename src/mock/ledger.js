let transactions = [];

export const getLedger = () => {
  return [...transactions];
};

export const seedTransaction = (tx) => {
  transactions.push({
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...tx
  });
};

export const clearLedger = () => {
  transactions = [];
};
