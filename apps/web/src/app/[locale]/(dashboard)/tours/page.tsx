'use client';

import { useState } from 'react';
import { useTours, useDeleteTour } from '@/lib/api/hooks/use-tours';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';

export default function ToursPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: toursData, isLoading } = useTours({
    page,
    limit: 20,
    ...(search && { search }),
  });

  const deleteTour = useDeleteTour();

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to deactivate tour "${name}"?`)) {
      await deleteTour.mutateAsync(id);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Tours</h1>
          <p className="text-gray-700 mt-1 text-base">
            Manage your tour packages and itineraries
          </p>
        </div>
        <Link href={`/${locale}/tours/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Tour
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search tours by code, name, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Total Tours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {toursData?.meta.total || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Active Tours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {toursData?.data.filter((t) => t.isActive).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tours Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gradient-to-r from-indigo-500 to-purple-600">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Code
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Name
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Base Capacity
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Season
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Markup %
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
                {toursData?.data.map((tour) => (
                  <tr key={tour.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {tour.code}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {tour.name}
                    </td>
                    <td className="p-4 text-sm text-gray-800">
                      {tour.baseCapacity} pax
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {tour.seasonStart && tour.seasonEnd ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(tour.seasonStart).toLocaleDateString()} -{' '}
                            {new Date(tour.seasonEnd).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-800">
                      {tour.defaultMarkupPct}%
                    </td>
                    <td className="p-4 text-sm">
                      {tour.isActive ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex gap-2">
                        <Link href={`/${locale}/tours/${tour.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tour.id, tour.name)}
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
          {toursData && toursData.meta.totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="text-sm text-gray-700 font-medium">
                Showing {toursData.data.length} of {toursData.meta.total} tours
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
                  disabled={page === toursData.meta.totalPages}
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
