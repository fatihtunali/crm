'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/common/currency-display';
import { PricingTable as PricingTableType } from '@/lib/api/types';

interface PricingTableProps {
  pricingTable?: PricingTableType;
  currency?: 'USD' | 'EUR' | 'TRY';
}

const PAX_TIERS = [2, 4, 6, 8, 10] as const;

export function PricingTable({ pricingTable, currency = 'EUR' }: PricingTableProps) {
  if (!pricingTable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pricing Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Add days and expenses to calculate pricing
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Breakdown by PAX</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">PAX</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Cost</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Markup</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Tax</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Price</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Per Person</th>
              </tr>
            </thead>
            <tbody>
              {PAX_TIERS.map((pax) => {
                const key = `pax${pax}` as keyof PricingTableType;
                const pricing = pricingTable[key];

                if (!pricing) return null;

                return (
                  <tr key={pax} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{pax}</td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      <CurrencyDisplay amount={pricing.totalCost} currency={currency} />
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      <CurrencyDisplay amount={pricing.markup} currency={currency} />
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      <CurrencyDisplay amount={pricing.tax} currency={currency} />
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-indigo-600">
                      <CurrencyDisplay amount={pricing.totalPrice} currency={currency} />
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      <CurrencyDisplay amount={pricing.pricePerPerson} currency={currency} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
