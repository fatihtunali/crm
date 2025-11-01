'use client';

import { useState } from 'react';
import { useSuppliers, useDeleteSupplier } from '@/lib/api/hooks/use-suppliers';
import { SupplierType } from '@/lib/api/endpoints/suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Trash2, Edit, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const supplierTypeLabels: Record<SupplierType, string> = {
  [SupplierType.HOTEL]: 'Hotel',
  [SupplierType.TRANSPORT]: 'Transport',
  [SupplierType.ACTIVITY_OPERATOR]: 'Activity Operator',
  [SupplierType.GUIDE_AGENCY]: 'Guide Agency',
  [SupplierType.OTHER]: 'Other',
};

const supplierTypeColors: Record<SupplierType, string> = {
  [SupplierType.HOTEL]: 'bg-blue-100 text-blue-800',
  [SupplierType.TRANSPORT]: 'bg-green-100 text-green-800',
  [SupplierType.ACTIVITY_OPERATOR]: 'bg-orange-100 text-orange-800',
  [SupplierType.GUIDE_AGENCY]: 'bg-purple-100 text-purple-800',
  [SupplierType.OTHER]: 'bg-gray-100 text-gray-800',
};

export default function SuppliersPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<SupplierType | 'all'>('all');
  const [showInactive, setShowInactive] = useState(false);

  const { data: suppliers, isLoading } = useSuppliers({
    ...(typeFilter !== 'all' && { type: typeFilter }),
    includeInactive: showInactive,
  });

  const deleteSupplier = useDeleteSupplier();

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to deactivate supplier "${name}"?`)) {
      await deleteSupplier.mutateAsync(id);
    }
  };

  const filteredSuppliers = suppliers?.data?.filter((supplier) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      supplier.party?.name?.toLowerCase().includes(searchLower) ||
      supplier.party?.email?.toLowerCase().includes(searchLower) ||
      supplier.party?.taxId?.toLowerCase().includes(searchLower)
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
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-700 mt-1 text-base">
            Manage your service suppliers and their payment details
          </p>
        </div>
        <Link href={`/${locale}/suppliers/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Supplier
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
                placeholder="Search by name, email, or tax ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(value: string) => setTypeFilter(value as SupplierType | 'all')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(supplierTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showInactive ? 'default' : 'outline'}
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? 'Hide' : 'Show'} Inactive
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredSuppliers?.length || 0} Supplier{filteredSuppliers?.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No suppliers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers?.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{supplier.party?.name}</div>
                          <div className="text-sm text-gray-500">{supplier.party?.taxId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', supplierTypeColors[supplier.type])}>
                        {supplierTypeLabels[supplier.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{supplier.party?.phone}</div>
                        <div className="text-gray-500">{supplier.party?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{supplier.paymentTerms || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{supplier.commissionPct}%</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                        {supplier.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/${locale}/suppliers/${supplier.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(supplier.id, supplier.party?.name || '')}
                          disabled={!supplier.isActive}
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
