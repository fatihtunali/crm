'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useLeadStats,
  useBookingStats,
  useClientPaymentStats,
  useVendorPaymentStats,
  useInvoiceStats,
  useWebhookStats,
  usePnLReport,
} from '@/lib/api/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Wallet,
  Webhook,
  DollarSign,
  ArrowRight,
  Loader2,
  BarChart3,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { data: leadStats, isLoading: leadStatsLoading } = useLeadStats();
  const { data: bookingStats, isLoading: bookingStatsLoading } = useBookingStats();
  const { data: clientPaymentStats, isLoading: clientPaymentLoading } = useClientPaymentStats();
  const { data: vendorPaymentStats, isLoading: vendorPaymentLoading } = useVendorPaymentStats();
  const { data: invoiceStats, isLoading: invoiceStatsLoading } = useInvoiceStats();
  const { data: webhookStats, isLoading: webhookStatsLoading } = useWebhookStats();
  const { data: pnlReport, isLoading: pnlLoading } = usePnLReport();

  // Show loading state while initial data is fetching
  const isInitialLoading = leadStatsLoading && bookingStatsLoading && clientPaymentLoading;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate total leads
  const totalLeads = leadStats?.reduce((sum, stat) => sum + stat.count, 0) || 0;
  const wonLeads = leadStats?.find((s) => s.status === 'WON')?.count || 0;

  // Calculate total bookings
  const totalBookings = bookingStats?.reduce((sum, stat) => sum + stat.count, 0) || 0;
  const confirmedBookings =
    bookingStats?.find((s) => s.status === 'CONFIRMED')?.count || 0;

  // Calculate total client payments
  const totalClientPayments =
    clientPaymentStats?.reduce(
      (sum, stat) => sum + (stat._sum.amountEur || 0),
      0
    ) || 0;

  // Calculate total vendor payments
  const totalVendorPayments =
    vendorPaymentStats?.reduce(
      (sum, stat) => sum + (stat._sum.amountTry || 0),
      0
    ) || 0;

  // Calculate total invoices
  const totalInvoiceAmount =
    invoiceStats?.reduce((sum, stat) => sum + (stat._sum.grossAmount || 0), 0) || 0;

  // Calculate webhook success rate
  const totalWebhooks = webhookStats?.reduce((sum, stat) => sum + stat.count, 0) || 0;
  const successWebhooks = webhookStats?.find((s) => s.status === 'SUCCESS')?.count || 0;
  const webhookSuccessRate =
    totalWebhooks > 0 ? ((successWebhooks / totalWebhooks) * 100).toFixed(1) : '0';

  // Check if we have any data at all
  const hasAnyData = totalLeads > 0 || totalBookings > 0 || totalClientPayments > 0 || totalInvoiceAmount > 0;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-700 mt-1 text-base">
          Welcome to your CRM overview - all key metrics at a glance
        </p>
      </div>

      {/* Empty State */}
      {!hasAnyData && (
        <Card className="mb-6">
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Data Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Get started by creating leads, bookings, or processing payments to see your dashboard metrics.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={`/${locale}/leads`}>
                <Button>Create Lead</Button>
              </Link>
              <Link href={`/${locale}/bookings`}>
                <Button variant="outline">Create Booking</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Total Revenue (P&L)</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pnlLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900">
                  €{pnlReport?.revenue.totalEur.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {pnlReport?.revenue.transactionCount || 0} transactions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Net Profit</span>
              <DollarSign className="h-5 w-5 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pnlLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900">
                  €{pnlReport?.profit.netProfitEur.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {pnlReport?.profit.profitMarginPct.toFixed(1) || '0'}% margin
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Bookings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Confirmed Bookings</span>
              <Calendar className="h-5 w-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {confirmedBookings}
            </div>
            <p className="text-xs text-gray-500 mt-1">{totalBookings} total</p>
          </CardContent>
        </Card>

        {/* Won Leads */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Won Leads</span>
              <Users className="h-5 w-5 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{wonLeads}</div>
            <p className="text-xs text-gray-500 mt-1">{totalLeads} total leads</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Lead Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lead Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leadStats?.map((stat) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'WON':
                      return 'bg-green-500';
                    case 'LOST':
                      return 'bg-red-500';
                    case 'QUOTED':
                      return 'bg-blue-500';
                    case 'CONTACTED':
                      return 'bg-yellow-500';
                    default:
                      return 'bg-gray-500';
                  }
                };

                const percentage =
                  totalLeads > 0 ? (stat.count / totalLeads) * 100 : 0;

                return (
                  <div key={stat.status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        {stat.status}
                      </span>
                      <span className="text-gray-600">
                        {stat.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${getStatusColor(stat.status)} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <Link href={`/${locale}/leads`}>
              <Button variant="outline" className="w-full mt-4">
                View All Leads <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Booking Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookingStats?.map((stat) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'CONFIRMED':
                      return 'bg-green-500';
                    case 'COMPLETED':
                      return 'bg-blue-500';
                    case 'CANCELLED':
                      return 'bg-red-500';
                    default:
                      return 'bg-yellow-500';
                  }
                };

                const percentage =
                  totalBookings > 0 ? (stat.count / totalBookings) * 100 : 0;

                return (
                  <div key={stat.status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        {stat.status}
                      </span>
                      <span className="text-gray-600">
                        {stat.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${getStatusColor(stat.status)} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <Link href={`/${locale}/bookings`}>
              <Button variant="outline" className="w-full mt-4">
                View All Bookings <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Client Payments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Client Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              €{totalClientPayments.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {clientPaymentStats?.reduce((sum, stat) => sum + stat._count.id, 0) || 0}{' '}
              payments
            </p>
            <Link href={`/${locale}/payments`}>
              <Button size="sm" variant="link" className="mt-2 p-0">
                View Details <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Vendor Payments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Vendor Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₺{totalVendorPayments.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {vendorPaymentStats?.reduce((sum, stat) => sum + stat._count.id, 0) || 0}{' '}
              payments
            </p>
            <Link href={`/${locale}/payments`}>
              <Button size="sm" variant="link" className="mt-2 p-0">
                View Details <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              €{totalInvoiceAmount.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {invoiceStats?.reduce((sum, stat) => sum + stat._count.id, 0) || 0}{' '}
              invoices
            </p>
            <Link href={`/${locale}/invoices`}>
              <Button size="sm" variant="link" className="mt-2 p-0">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhook Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {webhookSuccessRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {successWebhooks}/{totalWebhooks} successful
            </p>
            <Link href={`/${locale}/webhooks`}>
              <Button size="sm" variant="link" className="mt-2 p-0">
                View Events <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Reports */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Analytics & Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View detailed P&L reports, revenue analysis, and lead conversion
              metrics
            </p>
            <Link href={`/${locale}/reports`}>
              <Button className="w-full">
                View Reports <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Files */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              File Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Upload, manage, and download documents, invoices, and contracts
            </p>
            <Link href={`/${locale}/files`}>
              <Button className="w-full">
                Manage Files <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Webhook Monitoring */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-purple-600" />
              Webhook Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Monitor payment webhooks, track events, and retry failed
              notifications
            </p>
            <Link href={`/${locale}/webhooks`}>
              <Button className="w-full">
                View Webhooks <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
