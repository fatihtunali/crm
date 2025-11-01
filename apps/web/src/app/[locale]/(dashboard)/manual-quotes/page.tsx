'use client';

import { useState } from 'react';
import { useManualQuotes, useDeleteManualQuote } from '@/lib/api/hooks/use-manual-quotes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Trash2, Eye, Edit } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';

export default function ManualQuotesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: quotesData, isLoading } = useManualQuotes({
    page,
    limit: 20,
    ...(search && { search }),
  });

  const deleteQuote = useDeleteManualQuote();

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete quote "${name}"?`)) {
      await deleteQuote.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const quotes = quotesData?.data || [];
  const meta = quotesData?.meta;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manual Quotes</h1>
          <p className="text-gray-700 mt-1 text-base">
            Build and manage custom tour quotations
          </p>
        </div>
        <Link href={`/${locale}/manual-quotes/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search quotes by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {quotes.length === 0 ? (
        <EmptyState
          title="No quotes found"
          description="Get started by creating your first manual quote"
          action={{
            label: 'Create Quote',
            onClick: () => window.location.href = `/${locale}/manual-quotes/new`,
          }}
        />
      ) : (
        <>
          <div className="grid gap-4">
            {quotes.map((quote) => (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {quote.quoteName}
                        </h3>
                        <Badge variant="outline">{quote.tourType}</Badge>
                        {quote.category && (
                          <Badge>{quote.category}</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Dates:</span>{' '}
                          {new Date(quote.startDate).toLocaleDateString()} -{' '}
                          {new Date(quote.endDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">PAX:</span> {quote.pax}
                        </div>
                        <div>
                          <span className="font-medium">Days:</span> {quote.days.length}
                        </div>
                        <div>
                          <span className="font-medium">Markup:</span> {quote.markup}%
                        </div>
                      </div>
                      {quote.seasonName && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Season:</span> {quote.seasonName}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/${locale}/manual-quotes/${quote.id}/preview`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </Link>
                      <Link href={`/${locale}/manual-quotes/${quote.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(quote.id, quote.quoteName)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {(page - 1) * meta.limit + 1} to{' '}
                {Math.min(page * meta.limit, meta.total)} of {meta.total} quotes
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === meta.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
