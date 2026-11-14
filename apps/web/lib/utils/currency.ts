/**
 * Format a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₦1,234.56")
 */
export function formatNaira(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Whole amounts show as ₦15,000 (matching the store); kobo amounts keep 2 decimals
  const decimals = Number.isInteger(Math.round(numAmount * 100) / 100) ? 0 : 2;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numAmount);
}

