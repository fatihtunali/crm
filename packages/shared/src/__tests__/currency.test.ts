import { describe, it, expect } from 'vitest';
import {
  selectRateByDate,
  priceFromCost,
  costFromPrice,
  calculateMargin,
  calculateProfit,
  calculateVat,
  calculateGross,
} from '../utils/currency';
import { ExchangeRate } from '../types/interfaces';
import { Currency } from '../types/enums';

describe('Currency Utilities', () => {
  describe('selectRateByDate', () => {
    const mockRates: ExchangeRate[] = [
      {
        id: 1,
        tenantId: 1,
        fromCurrency: Currency.TRY,
        toCurrency: Currency.EUR,
        rate: 30.0,
        rateDate: new Date('2024-01-01'),
        source: 'manual',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        tenantId: 1,
        fromCurrency: Currency.TRY,
        toCurrency: Currency.EUR,
        rate: 31.0,
        rateDate: new Date('2024-01-10'),
        source: 'manual',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        tenantId: 1,
        fromCurrency: Currency.TRY,
        toCurrency: Currency.EUR,
        rate: 32.0,
        rateDate: new Date('2024-01-20'),
        source: 'manual',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should select the most recent rate on or before the date', () => {
      const rate = selectRateByDate(mockRates, new Date('2024-01-15'));
      expect(rate).toBe(31.0);
    });

    it('should select exact date match', () => {
      const rate = selectRateByDate(mockRates, new Date('2024-01-10'));
      expect(rate).toBe(31.0);
    });

    it('should select the first available rate for early dates', () => {
      const rate = selectRateByDate(mockRates, new Date('2024-01-05'));
      expect(rate).toBe(30.0);
    });

    it('should select latest rate for future dates', () => {
      const rate = selectRateByDate(mockRates, new Date('2024-02-01'));
      expect(rate).toBe(32.0);
    });

    it('should throw error if no rates available', () => {
      expect(() => selectRateByDate([], new Date('2024-01-15'))).toThrow(
        'No exchange rates available',
      );
    });

    it('should throw error if no rate found before date', () => {
      const rates: ExchangeRate[] = [
        {
          ...mockRates[0],
          rateDate: new Date('2024-02-01'),
        },
      ];
      expect(() => selectRateByDate(rates, new Date('2024-01-01'))).toThrow(
        'No exchange rate found on or before',
      );
    });

    it('should throw error for invalid rate value', () => {
      const invalidRates: ExchangeRate[] = [
        {
          ...mockRates[0],
          rate: 0,
        },
      ];
      expect(() => selectRateByDate(invalidRates, new Date('2024-01-15'))).toThrow(
        'Invalid exchange rate',
      );
    });
  });

  describe('priceFromCost', () => {
    it('should calculate sell price with markup correctly', () => {
      // Cost: 1000 TRY, Markup: 25%, Rate: 30 TRY/EUR
      // Expected: (1000 * 1.25) / 30 = 41.67 EUR
      const price = priceFromCost(1000, 25, 30);
      expect(price).toBe(41.67);
    });

    it('should handle zero markup', () => {
      const price = priceFromCost(1000, 0, 30);
      expect(price).toBe(33.33);
    });

    it('should handle zero cost', () => {
      const price = priceFromCost(0, 25, 30);
      expect(price).toBe(0);
    });

    it('should throw error for negative cost', () => {
      expect(() => priceFromCost(-100, 25, 30)).toThrow('Cost cannot be negative');
    });

    it('should throw error for negative markup', () => {
      expect(() => priceFromCost(1000, -10, 30)).toThrow('Markup percentage cannot be negative');
    });

    it('should throw error for zero or negative rate', () => {
      expect(() => priceFromCost(1000, 25, 0)).toThrow('Exchange rate must be positive');
      expect(() => priceFromCost(1000, 25, -1)).toThrow('Exchange rate must be positive');
    });

    it('should round to 2 decimal places', () => {
      const price = priceFromCost(1000, 33.333, 31.4159);
      expect(price.toString()).toMatch(/^\d+\.\d{2}$/);
    });
  });

  describe('costFromPrice', () => {
    it('should calculate cost from price correctly', () => {
      // Price: 41.67 EUR, Markup: 25%, Rate: 30 TRY/EUR
      // Expected: (41.67 * 30) / 1.25 = 1000.08 TRY
      const cost = costFromPrice(41.67, 25, 30);
      expect(cost).toBe(1000.08);
    });

    it('should throw error for negative price', () => {
      expect(() => costFromPrice(-100, 25, 30)).toThrow('Sell price cannot be negative');
    });
  });

  describe('calculateMargin', () => {
    it('should calculate margin percentage correctly', () => {
      // Sell: 100 EUR, Cost: 2400 TRY, Rate: 30 TRY/EUR
      // Cost in EUR: 2400 / 30 = 80 EUR
      // Margin: (100 - 80) / 100 * 100 = 20%
      const margin = calculateMargin(100, 2400, 30);
      expect(margin).toBe(20);
    });

    it('should return 0 for zero sell price', () => {
      const margin = calculateMargin(0, 1000, 30);
      expect(margin).toBe(0);
    });

    it('should handle negative margin (loss)', () => {
      const margin = calculateMargin(50, 2000, 30);
      expect(margin).toBeLessThan(0);
    });
  });

  describe('calculateProfit', () => {
    it('should calculate profit correctly', () => {
      // Sell: 100 EUR, Cost: 2400 TRY, Rate: 30 TRY/EUR
      // Cost in EUR: 80 EUR
      // Profit: 100 - 80 = 20 EUR
      const profit = calculateProfit(100, 2400, 30);
      expect(profit).toBe(20);
    });

    it('should calculate loss correctly', () => {
      const profit = calculateProfit(50, 2000, 30);
      expect(profit).toBeLessThan(0);
    });
  });

  describe('calculateVat', () => {
    it('should calculate VAT correctly', () => {
      // Net: 100, VAT: 20%
      // VAT Amount: 20
      const vat = calculateVat(100, 20);
      expect(vat).toBe(20);
    });

    it('should handle zero VAT rate', () => {
      const vat = calculateVat(100, 0);
      expect(vat).toBe(0);
    });

    it('should throw error for negative net amount', () => {
      expect(() => calculateVat(-100, 20)).toThrow('Net amount cannot be negative');
    });

    it('should throw error for negative VAT rate', () => {
      expect(() => calculateVat(100, -5)).toThrow('VAT rate cannot be negative');
    });
  });

  describe('calculateGross', () => {
    it('should calculate gross amount correctly', () => {
      // Net: 100, VAT: 20%
      // Gross: 100 + 20 = 120
      const gross = calculateGross(100, 20);
      expect(gross).toBe(120);
    });

    it('should handle zero VAT rate', () => {
      const gross = calculateGross(100, 0);
      expect(gross).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small amounts', () => {
      const price = priceFromCost(0.01, 25, 30);
      expect(price).toBeGreaterThan(0);
    });

    it('should handle very large amounts', () => {
      const price = priceFromCost(1000000, 25, 30);
      expect(price).toBeGreaterThan(0);
      expect(price).toBeLessThan(Infinity);
    });

    it('should handle very high markup', () => {
      const price = priceFromCost(1000, 200, 30); // 200% markup
      expect(price).toBe(100);
    });
  });
});
