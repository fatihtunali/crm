'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useManualQuote } from '@/lib/api/hooks/use-manual-quotes';
import { QuoteSummary } from '@/components/manual-quotes/quote-summary';

export default function QuotePreviewPage() {
  const params = useParams();
  const locale = params.locale as string;
  const quoteId = parseInt(params.id as string, 10);

  const { data: quote, isLoading } = useManualQuote(quoteId);

  const handlePrint = () => {
    window.print();
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
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <Link href={`/${locale}/manual-quotes/${quoteId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Edit
            </Button>
          </Link>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      <div className="p-8 print:p-0">
        <QuoteSummary quote={quote} />
      </div>
    </div>
  );
}
