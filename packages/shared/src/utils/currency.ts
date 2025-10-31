import { ExchangeRate } from '../types/interfaces';

/**
 * Select the most recent exchange rate on or before the given date
 * @param rates - Array of exchange rates
 * @param date - Target date
 * @returns Exchange rate or throws error if not found
 */
export function selectRateByDate(rates: ExchangeRate[], date: Date): number {
  if (!rates || rates.length === 0) {
    throw new Error('No exchange rates available');
  }

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  // Filter rates on or before target date
  const validRates = rates.filter((rate) => {
    const rateDate = new Date(rate.rateDate);
    rateDate.setHours(0, 0, 0, 0);
    return rateDate <= targetDate;
  });

  if (validRates.length === 0) {
    throw new Error(`No exchange rate found on or before ${date.toISOString()}`);
  }

  // Sort by date descending and get the most recent
  const sortedRates = validRates.sort((a, b) => {
    return new Date(b.rateDate).getTime() - new Date(a.rateDate).getTime();
  });

  const selectedRate = sortedRates[0];

  if (selectedRate.rate <= 0) {
    throw new Error('Invalid exchange rate: rate must be positive');
  }

  return selectedRate.rate;
}

/**
 * Calculate sell price in EUR from cost in TRY with markup
 * @param costTry - Cost in Turkish Lira
 * @param markupPct - Markup percentage (e.g., 25 for 25%)
 * @param rate - Exchange rate (TRY to EUR)
 * @returns Sell price in EUR rounded to 2 decimals
 */
export function priceFromCost(costTry: number, markupPct: number, rate: number): number {
  if (costTry < 0) {
    throw new Error('Cost cannot be negative');
  }

  if (markupPct < 0) {
    throw new Error('Markup percentage cannot be negative');
  }

  if (rate <= 0) {
    throw new Error('Exchange rate must be positive');
  }

  // Apply markup
  const costWithMarkup = costTry * (1 + markupPct / 100);

  // Convert to EUR
  const sellPriceEur = costWithMarkup / rate;

  // Round to 2 decimals
  return Math.round(sellPriceEur * 100) / 100;
}

/**
 * Calculate cost in TRY from sell price in EUR
 * @param sellPriceEur - Sell price in EUR
 * @param markupPct - Markup percentage
 * @param rate - Exchange rate (TRY to EUR)
 * @returns Cost in TRY
 */
export function costFromPrice(sellPriceEur: number, markupPct: number, rate: number): number {
  if (sellPriceEur < 0) {
    throw new Error('Sell price cannot be negative');
  }

  if (markupPct < 0) {
    throw new Error('Markup percentage cannot be negative');
  }

  if (rate <= 0) {
    throw new Error('Exchange rate must be positive');
  }

  // Convert EUR to TRY
  const priceInTry = sellPriceEur * rate;

  // Remove markup
  const costTry = priceInTry / (1 + markupPct / 100);

  return Math.round(costTry * 100) / 100;
}

/**
 * Calculate gross margin percentage
 * @param sellPriceEur - Sell price in EUR
 * @param costTry - Cost in TRY
 * @param rate - Exchange rate (TRY to EUR)
 * @returns Margin percentage
 */
export function calculateMargin(sellPriceEur: number, costTry: number, rate: number): number {
  if (sellPriceEur <= 0) {
    return 0;
  }

  if (rate <= 0) {
    throw new Error('Exchange rate must be positive');
  }

  const costEur = costTry / rate;
  const margin = ((sellPriceEur - costEur) / sellPriceEur) * 100;

  return Math.round(margin * 100) / 100;
}

/**
 * Calculate profit in EUR
 * @param sellPriceEur - Sell price in EUR
 * @param costTry - Cost in TRY
 * @param rate - Exchange rate (TRY to EUR)
 * @returns Profit in EUR
 */
export function calculateProfit(sellPriceEur: number, costTry: number, rate: number): number {
  if (rate <= 0) {
    throw new Error('Exchange rate must be positive');
  }

  const costEur = costTry / rate;
  const profit = sellPriceEur - costEur;

  return Math.round(profit * 100) / 100;
}

/**
 * Format currency amount
 * @param amount - Amount to format
 * @param currency - Currency code
 * @param locale - Locale for formatting
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate VAT amount
 * @param netAmount - Net amount
 * @param vatRate - VAT rate as percentage (e.g., 20 for 20%)
 * @returns VAT amount
 */
export function calculateVat(netAmount: number, vatRate: number): number {
  if (netAmount < 0) {
    throw new Error('Net amount cannot be negative');
  }

  if (vatRate < 0) {
    throw new Error('VAT rate cannot be negative');
  }

  const vatAmount = netAmount * (vatRate / 100);
  return Math.round(vatAmount * 100) / 100;
}

/**
 * Calculate gross amount including VAT
 * @param netAmount - Net amount
 * @param vatRate - VAT rate as percentage
 * @returns Gross amount
 */
export function calculateGross(netAmount: number, vatRate: number): number {
  const vatAmount = calculateVat(netAmount, vatRate);
  return Math.round((netAmount + vatAmount) * 100) / 100;
}
