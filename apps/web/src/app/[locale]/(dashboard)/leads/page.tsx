'use client';

import { useState } from 'react';
import { useLeads, useLeadStats } from '@/lib/api/hooks/use-leads';
import { LeadStatus } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const statusColors: Record<LeadStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUOTED: 'bg-purple-100 text-purple-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
};

export default function LeadsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>();

  const { data: leadsData, isLoading } = useLeads({
    page,
    limit: 20,
    status: statusFilter,
  });

  const { data: stats } = useLeadStats();

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-700 mt-1 text-base">
            Manage potential customers and inquiries
          </p>
        </div>
        <Link href={`/${locale}/leads/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Lead
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          {stats.map((stat) => (
            <Card
              key={stat.status}
              className={cn(
                'cursor-pointer hover:shadow-xl transition-all duration-200 border-2',
                statusFilter === stat.status ? 'ring-4 ring-yellow-400 shadow-xl' : '',
                stat.status === 'NEW' && 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100',
                stat.status === 'CONTACTED' && 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100',
                stat.status === 'QUOTED' && 'border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100',
                stat.status === 'WON' && 'border-green-300 bg-gradient-to-br from-green-50 to-green-100',
                stat.status === 'LOST' && 'border-red-300 bg-gradient-to-br from-red-50 to-red-100'
              )}
              onClick={() =>
                setStatusFilter(
                  statusFilter === stat.status ? undefined : stat.status
                )
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-800">
                  {stat.status}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gradient-to-r from-indigo-500 to-purple-600">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Inquiry Date
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Destination
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">Pax</th>
                  <th className="p-4 text-left text-sm font-semibold text-white">Budget</th>
                  <th className="p-4 text-left text-sm font-semibold text-white">Source</th>
                  <th className="p-4 text-left text-sm font-semibold text-white">Status</th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leadsData?.data.map((lead) => (
                  <tr key={lead.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {new Date(lead.inquiryDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">{lead.destination || '-'}</td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {lead.paxAdults + lead.paxChildren}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {lead.budgetEur
                        ? `€${lead.budgetEur.toLocaleString()}`
                        : '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">{lead.source || '-'}</td>
                    <td className="p-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          statusColors[lead.status]
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <Link href={`/${locale}/leads/${lead.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {leadsData && leadsData.meta.totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="text-sm text-gray-700 font-medium">
                Showing {leadsData.data.length} of {leadsData.meta.total} leads
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
                  disabled={page === leadsData.meta.totalPages}
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
