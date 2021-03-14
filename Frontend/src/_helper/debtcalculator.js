export function calculateDebt(userId, transactions) {
  const oweAmount = transactions.filter((txn) => txn.to.map((u) => u.email).includes(userId)).map((txn) => txn.amount / (txn.to.length + 1)).reduce(((total, amount) => amount + total));
  const paidAmount = transactions.filter((txn) => txn.from.email === userId).map((txn) => txn.amount * (txn.to.length / (txn.to.length + 1))).reduce(((total, amount) => amount + total));
  const totalAmount = paidAmount - oweAmount;

  return JSON.parse(JSON.stringify({ oweAmount, paidAmount, totalAmount }));
}