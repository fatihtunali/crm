'use client';

import { useState } from 'react';
import {
  useQuotations,
  useQuotationStats,
  useDeleteQuotation,
  useSendQuotation,
  useAcceptQuotation,
  useRejectQuotation,
} from '@/lib/api/hooks/use-quotations';
import { QuotationStatus } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Send, CheckCircle, XCircle, Euro, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const statusColors: Record<QuotationStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
};

const statusCardColors: Record<QuotationStatus, string> = {
  DRAFT: 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100',
  SENT: 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100',
  ACCEPTED: 'border-green-300 bg-gradient-to-br from-green-50 to-green-100',
  REJECTED: 'border-red-300 bg-gradient-to-br from-red-50 to-red-100',
  EXPIRED: 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100',
};

export default function QuotationsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | undefined>();

  const { data: quotationsData, isLoading } = useQuotations({
    page,
    limit: 20,
    ...(statusFilter && { status: statusFilter }),
  });

  const { data: stats } = useQuotationStats();

  const deleteQuotation = useDeleteQuotation();
  const sendQuotation = useSendQuotation();
  const acceptQuotation = useAcceptQuotation();
  const rejectQuotation = useRejectQuotation();

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      await deleteQuotation.mutateAsync(id);
    }
  };

  const handleSend = async (id: number) => {
    if (confirm('Send this quotation to the client?')) {
      try {
        await sendQuotation.mutateAsync(id);
        alert('Quotation sent successfully');
      } catch (error) {
        console.error('Failed to send quotation:', error);
        alert('Failed to send quotation. Please try again.');
      }
    }
  };

  const handleAccept = async (id: number) => {
    if (confirm('Mark this quotation as accepted?')) {
      await acceptQuotation.mutateAsync(id);
    }
  };

  const handleReject = async (id: number) => {
    if (confirm('Mark this quotation as rejected?')) {
      await rejectQuotation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading...</p>
      </div>
    );
  }

  const getStatusCount = (status: QuotationStatus) => {
    return stats?.find((s) => s.status === status)?.count || 0;
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-700 mt-1 text-base">
            Manage tour quotations and proposals
          </p>
        </div>
        <Link href={`/${locale}/quotations/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Button>
        </Link>
      </div>

      {/* Status Filter Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        {(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'] as QuotationStatus[]).map(
          (status) => (
            <Card
              key={status}
              className={cn(
                'cursor-pointer hover:shadow-xl transition-all duration-200 border-2',
                statusFilter === status ? 'ring-4 ring-yellow-400 shadow-xl' : '',
                statusCardColors[status]
              )}
              onClick={() => setStatusFilter(statusFilter === status ? undefined : status)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-800">
                  {status}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {getStatusCount(status)}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Total Quotations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {quotationsData?.meta.total || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {getStatusCount('ACCEPTED')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gradient-to-r from-indigo-500 to-purple-600">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    ID
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Client/Lead
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Tour
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Price (EUR)
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Valid Until
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Status
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {quotationsData?.data.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      #{quotation.id}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {quotation.lead?.client?.name || 'N/A'}
                    </td>
                    <td className="p-4 text-sm text-gray-800">
                      {quotation.tour?.name || '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-900 font-semibold">
                      €{parseFloat(quotation.sellPriceEur.toString()).toFixed(2)}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {quotation.validUntil
                        ? new Date(quotation.validUntil).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          statusColors[quotation.status]
                        }`}
                      >
                        {quotation.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex gap-2">
                        <Link href={`/${locale}/quotations/${quotation.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>

                        {quotation.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSend(quotation.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Send to client"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}

                        {quotation.status === 'SENT' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAccept(quotation.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Accept"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(quotation.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(quotation.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {quotationsData && quotationsData.meta.totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="text-sm text-gray-700 font-medium">
                Showing {quotationsData.data.length} of {quotationsData.meta.total} quotations
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === quotationsData.meta.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
