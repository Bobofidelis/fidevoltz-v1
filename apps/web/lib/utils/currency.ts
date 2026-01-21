/**
 * Format a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₦1,234.56")
 */
export function formatNaira(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Format a number as Nigerian Naira without the symbol
 * @param amount - The amount to format
 * @returns Formatted number string (e.g., "1,234.56")
 */
export function formatNairaValue(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}
