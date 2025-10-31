'use client';

import { useState } from 'react';
import { useClients, useDeleteClient } from '@/lib/api/hooks/use-clients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';

export default function ClientsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: clientsData, isLoading } = useClients({
    page,
    limit: 20,
    ...(search && { search }),  // Only include search if it's not empty
  });

  const deleteClient = useDeleteClient();

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to deactivate client "${name}"?`)) {
      await deleteClient.mutateAsync(id);
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
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-700 mt-1 text-base">
            Manage your customer database
          </p>
        </div>
        <Link href={`/${locale}/clients/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Client
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
              placeholder="Search clients by name, email, phone, or passport..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {clientsData?.meta.total || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gradient-to-r from-indigo-500 to-purple-600">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Name
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Email
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Phone
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Nationality
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Passport
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {clientsData?.data.map((client) => (
                  <tr key={client.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {client.name}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {client.email || '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {client.phone || '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {client.nationality || '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {client.passportNumber || '-'}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex gap-2">
                        <Link href={`/${locale}/clients/${client.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(client.id, client.name)}
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
          {clientsData && clientsData.meta.totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="text-sm text-gray-700 font-medium">
                Showing {clientsData.data.length} of {clientsData.meta.total} clients
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
                  disabled={page === clientsData.meta.totalPages}
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
