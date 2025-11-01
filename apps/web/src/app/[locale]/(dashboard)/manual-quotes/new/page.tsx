'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCreateManualQuote } from '@/lib/api/hooks/use-manual-quotes';
import { QuoteForm } from '@/components/manual-quotes/quote-form';
import { createManualQuoteSchema, type CreateManualQuoteInput } from '@/lib/validators/manual-quote';

export default function NewManualQuotePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const createQuote = useCreateManualQuote();

  const form = useForm<CreateManualQuoteInput>({
    resolver: zodResolver(createManualQuoteSchema),
    defaultValues: {
      quoteName: '',
      category: 'B2C',
      tourType: 'SIC',
      pax: 2,
      markup: 15,
      tax: 8,
      transportPricingMode: 'total',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  const handleCreate = async (data: CreateManualQuoteInput) => {
    try {
      const result = await createQuote.mutateAsync(data);
      toast.success('Quote created successfully');
      router.push(`/${locale}/manual-quotes/${result.id}`);
    } catch (error) {
      toast.error('Failed to create quote');
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Create New Quote</h1>
            <p className="text-gray-700 mt-1 text-base">
              Build a custom tour quotation
            </p>
          </div>
        </div>
        <Button onClick={form.handleSubmit(handleCreate)} disabled={createQuote.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Create Quote
        </Button>
      </div>

      <div className="space-y-6">
        <QuoteForm form={form} />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> After creating the quote, you&apos;ll be able to add day-by-day itinerary details and expenses.
            Days will be automatically generated based on your start and end dates.
          </p>
        </div>
      </div>
    </div>
  );
}
