'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useBookings } from '@/lib/api/hooks/use-bookings';
// import { useVendors } from '@/lib/api/hooks/use-vendors'; // Legacy - not implemented
import {
  useCreateClientPayment,
  useCreateVendorPayment,
} from '@/lib/api/hooks/use-payments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Users, Building2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PaymentMethod, PaymentStatus } from '@/lib/api/types';

type PaymentType = 'client' | 'vendor';

export default function NewPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  const [paymentType, setPaymentType] = useState<PaymentType>(
    (searchParams?.get('type') as PaymentType) || 'client'
  );

  // Client payment form state
  const [clientForm, setClientForm] = useState({
    bookingId: '',
    amountEur: '',
    method: 'BANK_TRANSFER' as PaymentMethod,
    paidAt: new Date().toISOString().split('T')[0],
    txnRef: '',
    status: 'COMPLETED' as PaymentStatus,
    notes: '',
  });

  // Vendor payment form state
  const [vendorForm, setVendorForm] = useState({
    bookingId: '',
    vendorId: '',
    amountTry: '',
    dueAt: new Date().toISOString().split('T')[0],
    paidAt: '',
    status: 'PENDING' as PaymentStatus,
    notes: '',
  });

  const { data: bookingsData } = useBookings({ page: 1, limit: 100 });
  // const { data: vendorsData } = useVendors({ page: 1, limit: 100 }); // Legacy - not implemented
  const vendorsData: { data: Array<{ id: number; name: string; type: string }> } = { data: [] }; // Stub for now - vendor system deprecated
  const createClientPayment = useCreateClientPayment();
  const createVendorPayment = useCreateVendorPayment();

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createClientPayment.mutateAsync({
        bookingId: parseInt(clientForm.bookingId),
        amountEur: parseFloat(clientForm.amountEur),
        method: clientForm.method,
        paidAt: new Date(clientForm.paidAt).toISOString(),
        txnRef: clientForm.txnRef || undefined,
        status: clientForm.status,
        notes: clientForm.notes || undefined,
      });

      router.push(`/${locale}/payments`);
    } catch (error) {
      console.error('Failed to create client payment:', error);
      alert('Failed to create payment. Please try again.');
    }
  };

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createVendorPayment.mutateAsync({
        bookingId: parseInt(vendorForm.bookingId),
        vendorId: parseInt(vendorForm.vendorId),
        amountTry: parseFloat(vendorForm.amountTry),
        dueAt: new Date(vendorForm.dueAt).toISOString(),
        paidAt: vendorForm.paidAt ? new Date(vendorForm.paidAt).toISOString() : undefined,
        status: vendorForm.status,
        notes: vendorForm.notes || undefined,
      });

      router.push(`/${locale}/payments`);
    } catch (error) {
      console.error('Failed to create vendor payment:', error);
      alert('Failed to create payment. Please try again.');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/${locale}/payments`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payments
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Payment</h1>
        <p className="text-gray-700 mt-1 text-base">
          Record a new payment transaction
        </p>
      </div>

      {/* Payment Type Toggle */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          className={cn(
            'px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2',
            paymentType === 'client'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
          onClick={() => setPaymentType('client')}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Client Payment
          </div>
        </button>
        <button
          className={cn(
            'px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2',
            paymentType === 'vendor'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
          onClick={() => setPaymentType('vendor')}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Vendor Payment
          </div>
        </button>
      </div>

      {/* Client Payment Form */}
      {paymentType === 'client' && (
        <Card>
          <CardHeader>
            <CardTitle>Client Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client-booking">Booking *</Label>
                  <select
                    id="client-booking"
                    value={clientForm.bookingId}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, bookingId: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select booking...</option>
                    {bookingsData?.data.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        {booking.bookingCode} - {booking.client?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="client-amount">Amount (EUR) *</Label>
                  <Input
                    id="client-amount"
                    type="number"
                    step="0.01"
                    value={clientForm.amountEur}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, amountEur: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="client-method">Payment Method *</Label>
                  <select
                    id="client-method"
                    value={clientForm.method}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, method: e.target.value as PaymentMethod })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="CASH">Cash</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="ONLINE">Online</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="client-paid-at">Paid Date *</Label>
                  <Input
                    id="client-paid-at"
                    type="date"
                    value={clientForm.paidAt}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, paidAt: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="client-txn-ref">Transaction Reference</Label>
                  <Input
                    id="client-txn-ref"
                    type="text"
                    value={clientForm.txnRef}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, txnRef: e.target.value })
                    }
                    placeholder="e.g., TXN123456"
                  />
                </div>

                <div>
                  <Label htmlFor="client-status">Status *</Label>
                  <select
                    id="client-status"
                    value={clientForm.status}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, status: e.target.value as PaymentStatus })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="client-notes">Notes</Label>
                <Textarea
                  id="client-notes"
                  value={clientForm.notes}
                  onChange={(e) =>
                    setClientForm({ ...clientForm, notes: e.target.value })
                  }
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Link href={`/${locale}/payments`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={createClientPayment.isPending}
                >
                  {createClientPayment.isPending ? 'Creating...' : 'Create Payment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Vendor Payment Form */}
      {paymentType === 'vendor' && (
        <Card>
          <CardHeader>
            <CardTitle>Vendor Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVendorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor-booking">Booking *</Label>
                  <select
                    id="vendor-booking"
                    value={vendorForm.bookingId}
                    onChange={(e) =>
                      setVendorForm({ ...vendorForm, bookingId: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select booking...</option>
                    {bookingsData?.data.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        {booking.bookingCode} - {booking.client?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="vendor-vendor">Vendor *</Label>
                  <select
                    id="vendor-vendor"
                    value={vendorForm.vendorId}
                    onChange={(e) =>
                      setVendorForm({ ...vendorForm, vendorId: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select vendor...</option>
                    {vendorsData?.data.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name} ({vendor.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="vendor-amount">Amount (TRY) *</Label>
                  <Input
                    id="vendor-amount"
                    type="number"
                    step="0.01"
                    value={vendorForm.amountTry}
                    onChange={(e) =>
                      setVendorForm({ ...vendorForm, amountTry: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="vendor-due-at">Due Date *</Label>
                  <Input
                    id="vendor-due-at"
                    type="date"
                    value={vendorForm.dueAt}
                    onChange={(e) =>
                      setVendorForm({ ...vendorForm, dueAt: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="vendor-paid-at">Paid Date (optional)</Label>
                  <Input
                    id="vendor-paid-at"
                    type="date"
                    value={vendorForm.paidAt}
                    onChange={(e) =>
                      setVendorForm({ ...vendorForm, paidAt: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="vendor-status">Status *</Label>
                  <select
                    id="vendor-status"
                    value={vendorForm.status}
                    onChange={(e) =>
                      setVendorForm({ ...vendorForm, status: e.target.value as PaymentStatus })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="vendor-notes">Notes</Label>
                <Textarea
                  id="vendor-notes"
                  value={vendorForm.notes}
                  onChange={(e) =>
                    setVendorForm({ ...vendorForm, notes: e.target.value })
                  }
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Link href={`/${locale}/payments`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={createVendorPayment.isPending}
                >
                  {createVendorPayment.isPending ? 'Creating...' : 'Create Payment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
