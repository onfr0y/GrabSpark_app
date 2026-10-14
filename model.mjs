export function calculate({price, cost, orders, setup, days}) {
  if (![price, cost, orders, setup, days].every(Number.isFinite) ||
      [price, cost, orders, setup].some(x => x < 0) || days < 1 ||
      !Number.isInteger(orders) || !Number.isInteger(days)) throw new RangeError('Enter valid non-negative values and whole orders and days.');
  // Integer satang avoids subtraction errors for two-decimal currency inputs.
  const margin = (Math.round(price * 100) - Math.round(cost * 100)) / 100;
  const daily = margin * orders;
  const recoveryOrders = setup === 0 ? 0 : margin > 0 ? Math.ceil(Math.round(setup * 100) / Math.round(margin * 100)) : null;
  const recoveryDays = setup === 0 ? 0 : daily > 0 ? setup / daily : null;
  return {margin, daily, revenue: price * orders * days, variable: cost * orders * days,
    total: daily * days, afterSetup: daily * days - setup, recoveryOrders, recoveryDays};
}
export function scenarios(input, spread) {
  if (!Number.isFinite(spread) || spread < 0 || spread > 100) throw new RangeError('Variation must be 0–100%.');
  return [1-spread/100, 1, 1+spread/100].map((factor, i) => {
    const orders = Math.round(input.orders * factor);
    return {name: ['Low', 'Base', 'High'][i], orders, ...calculate({...input, orders})};
  });
}
