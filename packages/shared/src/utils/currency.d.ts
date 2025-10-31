import { ExchangeRate } from '../types/interfaces';
export declare function selectRateByDate(rates: ExchangeRate[], date: Date): number;
export declare function priceFromCost(costTry: number, markupPct: number, rate: number): number;
export declare function costFromPrice(sellPriceEur: number, markupPct: number, rate: number): number;
export declare function calculateMargin(sellPriceEur: number, costTry: number, rate: number): number;
export declare function calculateProfit(sellPriceEur: number, costTry: number, rate: number): number;
export declare function formatCurrency(amount: number, currency: string, locale?: string): string;
export declare function calculateVat(netAmount: number, vatRate: number): number;
export declare function calculateGross(netAmount: number, vatRate: number): number;
