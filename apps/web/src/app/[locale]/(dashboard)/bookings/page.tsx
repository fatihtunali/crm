'use client';

import { useState } from 'react';
import {
  useBookings,
  useBookingStats,
  useDeleteBooking,
} from '@/lib/api/hooks/use-bookings';
import { BookingStatus } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Euro, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const statusColors: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
};

const statusCardColors: Record<BookingStatus, string> = {
  PENDING: 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100',
  CONFIRMED: 'border-green-300 bg-gradient-to-br from-green-50 to-green-100',
  CANCELLED: 'border-red-300 bg-gradient-to-br from-red-50 to-red-100',
  COMPLETED: 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100',
};

export default function BookingsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>();

  const { data: bookingsData, isLoading } = useBookings({
    page,
    limit: 20,
    ...(statusFilter && { status: statusFilter }),
  });

  const { data: stats } = useBookingStats();
  const deleteBooking = useDeleteBooking();

  const handleDelete = async (id: number, bookingCode: string) => {
    if (confirm(`Are you sure you want to delete booking "${bookingCode}"?`)) {
      await deleteBooking.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading...</p>
      </div>
    );
  }

  const getStatusCount = (status: BookingStatus) => {
    return stats?.find((s) => s.status === status)?.count || 0;
  };

  const totalRevenue = bookingsData?.data.reduce(
    (sum, booking) => sum + parseFloat(booking.totalSellEur.toString()),
    0
  ) || 0;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-700 mt-1 text-base">
            Manage confirmed tour bookings
          </p>
        </div>
        <Link href={`/${locale}/bookings/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </Link>
      </div>

      {/* Status Filter Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as BookingStatus[]).map(
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
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {bookingsData?.meta.total || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Revenue (Current Page)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              €{totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gradient-to-r from-indigo-500 to-purple-600">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Booking Code
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Client
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Dates
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Total (EUR)
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
                {bookingsData?.data.map((booking) => (
                  <tr key={booking.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {booking.bookingCode}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {booking.client?.name || 'N/A'}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(booking.startDate).toLocaleDateString()} -{' '}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-900 font-semibold">
                      €{parseFloat(booking.totalSellEur.toString()).toFixed(2)}
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          statusColors[booking.status]
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex gap-2">
                        <Link href={`/${locale}/bookings/${booking.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(booking.id, booking.bookingCode)}
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
          {bookingsData && bookingsData.meta.totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="text-sm text-gray-700 font-medium">
                Showing {bookingsData.data.length} of {bookingsData.meta.total} bookings
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
                  disabled={page === bookingsData.meta.totalPages}
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
