'use client';

import { useState } from 'react';
import {
  useWebhooks,
  useWebhookStats,
  useRetryWebhook,
} from '@/lib/api/hooks/use-webhooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Webhook,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Filter,
} from 'lucide-react';
import type { WebhookEventStatus, WebhookEventType } from '@/lib/api/types';

export default function WebhooksPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    provider?: string;
    eventType?: WebhookEventType;
    status?: WebhookEventStatus;
    dateFrom?: string;
    dateTo?: string;
    isVerified?: boolean;
  }>({});
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [selectedWebhook, setSelectedWebhook] = useState<number | null>(null);

  const { data: webhooksData, isLoading } = useWebhooks({
    page: currentPage,
    limit: 20,
    ...appliedFilters,
  });
  const { data: stats } = useWebhookStats();
  const retryWebhook = useRetryWebhook();

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setAppliedFilters({});
    setCurrentPage(1);
  };

  const handleRetry = async (id: number) => {
    try {
      await retryWebhook.mutateAsync(id);
      alert('Webhook retry initiated successfully');
    } catch (error) {
      console.error('Failed to retry webhook:', error);
      alert('Failed to retry webhook. Please try again.');
    }
  };

  const getStatusIcon = (status: WebhookEventStatus) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-gray-600" />;
      case 'PROCESSING':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'RETRY':
        return <RefreshCw className="h-5 w-5 text-orange-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: WebhookEventStatus) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'RETRY':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Webhook Events</h1>
        <p className="text-gray-700 mt-1 text-base">
          Monitor and manage incoming webhook events from payment providers
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && stats.statusStats && stats.statusStats.length > 0 && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.statusStats.map((stat) => {
            const totalCount = stats.statusStats.reduce((sum, s) => sum + (s._count?.id || 0), 0);
            const percentage = totalCount > 0 ? ((stat._count.id / totalCount) * 100) : 0;

            return (
              <Card key={stat.status}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    {getStatusIcon(stat.status)}
                    {stat.status}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat._count.id}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                type="text"
                value={filters.provider || ''}
                onChange={(e) =>
                  setFilters({ ...filters, provider: e.target.value })
                }
                placeholder="stripe, paypal..."
              />
            </div>

            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                id="eventType"
                value={filters.eventType || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    eventType: e.target.value as WebhookEventType,
                  })
                }
              >
                <option value="">All</option>
                <option value="PAYMENT_SUCCESS">Payment Success</option>
                <option value="PAYMENT_FAILED">Payment Failed</option>
                <option value="PAYMENT_PENDING">Payment Pending</option>
                <option value="REFUND_PROCESSED">Refund Processed</option>
                <option value="REFUND_FAILED">Refund Failed</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={filters.status || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value as WebhookEventStatus,
                  })
                }
              >
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="RETRY">Retry</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
            <Button onClick={handleClearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Provider
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Event Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Verified
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Retries
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {webhooksData?.data.map((webhook) => (
                  <tr key={webhook.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">#{webhook.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Webhook className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{webhook.provider}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{webhook.eventType}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          webhook.status
                        )}`}
                      >
                        {getStatusIcon(webhook.status)}
                        {webhook.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {webhook.isVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">{webhook.retryCount}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(webhook.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setSelectedWebhook(
                              selectedWebhook === webhook.id ? null : webhook.id
                            )
                          }
                        >
                          {selectedWebhook === webhook.id ? 'Hide' : 'Details'}
                        </Button>
                        {webhook.status === 'FAILED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetry(webhook.id)}
                            disabled={retryWebhook.isPending}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {selectedWebhook &&
                  webhooksData?.data.map(
                    (webhook) =>
                      webhook.id === selectedWebhook && (
                        <tr key={`details-${webhook.id}`}>
                          <td colSpan={8} className="p-4 bg-gray-50">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900">
                                Event Details
                              </h4>
                              {webhook.ipAddress && (
                                <p className="text-sm">
                                  <span className="font-medium">IP Address:</span>{' '}
                                  {webhook.ipAddress}
                                </p>
                              )}
                              {webhook.processedAt && (
                                <p className="text-sm">
                                  <span className="font-medium">Processed At:</span>{' '}
                                  {new Date(webhook.processedAt).toLocaleString()}
                                </p>
                              )}
                              {webhook.errorMessage && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-red-700">
                                    Error Message:
                                  </p>
                                  <p className="text-sm text-red-600 mt-1 p-2 bg-red-50 rounded">
                                    {webhook.errorMessage}
                                  </p>
                                </div>
                              )}
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">
                                  Payload:
                                </p>
                                <pre className="text-xs text-gray-600 mt-1 p-2 bg-white rounded border overflow-auto max-h-64">
                                  {JSON.stringify(webhook.payloadJson, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                  )}
              </tbody>
            </table>

            {webhooksData?.data.length === 0 && (
              <div className="text-center py-12">
                <Webhook className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No webhook events
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Webhook events will appear here when received from payment providers.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {webhooksData && webhooksData.meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {webhooksData.meta.page} of {webhooksData.meta.totalPages} (
                {webhooksData.meta.total} total)
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
                  disabled={currentPage >= webhooksData.meta.totalPages}
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
