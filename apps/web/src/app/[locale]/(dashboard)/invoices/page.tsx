'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useInvoices,
  useInvoiceStats,
  useDeleteInvoice,
  useDownloadInvoicePDF,
} from '@/lib/api/hooks/use-invoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Trash2, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function InvoicesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: invoicesData, isLoading } = useInvoices({
    page: currentPage,
    limit: 10,
  });
  const { data: stats } = useInvoiceStats();
  const deleteInvoice = useDeleteInvoice();
  const downloadPDF = useDownloadInvoicePDF();

  const handleDelete = async (id: number) => {
    try {
      await deleteInvoice.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      alert('Failed to delete invoice. Please try again.');
    }
  };

  const handleDownloadPDF = async (id: number) => {
    try {
      await downloadPDF.mutateAsync(id);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-700 mt-1 text-base">
            Manage customer invoices and download PDFs
          </p>
        </div>
        <Link href={`/${locale}/invoices/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      {stats && stats.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.currency}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total ({stat.currency})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat._sum.grossAmount?.toFixed(2) || '0.00'} {stat.currency}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat._count.id} invoice{stat._count.id !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Invoice #
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Booking
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Issue Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Currency
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Net Amount
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    VAT
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Gross Amount
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoicesData?.data.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{invoice.number}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {invoice.booking?.bookingCode || `#${invoice.bookingId}`}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{invoice.currency}</td>
                    <td className="py-3 px-4 text-right">
                      {invoice.netAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {invoice.vatAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {invoice.grossAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPDF(invoice.id)}
                          disabled={downloadPDF.isPending}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {deleteConfirm === invoice.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(invoice.id)}
                              disabled={deleteInvoice.isPending}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteConfirm(invoice.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {invoicesData?.data.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No invoices
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new invoice.
                </p>
                <div className="mt-6">
                  <Link href={`/${locale}/invoices/new`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Invoice
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {invoicesData && invoicesData.meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {invoicesData.meta.page} of {invoicesData.meta.totalPages} (
                {invoicesData.meta.total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage >= invoicesData.meta.totalPages}
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
