var _ = require('lodash');

export function calculateDebt(userId, transactions) {
  const oweAmount = _(transactions).filter((txn) => txn.to.map((u) => u.email).includes(userId)).map((txn) => ({ amount: txn.amount / (txn.to.length + 1) })).sumBy('amount');
  const paidAmount = _(transactions).filter((txn) => txn.from.email === userId).map((txn) => ({ amount: txn.amount * (txn.to.length / (txn.to.length + 1)) })).sumBy('amount');
  const totalAmount = paidAmount - oweAmount;

  console.log("Debts Total " + JSON.stringify(JSON.parse(JSON.stringify(calculateDebtPerFriend(userId, transactions)))));
  return JSON.parse(JSON.stringify({ oweAmount, paidAmount, totalAmount }));
}

export function calculateDebtPerFriend(userId, transactions) {
  const payers = _.map(transactions, (txn) => txn.from);
  console.log('Payers done');
  const payees = _.flatMap(transactions, (txn) => txn.to);
  const friends = _.unionBy(payers, payees, "email").filter((user) => user.email !== userId);
  const allBalances = _(friends).map((friend) => {
    const lent = calculatePaidAmountPerPayee(userId, friend, transactions);
    const owed = calculateOwedAmountPerPayer(userId, friend, transactions);
    const balance = lent.total - owed.total;
    return {
      friend,
      balance,
      lent,
      owed,
    };
  });

  return JSON.parse(JSON.stringify({
    positive: allBalances.filter((b) => b.balance > 0),
    negative: allBalances.filter((b) => b.balance < 0),
  }));
}

function calculatePaidAmountPerPayee(userId, friend, transactions) {
  const lentAmounts = _(transactions)
    .filter((txn) => txn.from.email === userId)
    .filter((txn) => txn.to.map((u) => u.email).includes(friend.email))
    .map((txn) => ({ groupId: txn.groupId, group: txn.group, lentAmount: txn.amount / (txn.to.length + 1) }));

  const totalLentAmount = lentAmounts.sumBy((txn) => txn.lentAmount);

  const perGroupLentAmounts = lentAmounts
    .groupBy('groupId')
    .map((txns, key) => ({ group: txns[0].group, total: _.sumBy(txns, 'lentAmount') }));
  return { total: totalLentAmount, per_group: perGroupLentAmounts };
}
function calculateOwedAmountPerPayer(userId, friend, transactions) {
  const oweAmounts = _(transactions)
    .filter((txn) => txn.from.email === friend.email)
    .filter((txn) => txn.to.map((u) => u.email).includes(userId))
    .map((txn) => ({ groupId: txn.groupId, group: txn.group, oweAmount: txn.amount * txn.to.length / (txn.to.length + 1) }));

  const totalOweAmount = oweAmounts.sumBy((txn) => txn.oweAmount);

  const perGroupOweAmounts = oweAmounts
    .groupBy('groupId')
    .map((txns, key) => ({ group: txns[0].group, total: _.sumBy(txns, 'oweAmount') }));
  return { total: totalOweAmount, per_group: perGroupOweAmounts };
}
