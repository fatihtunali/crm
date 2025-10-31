'use client';

import { useState } from 'react';
import {
  usePnLReport,
  useRevenueReport,
  useLeadsReport,
} from '@/lib/api/hooks/use-reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
  }>({});

  const { data: pnlData, isLoading: pnlLoading } = usePnLReport(appliedFilters);
  const { data: revenueData, isLoading: revenueLoading } =
    useRevenueReport(appliedFilters);
  const { data: leadsData, isLoading: leadsLoading } =
    useLeadsReport(appliedFilters);

  const handleApplyFilters = () => {
    setAppliedFilters({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setAppliedFilters({});
  };

  const isLoading = pnlLoading || revenueLoading || leadsLoading;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-700 mt-1 text-base">
          Financial reports, revenue analysis, and lead conversion metrics
        </p>
      </div>

      {/* Date Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Range Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
          {appliedFilters.dateFrom || appliedFilters.dateTo ? (
            <p className="text-sm text-gray-600 mt-2">
              Active filter:{' '}
              {appliedFilters.dateFrom &&
                new Date(appliedFilters.dateFrom).toLocaleDateString()}{' '}
              {appliedFilters.dateFrom && appliedFilters.dateTo && '→'}{' '}
              {appliedFilters.dateTo &&
                new Date(appliedFilters.dateTo).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-2">
              Showing all-time data. Apply filters to narrow down the period.
            </p>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profit & Loss Report */}
          {pnlData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Profit & Loss Report
                </CardTitle>
                {pnlData.period && (
                  <p className="text-sm text-gray-500">
                    Period: {new Date(pnlData.period.from).toLocaleDateString()}{' '}
                    - {new Date(pnlData.period.to).toLocaleDateString()}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Revenue */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Revenue</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">
                      €{pnlData.revenue.totalEur.toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      {pnlData.revenue.transactionCount} transaction
                      {pnlData.revenue.transactionCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Costs */}
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-red-900">Costs</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-900">
                      €{pnlData.costs.totalEur.toLocaleString()}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      ₺{pnlData.costs.totalTry.toLocaleString()} (
                      {pnlData.costs.transactionCount} transaction
                      {pnlData.costs.transactionCount !== 1 ? 's' : ''})
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Exchange rate: {pnlData.costs.exchangeRateUsed.toFixed(4)}
                    </p>
                  </div>

                  {/* Profit */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-900">Net Profit</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-900">
                      €{pnlData.profit.netProfitEur.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      {pnlData.profit.profitMarginPct.toFixed(1)}% margin
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revenue Report */}
          {revenueData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-indigo-600" />
                  Revenue Report
                </CardTitle>
                {revenueData.period && (
                  <p className="text-sm text-gray-500">
                    Period:{' '}
                    {new Date(revenueData.period.from).toLocaleDateString()} -{' '}
                    {new Date(revenueData.period.to).toLocaleDateString()}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm font-medium text-indigo-700">
                      Total Bookings Value
                    </p>
                    <p className="text-2xl font-bold text-indigo-900">
                      €{revenueData.summary.totalBookingsValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-700">
                      Total Received
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      €{revenueData.summary.totalReceivedEur.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">
                      Total Bookings
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {revenueData.summary.totalBookingsCount}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* By Payment Status */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      By Payment Status
                    </h3>
                    <div className="space-y-2">
                      {revenueData.byPaymentStatus.map((item) => (
                        <div
                          key={item.status}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <div>
                            <span className="font-medium text-gray-900">
                              {item.status}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              ({item.count})
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            €{item.amountEur.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Booking Status */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      By Booking Status
                    </h3>
                    <div className="space-y-2">
                      {revenueData.byBookingStatus.map((item) => (
                        <div
                          key={item.status}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <div>
                            <span className="font-medium text-gray-900">
                              {item.status}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              ({item.count})
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            €{item.valueEur.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leads Report */}
          {leadsData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Leads Report
                </CardTitle>
                {leadsData.period && (
                  <p className="text-sm text-gray-500">
                    Period: {new Date(leadsData.period.from).toLocaleDateString()}{' '}
                    - {new Date(leadsData.period.to).toLocaleDateString()}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs font-medium text-purple-700">
                      Total Leads
                    </p>
                    <p className="text-xl font-bold text-purple-900">
                      {leadsData.summary.totalLeads}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs font-medium text-green-700">Won</p>
                    <p className="text-xl font-bold text-green-900">
                      {leadsData.summary.wonLeads}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-xs font-medium text-red-700">Lost</p>
                    <p className="text-xl font-bold text-red-900">
                      {leadsData.summary.lostLeads}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-medium text-blue-700">
                      Conversion Rate
                    </p>
                    <p className="text-xl font-bold text-blue-900">
                      {leadsData.summary.conversionRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs font-medium text-indigo-700">
                      Avg Budget
                    </p>
                    <p className="text-xl font-bold text-indigo-900">
                      €{leadsData.summary.averageBudgetEur.toFixed(0)}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs font-medium text-yellow-700">
                      With Quotes
                    </p>
                    <p className="text-xl font-bold text-yellow-900">
                      {leadsData.summary.leadsWithQuotations}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* By Status */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      By Status
                    </h3>
                    <div className="space-y-2">
                      {leadsData.byStatus.map((item) => (
                        <div
                          key={item.status}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">
                                {item.status}
                              </span>
                              <span className="text-sm text-gray-600">
                                {item.count} ({item.percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Source */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      By Source
                    </h3>
                    <div className="space-y-2">
                      {leadsData.bySource.map((item) => (
                        <div
                          key={item.source}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">
                                {item.source || 'Unknown'}
                              </span>
                              <span className="text-sm text-gray-600">
                                {item.count} ({item.percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
