'use client';

import React from 'react';

interface CurrencyDisplayProps {
  amount: number | string;
  currency?: 'USD' | 'EUR' | 'TRY';
  className?: string;
  showSymbol?: boolean;
}

const currencySymbols = {
  USD: '$',
  EUR: '€',
  TRY: '₺',
};

export function CurrencyDisplay({
  amount,
  currency = 'EUR',
  className = '',
  showSymbol = true,
}: CurrencyDisplayProps) {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return <span className={className}>-</span>;
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);

  const symbol = showSymbol ? currencySymbols[currency] : '';

  return (
    <span className={className}>
      {symbol}{formattedAmount}
      {!showSymbol && ` ${currency}`}
    </span>
  );
}
