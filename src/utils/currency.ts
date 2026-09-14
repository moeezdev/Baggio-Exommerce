/**
 * Standard PKR currency formatting utility for Baggio.
 * Formats all customer-facing amounts with Pakistani Rupee symbol (Rs.).
 * Example: Rs. 4,999, Rs. 12,500
 */
export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rs. 0';
  }
  const rounded = Math.round(amount);
  return `Rs. ${rounded.toLocaleString('en-US')}`;
}

/**
 * Calculates percentage discount between regular and sale price.
 */
export function getDiscountPercentage(
  regularPrice: number,
  salePrice: number | null | undefined
): number {
  if (!salePrice || salePrice >= regularPrice || regularPrice <= 0) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}
