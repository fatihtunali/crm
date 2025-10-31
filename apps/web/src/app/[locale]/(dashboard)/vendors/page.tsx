'use client';

import { useState } from 'react';
import { useVendors, useDeleteVendor } from '@/lib/api/hooks/use-vendors';
import { VendorType } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const vendorTypeColors: Record<VendorType, string> = {
  HOTEL: 'bg-blue-100 text-blue-800',
  TRANSPORT: 'bg-green-100 text-green-800',
  GUIDE: 'bg-purple-100 text-purple-800',
  ACTIVITY: 'bg-orange-100 text-orange-800',
};

export default function VendorsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<VendorType | undefined>();

  const { data: vendorsData, isLoading } = useVendors({
    page,
    limit: 20,
    ...(search && { search }),
    ...(typeFilter && { type: typeFilter }),
  });

  const deleteVendor = useDeleteVendor();

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to deactivate vendor "${name}"?`)) {
      await deleteVendor.mutateAsync(id);
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
          <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-700 mt-1 text-base">
            Manage your tour service providers
          </p>
        </div>
        <Link href={`/${locale}/vendors/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Vendor
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
              placeholder="Search vendors by name, contact, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Type Filter Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {(['HOTEL', 'TRANSPORT', 'GUIDE', 'ACTIVITY'] as VendorType[]).map((type) => (
          <Card
            key={type}
            className={cn(
              'cursor-pointer hover:shadow-xl transition-all duration-200 border-2',
              typeFilter === type ? 'ring-4 ring-yellow-400 shadow-xl' : '',
              type === 'HOTEL' && 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100',
              type === 'TRANSPORT' && 'border-green-300 bg-gradient-to-br from-green-50 to-green-100',
              type === 'GUIDE' && 'border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100',
              type === 'ACTIVITY' && 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100'
            )}
            onClick={() => setTypeFilter(typeFilter === type ? undefined : type)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-800">
                {type}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {vendorsData?.data.filter((v) => v.type === type).length || 0}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Total Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {vendorsData?.meta.total || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
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
                    Type
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Contact
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Phone
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Email
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vendorsData?.data.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {vendor.name}
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          vendorTypeColors[vendor.type]
                        }`}
                      >
                        {vendor.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {vendor.contactName || '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {vendor.phone || '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {vendor.email || '-'}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex gap-2">
                        <Link href={`/${locale}/vendors/${vendor.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(vendor.id, vendor.name)}
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
          {vendorsData && vendorsData.meta.totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="text-sm text-gray-700 font-medium">
                Showing {vendorsData.data.length} of {vendorsData.meta.total} vendors
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
                  disabled={page === vendorsData.meta.totalPages}
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
