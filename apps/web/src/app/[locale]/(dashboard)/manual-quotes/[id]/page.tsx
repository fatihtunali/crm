'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Calculator } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import {
  useManualQuote,
  useUpdateManualQuote,
  useAddExpense,
  useUpdateExpense,
  useRemoveExpense,
  useRemoveDay,
  useRecalculatePricing,
} from '@/lib/api/hooks/use-manual-quotes';
import { QuoteForm } from '@/components/manual-quotes/quote-form';
import { DayBuilder } from '@/components/manual-quotes/day-builder';
import { PricingTable } from '@/components/manual-quotes/pricing-table';
import { createManualQuoteSchema, type CreateManualQuoteInput, type CreateManualQuoteExpenseInput } from '@/lib/validators/manual-quote';

export default function EditManualQuotePage() {
  const params = useParams();
  const locale = params.locale as string;
  const quoteId = parseInt(params.id as string, 10);

  const { data: quote, isLoading } = useManualQuote(quoteId);
  const updateQuote = useUpdateManualQuote();
  const addExpense = useAddExpense();
  const updateExpense = useUpdateExpense();
  const removeExpense = useRemoveExpense();
  const removeDay = useRemoveDay();
  const recalculatePricing = useRecalculatePricing();

  const form = useForm<CreateManualQuoteInput>({
    resolver: zodResolver(createManualQuoteSchema),
    defaultValues: {
      quoteName: '',
      tourType: 'SIC',
      pax: 2,
      markup: 15,
      tax: 8,
      transportPricingMode: 'total',
    },
  });

  useEffect(() => {
    if (quote) {
      form.reset({
        quoteName: quote.quoteName,
        category: quote.category,
        seasonName: quote.seasonName || '',
        validFrom: quote.validFrom || '',
        validTo: quote.validTo || '',
        startDate: quote.startDate,
        endDate: quote.endDate,
        tourType: quote.tourType,
        pax: quote.pax,
        markup: quote.markup,
        tax: quote.tax,
        transportPricingMode: quote.transportPricingMode as 'total' | 'vehicle' | undefined,
      });
    }
  }, [quote, form]);

  const handleSave = async (data: CreateManualQuoteInput) => {
    try {
      await updateQuote.mutateAsync({ id: quoteId, data });
      toast.success('Quote updated successfully');
    } catch (error) {
      toast.error('Failed to update quote');
    }
  };

  const handleAddExpense = async (dayId: number, expense: CreateManualQuoteExpenseInput) => {
    try {
      await addExpense.mutateAsync({ quoteId, dayId, data: expense });
      toast.success('Expense added');
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  const handleUpdateExpense = async (expenseId: number, expense: Partial<CreateManualQuoteExpenseInput>) => {
    try {
      await updateExpense.mutateAsync({ quoteId, expenseId, data: expense });
      toast.success('Expense updated');
    } catch (error) {
      toast.error('Failed to update expense');
    }
  };

  const handleRemoveExpense = async (expenseId: number) => {
    if (confirm('Remove this expense?')) {
      try {
        await removeExpense.mutateAsync({ quoteId, expenseId });
        toast.success('Expense removed');
      } catch (error) {
        toast.error('Failed to remove expense');
      }
    }
  };

  const handleRemoveDay = async (dayId: number) => {
    if (confirm('Remove this day and all its expenses?')) {
      try {
        await removeDay.mutateAsync({ quoteId, dayId });
        toast.success('Day removed');
      } catch (error) {
        toast.error('Failed to remove day');
      }
    }
  };

  const handleRecalculate = async () => {
    try {
      await recalculatePricing.mutateAsync(quoteId);
      toast.success('Pricing recalculated');
    } catch (error) {
      toast.error('Failed to recalculate pricing');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-8">
        <p>Quote not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/manual-quotes`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Quote</h1>
            <p className="text-gray-700 mt-1 text-base">{quote.quoteName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRecalculate} disabled={recalculatePricing.isPending}>
            <Calculator className="h-4 w-4 mr-2" />
            Recalculate
          </Button>
          <Link href={`/${locale}/manual-quotes/${quoteId}/preview`}>
            <Button variant="outline">Preview</Button>
          </Link>
          <Button onClick={form.handleSubmit(handleSave)} disabled={updateQuote.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <QuoteForm form={form} />

        <div>
          <h2 className="text-xl font-semibold mb-4">Day-by-Day Itinerary</h2>
          <DayBuilder
            days={quote.days}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onRemoveExpense={handleRemoveExpense}
            onRemoveDay={handleRemoveDay}
            transportPricingMode={quote.transportPricingMode}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Pricing Breakdown</h2>
          <PricingTable pricingTable={quote.pricingTable} />
        </div>
      </div>
    </div>
  );
}
