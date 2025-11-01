'use client';

import React from 'react';
import { ManualQuote } from '@/lib/api/types';
import { CurrencyDisplay } from '@/components/common/currency-display';
import { Badge } from '@/components/ui/badge';

interface QuoteSummaryProps {
  quote: ManualQuote;
  currency?: 'USD' | 'EUR' | 'TRY';
}

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  hotelAccommodation: 'Hotel Accommodation',
  meals: 'Meals',
  entranceFees: 'Entrance Fees',
  sicTourCost: 'SIC Tour Cost',
  tips: 'Tips',
  transportation: 'Transportation',
  guide: 'Guide',
  guideDriverAccommodation: 'Guide/Driver Accommodation',
  parking: 'Parking',
};

export function QuoteSummary({ quote, currency = 'EUR' }: QuoteSummaryProps) {
  return (
    <div className="print:p-8 max-w-5xl mx-auto bg-white">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{quote.quoteName}</h1>
        <div className="flex gap-3">
          <Badge>{quote.tourType}</Badge>
          {quote.category && <Badge variant="outline">{quote.category}</Badge>}
          {quote.seasonName && <Badge variant="outline">{quote.seasonName}</Badge>}
        </div>
      </div>

      {/* Quote Details */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Tour Information</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Start Date:</dt>
              <dd className="font-medium">{new Date(quote.startDate).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">End Date:</dt>
              <dd className="font-medium">{new Date(quote.endDate).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Duration:</dt>
              <dd className="font-medium">{quote.days.length} days</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Passengers:</dt>
              <dd className="font-medium">{quote.pax} PAX</dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Pricing Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Markup:</dt>
              <dd className="font-medium">{quote.markup}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Tax:</dt>
              <dd className="font-medium">{quote.tax}%</dd>
            </div>
            {quote.validFrom && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Valid From:</dt>
                <dd className="font-medium">{new Date(quote.validFrom).toLocaleDateString()}</dd>
              </div>
            )}
            {quote.validTo && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Valid To:</dt>
                <dd className="font-medium">{new Date(quote.validTo).toLocaleDateString()}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Day-by-Day Itinerary */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Itinerary</h2>
        <div className="space-y-6">
          {quote.days.map((day) => (
            <div key={day.id} className="border-l-4 border-indigo-500 pl-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Day {day.dayNumber} - {new Date(day.date).toLocaleDateString()}
              </h3>
              {day.expenses.length > 0 ? (
                <div className="space-y-2">
                  {day.expenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {EXPENSE_CATEGORY_LABELS[expense.category]}
                        </span>
                        {expense.location && (
                          <span className="text-gray-600"> - {expense.location}</span>
                        )}
                        {expense.description && (
                          <p className="text-gray-600 text-xs mt-1">{expense.description}</p>
                        )}
                      </div>
                      <span className="text-gray-700 font-medium ml-4">
                        <CurrencyDisplay amount={expense.price} currency={currency} />
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No activities planned</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Table */}
      {quote.pricingTable && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pricing Options</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">PAX</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Total Cost</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Markup</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Tax</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold bg-indigo-50">Total Price</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold bg-indigo-50">Per Person</th>
                </tr>
              </thead>
              <tbody>
                {[2, 4, 6, 8, 10].map((pax) => {
                  const key = `pax${pax}` as keyof typeof quote.pricingTable;
                  const pricing = quote.pricingTable?.[key];
                  if (!pricing) return null;

                  return (
                    <tr key={pax} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">{pax}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        <CurrencyDisplay amount={pricing.totalCost} currency={currency} />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        <CurrencyDisplay amount={pricing.markup} currency={currency} />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        <CurrencyDisplay amount={pricing.tax} currency={currency} />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold bg-indigo-50">
                        <CurrencyDisplay amount={pricing.totalPrice} currency={currency} />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold bg-indigo-50">
                        <CurrencyDisplay amount={pricing.pricePerPerson} currency={currency} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-300 text-sm text-gray-600 print:block hidden">
        <p>Generated on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
