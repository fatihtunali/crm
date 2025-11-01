'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBooking, useUpdateBooking } from '@/lib/api/hooks/use-bookings';
import { useClients } from '@/lib/api/hooks/use-clients';
import { useQuotations } from '@/lib/api/hooks/use-quotations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { BookingStatus } from '@/lib/api/types';

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const bookingId = parseInt(params.id as string);

  const { data: booking, isLoading } = useBooking(bookingId);
  const updateBooking = useUpdateBooking();
  const { data: clientsData } = useClients({ page: 1, limit: 100 });
  const { data: quotationsData } = useQuotations({ page: 1, limit: 100 });

  const [formData, setFormData] = useState({
    quotationId: '',
    clientId: '',
    bookingCode: '',
    startDate: '',
    endDate: '',
    lockedExchangeRate: '',
    totalCostTry: '',
    totalSellEur: '',
    depositDueEur: '',
    balanceDueEur: '',
    status: 'PENDING' as BookingStatus,
    notes: '',
  });

  // Pre-populate form when booking data loads
  useEffect(() => {
    if (booking) {
      setFormData({
        quotationId: booking.quotationId?.toString() || '',
        clientId: booking.clientId.toString(),
        bookingCode: booking.bookingCode,
        startDate: booking.startDate.split('T')[0],
        endDate: booking.endDate.split('T')[0],
        lockedExchangeRate: booking.lockedExchangeRate.toString(),
        totalCostTry: booking.totalCostTry.toString(),
        totalSellEur: booking.totalSellEur.toString(),
        depositDueEur: booking.depositDueEur.toString(),
        balanceDueEur: booking.balanceDueEur.toString(),
        status: booking.status,
        notes: booking.notes || '',
      });
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data: {
        clientId: number;
        bookingCode: string;
        startDate: string;
        endDate: string;
        lockedExchangeRate: number;
        status: BookingStatus;
        quotationId?: number;
        totalCostTry?: number;
        totalSellEur?: number;
        depositDueEur?: number;
        balanceDueEur?: number;
        notes?: string;
      } = {
        clientId: parseInt(formData.clientId),
        bookingCode: formData.bookingCode,
        startDate: formData.startDate,
        endDate: formData.endDate,
        lockedExchangeRate: parseFloat(formData.lockedExchangeRate),
        status: formData.status,
      };

      if (formData.quotationId) {
        data.quotationId = parseInt(formData.quotationId);
      }
      if (formData.totalCostTry) {
        data.totalCostTry = parseFloat(formData.totalCostTry);
      }
      if (formData.totalSellEur) {
        data.totalSellEur = parseFloat(formData.totalSellEur);
      }
      if (formData.depositDueEur) {
        data.depositDueEur = parseFloat(formData.depositDueEur);
      }
      if (formData.balanceDueEur) {
        data.balanceDueEur = parseFloat(formData.balanceDueEur);
      }
      if (formData.notes) {
        data.notes = formData.notes;
      }

      await updateBooking.mutateAsync({ id: bookingId, data });
      router.push(`/${locale}/bookings/${bookingId}`);
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  // Calculate profit and balance
  const calculateProfit = () => {
    if (!formData.totalSellEur || !formData.totalCostTry || !formData.lockedExchangeRate) {
      return null;
    }
    const revenueEur = parseFloat(formData.totalSellEur);
    const costTry = parseFloat(formData.totalCostTry);
    const rate = parseFloat(formData.lockedExchangeRate);
    const costEur = costTry / rate;
    const profit = revenueEur - costEur;
    const margin = (profit / revenueEur) * 100;
    return { profit, margin, costEur };
  };

  const profit = calculateProfit();

  // Calculate balance due
  const calculateBalance = () => {
    if (!formData.totalSellEur || !formData.depositDueEur) {
      return null;
    }
    const total = parseFloat(formData.totalSellEur);
    const deposit = parseFloat(formData.depositDueEur);
    return total - deposit;
  };

  const balance = calculateBalance();

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8">
        <p>Booking not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/${locale}/bookings/${bookingId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Booking</h1>
          <p className="text-gray-700 mt-1 text-base">
            Update booking: {booking.bookingCode}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Client *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select client</option>
                  {clientsData?.data.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.email && `(${client.email})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Related Quotation
                </label>
                <select
                  value={formData.quotationId}
                  onChange={(e) =>
                    setFormData({ ...formData, quotationId: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None</option>
                  {quotationsData?.data.map((quotation) => (
                    <option key={quotation.id} value={quotation.id}>
                      #{quotation.id} - {quotation.lead?.client?.name || 'N/A'} -{' '}
                      {quotation.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Booking Code *
                </label>
                <input
                  type="text"
                  value={formData.bookingCode}
                  onChange={(e) =>
                    setFormData({ ...formData, bookingCode: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="BK-2024-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as BookingStatus })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {formData.startDate && formData.endDate && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Duration:</span>{' '}
                    {Math.ceil(
                      (new Date(formData.endDate).getTime() -
                        new Date(formData.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Locked Exchange Rate (TRY/EUR) *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.lockedExchangeRate}
                  onChange={(e) =>
                    setFormData({ ...formData, lockedExchangeRate: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="35.5000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Cost (TRY)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalCostTry}
                  onChange={(e) =>
                    setFormData({ ...formData, totalCostTry: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Selling Price (EUR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalSellEur}
                  onChange={(e) =>
                    setFormData({ ...formData, totalSellEur: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>

              {profit && (
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Cost (EUR):</span> €
                    {profit.costEur.toFixed(2)}
                  </p>
                  <p
                    className={`text-sm font-bold mt-1 ${
                      profit.profit >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    Profit: €{profit.profit.toFixed(2)} ({profit.margin.toFixed(1)}%)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deposit Due (EUR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.depositDueEur}
                  onChange={(e) =>
                    setFormData({ ...formData, depositDueEur: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Balance Due (EUR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balanceDueEur}
                  onChange={(e) =>
                    setFormData({ ...formData, balanceDueEur: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>

              {balance !== null && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Calculated Balance:</span> €
                    {balance.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    (Total Sell - Deposit)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Any additional notes..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${locale}/bookings/${bookingId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateBooking.isPending}>
            {updateBooking.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
