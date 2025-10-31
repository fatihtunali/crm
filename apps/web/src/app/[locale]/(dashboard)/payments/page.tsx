'use client';

import { useState } from 'react';
import {
  useClientPayments,
  useClientPaymentStats,
  useVendorPayments,
  useVendorPaymentStats,
  useDeleteClientPayment,
  useDeleteVendorPayment,
} from '@/lib/api/hooks/use-payments';
import { PaymentStatus, PaymentMethod } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, CreditCard, DollarSign, TrendingUp, Users, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

type TabType = 'client' | 'vendor';

const statusColors: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-blue-100 text-blue-800',
};

const methodLabels: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  CREDIT_CARD: 'Credit Card',
  BANK_TRANSFER: 'Bank Transfer',
  ONLINE: 'Online',
  OTHER: 'Other',
};

export default function PaymentsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [activeTab, setActiveTab] = useState<TabType>('client');
  const [clientPage, setClientPage] = useState(1);
  const [vendorPage, setVendorPage] = useState(1);

  // Client Payments
  const { data: clientPaymentsData, isLoading: clientLoading } = useClientPayments({
    page: clientPage,
    limit: 20,
  });
  const { data: clientStats } = useClientPaymentStats();
  const deleteClientPayment = useDeleteClientPayment();

  // Vendor Payments
  const { data: vendorPaymentsData, isLoading: vendorLoading } = useVendorPayments({
    page: vendorPage,
    limit: 20,
  });
  const { data: vendorStats } = useVendorPaymentStats();
  const deleteVendorPayment = useDeleteVendorPayment();

  const handleDeleteClient = async (id: number, bookingCode: string) => {
    if (confirm(`Are you sure you want to delete this payment for booking "${bookingCode}"?`)) {
      await deleteClientPayment.mutateAsync(id);
    }
  };

  const handleDeleteVendor = async (id: number, vendorName: string) => {
    if (confirm(`Are you sure you want to delete this payment to "${vendorName}"?`)) {
      await deleteVendorPayment.mutateAsync(id);
    }
  };

  const getClientTotalAmount = () => {
    return (
      clientPaymentsData?.data.reduce(
        (sum, payment) => sum + parseFloat(payment.amountEur.toString()),
        0
      ) || 0
    );
  };

  const getVendorTotalAmount = () => {
    return (
      vendorPaymentsData?.data.reduce(
        (sum, payment) => sum + parseFloat(payment.amountTry.toString()),
        0
      ) || 0
    );
  };

  const getClientStatusCount = (status: PaymentStatus) => {
    return (
      clientStats?.find((s) => s.status === status)?.totalAmount || 0
    );
  };

  const getVendorStatusCount = (status: PaymentStatus) => {
    return (
      vendorStats?.find((s) => s.status === status)?.totalAmount || 0
    );
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-700 mt-1 text-base">
            Track client payments and vendor payouts
          </p>
        </div>
        <Link href={`/${locale}/payments/new?type=${activeTab}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New {activeTab === 'client' ? 'Client' : 'Vendor'} Payment
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          className={cn(
            'px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2',
            activeTab === 'client'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
          onClick={() => setActiveTab('client')}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Client Payments
          </div>
        </button>
        <button
          className={cn(
            'px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2',
            activeTab === 'vendor'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
          onClick={() => setActiveTab('vendor')}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Vendor Payments
          </div>
        </button>
      </div>

      {/* Client Payments Tab */}
      {activeTab === 'client' && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as PaymentStatus[]).map(
              (status) => (
                <Card
                  key={status}
                  className="border-2 bg-gradient-to-br from-gray-50 to-gray-100"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-800">
                      {status}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      €{getClientStatusCount(status).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Total Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {clientPaymentsData?.meta.total || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Amount (Current Page)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  €{getClientTotalAmount().toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payments Table */}
          {clientLoading ? (
            <div className="p-8">
              <p>Loading...</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gradient-to-r from-indigo-500 to-purple-600">
                      <tr>
                        <th className="p-4 text-left text-sm font-semibold text-white">
                          Booking
                        </th>
                        <th className="p-4 text-left text-sm font-semibold text-white">
                          Amount (EUR)
                        </th>
                        <th className="p-4 text-left text-sm font-semibold text-white">
                          Method
                        </th>
                        <th className="p-4 text-left text-sm font-semibold text-white">
                          Paid At
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
                      {clientPaymentsData?.data.map((payment) => (
                        <tr key={payment.id} className="hover:bg-blue-50 transition-colors">
                          <td className="p-4 text-sm text-gray-800 font-medium">
                            {payment.booking?.bookingCode || 'N/A'}
                          </td>
                          <td className="p-4 text-sm text-gray-900 font-semibold">
                            €{parseFloat(payment.amountEur.toString()).toFixed(2)}
                          </td>
                          <td className="p-4 text-sm text-gray-800">
                            {methodLabels[payment.method]}
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {new Date(payment.paidAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                statusColors[payment.status]
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm">
                            <div className="flex gap-2">
                              <Link href={`/${locale}/payments/${payment.id}`}>
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteClient(
                                    payment.id,
                                    payment.booking?.bookingCode || 'N/A'
                                  )
                                }
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
                {clientPaymentsData && clientPaymentsData.meta.totalPages > 1 && (
                  <div className="border-t p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="text-sm text-gray-700 font-medium">
                      Showing {clientPaymentsData.data.length} of{' '}
                      {clientPaymentsData.meta.total} payments
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={clientPage === 1}
                        onClick={() => setClientPage(clientPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={clientPage === clientPaymentsData.meta.totalPages}
                        onClick={() => setClientPage(clientPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Vendor Payments Tab */}
      {activeTab === 'vendor' && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as PaymentStatus[]).map(
              (status) => (
                <Card
                  key={status}
                  className="border-2 bg-gradient-to-br from-gray-50 to-gray-100"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-800">
                      {status}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      ₺{getVendorStatusCount(status).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {vendorPaymentsData?.meta.total || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Amount (Current Page)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  ₺{getVendorTotalAmount().toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payments Table */}
          {vendorLoading ? (
            <div className="p-8">
              <p>Loading...</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gradient-to-r from-indigo-500 to-purple-600">
                      <tr>
                        <th className="p-4 text-left text-sm font-semibold text-white">
                          Vendor
                        </th>
                        <th className="p-4 text-left text-sm font-semibold text-white">
                          Booking
                        </th>
                        <th className="p-4 text-left text-sm font-semibold text-white">
                          Amount (TRY)
                        </th>
                        <th className="p-4 text-left text-sm font-semibold text-white">
                          Paid At
                        </th>
                        <th className="p-4 text-left text-sm font-semibold text-white">
                          Due Date
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
                      {vendorPaymentsData?.data.map((payment) => (
                        <tr key={payment.id} className="hover:bg-blue-50 transition-colors">
                          <td className="p-4 text-sm text-gray-800 font-medium">
                            {payment.vendor?.name || 'N/A'}
                          </td>
                          <td className="p-4 text-sm text-gray-800">
                            {payment.booking?.bookingCode || 'N/A'}
                          </td>
                          <td className="p-4 text-sm text-gray-900 font-semibold">
                            ₺{parseFloat(payment.amountTry.toString()).toFixed(2)}
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                statusColors[payment.status]
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm">
                            <div className="flex gap-2">
                              <Link href={`/${locale}/payments/${payment.id}`}>
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteVendor(
                                    payment.id,
                                    payment.vendor?.name || 'N/A'
                                  )
                                }
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
                {vendorPaymentsData && vendorPaymentsData.meta.totalPages > 1 && (
                  <div className="border-t p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="text-sm text-gray-700 font-medium">
                      Showing {vendorPaymentsData.data.length} of{' '}
                      {vendorPaymentsData.meta.total} payments
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={vendorPage === 1}
                        onClick={() => setVendorPage(vendorPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={vendorPage === vendorPaymentsData.meta.totalPages}
                        onClick={() => setVendorPage(vendorPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
