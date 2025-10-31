'use client';

import { useState } from 'react';
import { useServiceOfferings, useDeleteServiceOffering } from '@/lib/api/hooks/use-suppliers';
import { ServiceType } from '@/lib/api/endpoints/suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Trash2, Edit, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function TransfersPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { data: offerings, isLoading } = useServiceOfferings({
    serviceType: ServiceType.TRANSFER,
    includeInactive: showInactive,
  });

  const deleteOffering = useDeleteServiceOffering();

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Are you sure you want to deactivate "${title}"?`)) {
      await deleteOffering.mutateAsync(id);
    }
  };

  const filteredOfferings = offerings?.data?.filter((offering) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      offering.title?.toLowerCase().includes(searchLower) ||
      offering.location?.toLowerCase().includes(searchLower) ||
      offering.supplier?.party?.name?.toLowerCase().includes(searchLower)
    );
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Transfers</h1>
          <p className="text-gray-700 mt-1 text-base">
            Manage your transfer service offerings
          </p>
        </div>
        <Link href={`/${locale}/catalog/new?type=${ServiceType.TRANSFER}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Transfer
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by title, location, or supplier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showInactive ? 'default' : 'outline'}
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? 'Hide' : 'Show'} Inactive
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{filteredOfferings?.length || 0} Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOfferings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No transfers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOfferings?.map((offering) => (
                  <TableRow key={offering.id}>
                    <TableCell>
                      <div className="font-medium">{offering.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{offering.supplier?.party?.name}</div>
                        <div className="text-gray-500">
                          {offering.supplier?.type?.replace('_', ' ')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{offering.location || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {offering.description?.substring(0, 50)}
                        {offering.description && offering.description.length > 50 ? '...' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={offering.isActive ? 'default' : 'secondary'}>
                        {offering.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/${locale}/catalog/${offering.id}/rates`}>
                          <Button variant="ghost" size="sm" title="Manage Rates">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/${locale}/catalog/${offering.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(offering.id, offering.title)}
                          disabled={!offering.isActive}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
