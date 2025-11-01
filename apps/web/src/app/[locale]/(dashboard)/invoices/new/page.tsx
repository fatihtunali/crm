'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBookings } from '@/lib/api/hooks/use-bookings';
import { useCreateInvoice } from '@/lib/api/hooks/use-invoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [form, setForm] = useState({
    bookingId: '',
    number: '',
    issueDate: new Date().toISOString().split('T')[0],
    currency: 'EUR',
    netAmount: '',
    vatRate: '20',
    vatAmount: '',
    grossAmount: '',
    pdfUrl: '',
  });

  const { data: bookingsData } = useBookings({ page: 1, limit: 100 });
  const createInvoice = useCreateInvoice();

  // Auto-calculate VAT and gross amounts when net amount or VAT rate changes
  useEffect(() => {
    if (form.netAmount && form.vatRate) {
      const net = parseFloat(form.netAmount);
      const rate = parseFloat(form.vatRate);

      if (!isNaN(net) && !isNaN(rate)) {
        const vat = (net * rate) / 100;
        const gross = net + vat;

        setForm((prev) => ({
          ...prev,
          vatAmount: vat.toFixed(2),
          grossAmount: gross.toFixed(2),
        }));
      }
    }
  }, [form.netAmount, form.vatRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createInvoice.mutateAsync({
        bookingId: parseInt(form.bookingId),
        number: form.number,
        issueDate: new Date(form.issueDate).toISOString(),
        currency: form.currency,
        netAmount: parseFloat(form.netAmount),
        vatRate: parseFloat(form.vatRate),
        vatAmount: parseFloat(form.vatAmount),
        grossAmount: parseFloat(form.grossAmount),
        pdfUrl: form.pdfUrl || undefined,
      });

      router.push(`/${locale}/invoices`);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('Failed to create invoice. Please try again.');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/${locale}/invoices`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Invoice</h1>
        <p className="text-gray-700 mt-1 text-base">
          Create a new invoice for a booking
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="booking">Booking *</Label>
                <select
                  id="booking"
                  value={form.bookingId}
                  onChange={(e) =>
                    setForm({ ...form, bookingId: e.target.value })
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
                <Label htmlFor="number">Invoice Number *</Label>
                <Input
                  id="number"
                  type="text"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  placeholder="INV-2024-001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={form.issueDate}
                  onChange={(e) =>
                    setForm({ ...form, issueDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency *</Label>
                <select
                  id="currency"
                  value={form.currency}
                  onChange={(e) =>
                    setForm({ ...form, currency: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="TRY">TRY</option>
                </select>
              </div>

              <div>
                <Label htmlFor="netAmount">Net Amount *</Label>
                <Input
                  id="netAmount"
                  type="number"
                  step="0.01"
                  value={form.netAmount}
                  onChange={(e) =>
                    setForm({ ...form, netAmount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="vatRate">VAT Rate (%) *</Label>
                <Input
                  id="vatRate"
                  type="number"
                  step="0.01"
                  value={form.vatRate}
                  onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
                  placeholder="20.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="vatAmount">VAT Amount *</Label>
                <Input
                  id="vatAmount"
                  type="number"
                  step="0.01"
                  value={form.vatAmount}
                  onChange={(e) =>
                    setForm({ ...form, vatAmount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated based on net amount and VAT rate
                </p>
              </div>

              <div>
                <Label htmlFor="grossAmount">Gross Amount *</Label>
                <Input
                  id="grossAmount"
                  type="number"
                  step="0.01"
                  value={form.grossAmount}
                  onChange={(e) =>
                    setForm({ ...form, grossAmount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated (Net + VAT)
                </p>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="pdfUrl">PDF URL (optional)</Label>
                <Input
                  id="pdfUrl"
                  type="url"
                  value={form.pdfUrl}
                  onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
                  placeholder="https://example.com/invoices/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link to externally stored invoice PDF
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Link href={`/${locale}/invoices`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={createInvoice.isPending}>
                {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
