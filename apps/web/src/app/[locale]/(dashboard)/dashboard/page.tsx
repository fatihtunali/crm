'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
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
  ListChecks,
  UserCircle,
  Package,
} from 'lucide-react';

export default function DashboardPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();

  const { data: leadStats, isLoading: leadStatsLoading } = useLeadStats();
  const { data: bookingStats, isLoading: bookingStatsLoading } = useBookingStats();
  const { data: clientPaymentStats, isLoading: clientPaymentLoading } = useClientPaymentStats();
  const { data: vendorPaymentStats } = useVendorPaymentStats();
  const { data: invoiceStats } = useInvoiceStats();
  const { data: webhookStats } = useWebhookStats();
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
  const totalWebhooks = webhookStats?.statusStats?.reduce((sum, stat) => sum + (stat._count?.id || 0), 0) || 0;
  const successWebhooks = webhookStats?.statusStats?.find((s) => s.status === 'SUCCESS')?._count?.id || 0;
  const webhookSuccessRate =
    totalWebhooks > 0 ? ((successWebhooks / totalWebhooks) * 100).toFixed(1) : '0';

  // Check if we have any data at all
  const hasAnyData = totalLeads > 0 || totalBookings > 0 || totalClientPayments > 0 || totalInvoiceAmount > 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Welcome back, <span className="font-semibold text-indigo-600">{user?.name}</span>
        </p>
      </div>

      {/* Empty State */}
      {!hasAnyData && (
        <Card className="mb-8">
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

      {/* Uniform Grid of Clickable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Leads Card */}
        <Link href={`/${locale}/leads`} className="block">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Leads</span>
                <Users className="h-5 w-5 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalLeads}</div>
              <p className="text-sm text-gray-600 mb-3">
                {wonLeads} won ({totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(0) : 0}%)
              </p>
              <div className="flex items-center text-indigo-600 text-sm font-medium">
                Manage Leads <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Bookings Card */}
        <Link href={`/${locale}/bookings`} className="block">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Bookings</span>
                <Calendar className="h-5 w-5 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalBookings}</div>
              <p className="text-sm text-gray-600 mb-3">{confirmedBookings} confirmed</p>
              <div className="flex items-center text-indigo-600 text-sm font-medium">
                View Bookings <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Clients Card */}
        <Link href={`/${locale}/clients`} className="block">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Clients</span>
                <UserCircle className="h-5 w-5 text-cyan-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">-</div>
              <p className="text-sm text-gray-600 mb-3">Manage your clients</p>
              <div className="flex items-center text-indigo-600 text-sm font-medium">
                View Clients <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Suppliers Card */}
        <Link href={`/${locale}/suppliers`} className="block">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Suppliers</span>
                <Package className="h-5 w-5 text-orange-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">-</div>
              <p className="text-sm text-gray-600 mb-3">Manage your suppliers</p>
              <div className="flex items-center text-indigo-600 text-sm font-medium">
                View Suppliers <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tours Card */}
        <Link href={`/${locale}/tours`} className="block">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Tours</span>
                <ListChecks className="h-5 w-5 text-teal-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">-</div>
              <p className="text-sm text-gray-600 mb-3">Manage tour packages</p>
              <div className="flex items-center text-indigo-600 text-sm font-medium">
                View Tours <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Quotations Card */}
        <Link href={`/${locale}/quotations`} className="block">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Quotations</span>
                <FileText className="h-5 w-5 text-pink-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">-</div>
              <p className="text-sm text-gray-600 mb-3">Manage quotations</p>
              <div className="flex items-center text-indigo-600 text-sm font-medium">
                View Quotations <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Client Payments Card */}
        <Link href={`/${locale}/payments`} className="block">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Client Payments</span>
                <CreditCard className="h-5 w-5 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                €{totalClientPayments.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {clientPaymentStats?.reduce((sum, stat) => sum + stat._count.id, 0) || 0} payments
              </p>
              <div className="flex items-center text-indigo-600 text-sm font-medium">
                View Payments <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Vendor Payments Card */}
        <Link href={`/${locale}/payments`} className="block">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Vendor Payments</span>
                <Wallet className="h-5 w-5 text-amber-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₺{totalVendorPayments.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {vendorPaymentStats?.reduce((sum, stat) => sum + stat._count.id, 0) || 0} payments
              </p>
              <div className="flex items-center text-indigo-600 text-sm font-medium">
                View Payments <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Invoices Card */}
        <Link href={`/${locale}/invoices`} className="block">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Invoices</span>
                <FileText className="h-5 w-5 text-red-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                €{totalInvoiceAmount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {invoiceStats?.reduce((sum, stat) => sum + stat._count.id, 0) || 0} invoices
              </p>
              <div className="flex items-center text-indigo-600 text-sm font-medium">
                View Invoices <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* P&L Reports Card */}
        <Link href={`/${locale}/reports`} className="block">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Profit & Loss</span>
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pnlLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    €{pnlReport?.profit.netProfitEur.toLocaleString() || '0'}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {pnlReport?.profit.profitMarginPct.toFixed(1) || '0'}% margin
                  </p>
                  <div className="flex items-center text-indigo-600 text-sm font-medium">
                    View Reports <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Revenue Card */}
        <Link href={`/${locale}/reports`} className="block">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Total Revenue</span>
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pnlLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    €{pnlReport?.revenue.totalEur.toLocaleString() || '0'}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {pnlReport?.revenue.transactionCount || 0} transactions
                  </p>
                  <div className="flex items-center text-indigo-600 text-sm font-medium">
                    View Analytics <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Webhooks Card */}
        <Link href={`/${locale}/webhooks`} className="block">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Webhooks</span>
                <Webhook className="h-5 w-5 text-violet-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {webhookSuccessRate}%
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {successWebhooks}/{totalWebhooks} successful
              </p>
              <div className="flex items-center text-indigo-600 text-sm font-medium">
                View Webhooks <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Files Card */}
        <Link href={`/${locale}/files`} className="block">
          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Files</span>
                <Upload className="h-5 w-5 text-sky-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">-</div>
              <p className="text-sm text-gray-600 mb-3">Documents & uploads</p>
              <div className="flex items-center text-indigo-600 text-sm font-medium">
                Manage Files <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
