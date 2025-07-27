/**
 * Currency formatting utilities for UK (GBP) pricing
 */

export const formatCurrency = (
  amount: number, 
  options: {
    showPence?: boolean;
    shortFormat?: boolean;
  } = {}
): string => {
  const { showPence = true, shortFormat = false } = options;
  
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: showPence ? 2 : 0,
    maximumFractionDigits: showPence ? 2 : 0,
  });
  
  if (shortFormat && amount >= 1000) {
    const thousands = amount / 1000;
    return `£${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}k`;
  }
  
  return formatter.format(amount);
};

export const formatCurrencyShort = (amount: number): string => {
  return formatCurrency(amount, { showPence: false, shortFormat: true });
};

export const formatCurrencyMonthly = (amount: number): string => {
  return `${formatCurrency(amount, { showPence: false })}/month`;
};

export const formatCurrencyWeekly = (amount: number): string => {
  const weeklyAmount = amount / 4.33; // Average weeks per month
  return `${formatCurrency(weeklyAmount, { showPence: false })}/week`;
};