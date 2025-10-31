'use client';

import { useParams, useRouter } from 'next/navigation';
import { useBooking, useBookingPnL } from '@/lib/api/hooks/use-bookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Edit,
  User,
  Calendar,
  Euro,
  TrendingUp,
  FileText,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { BookingStatus } from '@/lib/api/types';

const statusColors: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const bookingId = parseInt(params.id as string);

  const { data: booking, isLoading } = useBooking(bookingId);
  const { data: pnl } = useBookingPnL(bookingId);

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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {booking.bookingCode}
            </h1>
            <p className="text-gray-700 mt-1 text-base">Booking Details</p>
          </div>
        </div>
        <Link href={`/${locale}/bookings/${booking.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Client Name
              </label>
              <p className="text-gray-900 mt-1">
                {booking.client?.name || 'N/A'}
              </p>
            </div>
            {booking.client?.email && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-gray-900 mt-1">{booking.client.email}</p>
              </div>
            )}
            {booking.client?.phone && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Phone</label>
                <p className="text-gray-900 mt-1">{booking.client.phone}</p>
              </div>
            )}
            {booking.quotationId && (
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Related Quotation
                </label>
                <p className="text-gray-900 mt-1">
                  <Link
                    href={`/${locale}/quotations/${booking.quotationId}`}
                    className="text-indigo-600 hover:underline"
                  >
                    #{booking.quotationId}
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Start Date
              </label>
              <p className="text-gray-900 mt-1">
                {new Date(booking.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">End Date</label>
              <p className="text-gray-900 mt-1">
                {new Date(booking.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Duration
              </label>
              <p className="text-gray-900 mt-1">
                {Math.ceil(
                  (new Date(booking.endDate).getTime() -
                    new Date(booking.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Status</label>
              <p className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    statusColors[booking.status]
                  }`}
                >
                  {booking.status}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Total Selling Price
              </label>
              <p className="text-gray-900 mt-1 text-2xl font-bold text-green-600">
                €{parseFloat(booking.totalSellEur.toString()).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Deposit Due
              </label>
              <p className="text-gray-900 mt-1">
                €{parseFloat(booking.depositDueEur.toString()).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Balance Due
              </label>
              <p className="text-gray-900 mt-1">
                €{parseFloat(booking.balanceDueEur.toString()).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Total Cost (TRY)
              </label>
              <p className="text-gray-900 mt-1">
                ₺{parseFloat(booking.totalCostTry.toString()).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Locked Exchange Rate
              </label>
              <p className="text-gray-900 mt-1">
                {parseFloat(booking.lockedExchangeRate.toString()).toFixed(4)} TRY/EUR
              </p>
            </div>
          </CardContent>
        </Card>

        {/* P&L Information */}
        {pnl && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Profit & Loss
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Total Revenue (EUR)
                </label>
                <p className="text-gray-900 mt-1">
                  €{pnl.totalRevenueEur.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Total Cost (TRY)
                </label>
                <p className="text-gray-900 mt-1">
                  ₺{pnl.totalCostTry.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Total Cost (EUR)
                </label>
                <p className="text-gray-900 mt-1">
                  €{pnl.totalCostEur.toFixed(2)}
                </p>
              </div>
              <div className="border-t pt-4">
                <label className="text-sm font-semibold text-gray-600">
                  Profit/Loss
                </label>
                <p
                  className={`text-gray-900 mt-1 text-2xl font-bold ${
                    pnl.profitLossEur >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  €{pnl.profitLossEur.toFixed(2)} ({pnl.marginPercent.toFixed(1)}%)
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Items Count
                </label>
                <p className="text-gray-900 mt-1">{pnl.itemsCount} items</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Items */}
        {booking.items && booking.items.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Booking Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="p-2 text-left text-sm font-semibold text-gray-700">
                        Type
                      </th>
                      <th className="p-2 text-left text-sm font-semibold text-gray-700">
                        Vendor
                      </th>
                      <th className="p-2 text-right text-sm font-semibold text-gray-700">
                        Qty
                      </th>
                      <th className="p-2 text-right text-sm font-semibold text-gray-700">
                        Cost (TRY)
                      </th>
                      <th className="p-2 text-right text-sm font-semibold text-gray-700">
                        Price (EUR)
                      </th>
                      <th className="p-2 text-left text-sm font-semibold text-gray-700">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {booking.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2 text-sm text-gray-800">
                          {item.itemType}
                        </td>
                        <td className="p-2 text-sm text-gray-800">
                          {item.vendor?.name || '-'}
                        </td>
                        <td className="p-2 text-right text-sm text-gray-800">
                          {item.qty}
                        </td>
                        <td className="p-2 text-right text-sm text-gray-800">
                          ₺{parseFloat(item.unitCostTry.toString()).toFixed(2)}
                        </td>
                        <td className="p-2 text-right text-sm text-gray-800">
                          €{parseFloat(item.unitPriceEur.toString()).toFixed(2)}
                        </td>
                        <td className="p-2 text-sm text-gray-600">
                          {item.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {booking.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">{booking.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Created At
              </label>
              <p className="text-gray-900 mt-1">
                {new Date(booking.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Last Updated
              </label>
              <p className="text-gray-900 mt-1">
                {new Date(booking.updatedAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
