/**
 * Kenya VAT Utility Functions
 * These are synchronous helper functions for VAT calculations
 */

/**
 * Check VAT filing deadline (20th of following month for Kenya)
 */
export function getVatFilingDeadline(year: number, month: number): Date {
  // VAT is due by 20th of the following month
  return new Date(year, month, 20);
}

/**
 * Calculate potential penalty for late filing
 * 5% penalty + 1% interest per month (KRA standard)
 */
export function calculateLateFilingPenalty(
  vatAmount: number,
  daysLate: number
): {
  penalty: number;
  interest: number;
  total: number;
} {
  if (daysLate <= 0) {
    return { penalty: 0, interest: 0, total: 0 };
  }

  const penalty = vatAmount * 0.05; // 5% penalty
  const monthsLate = Math.ceil(daysLate / 30);
  const interest = vatAmount * 0.01 * monthsLate; // 1% per month

  return {
    penalty: Math.round(penalty * 100) / 100,
    interest: Math.round(interest * 100) / 100,
    total: Math.round((penalty + interest) * 100) / 100,
  };
}

/**
 * Format VAT amount for display
 */
export function formatVatAmount(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Calculate VAT from gross amount
 */
export function calculateVatFromGross(grossAmount: number, vatRate: number = 16): {
  netAmount: number;
  vatAmount: number;
} {
  const vatAmount = grossAmount - grossAmount / (1 + vatRate / 100);
  const netAmount = grossAmount - vatAmount;
  
  return {
    netAmount: Math.round(netAmount * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
  };
}
