'use client';

import { useState } from 'react';
import { useAllToursFromSuppliers, useDeleteTour } from '@/lib/api/hooks/use-suppliers';
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
import { LoadingSpinner } from '@/components/common/loading-spinner';

export default function ToursPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { data: tours = [], isLoading } = useAllToursFromSuppliers(showInactive);
  const deleteTour = useDeleteTour();

  const filteredTours = tours?.filter((tour) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      tour.tourName?.toLowerCase().includes(searchLower) ||
      tour.city?.name?.toLowerCase().includes(searchLower) ||
      tour.supplier?.name?.toLowerCase().includes(searchLower) ||
      tour.duration?.toLowerCase().includes(searchLower) ||
      tour.tourType?.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = (tourId: number, tourName: string) => {
    if (confirm(`Are you sure you want to deactivate "${tourName}"?`)) {
      deleteTour.mutate(tourId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tours</h1>
          <p className="text-gray-700 mt-1 text-base">
            Manage your tour catalog - {filteredTours?.length || 0} tours
          </p>
        </div>
        <Link href={`/${locale}/suppliers/tours/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Tour
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
                placeholder="Search by tour name, city, supplier, duration, or type..."
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
          <CardTitle>{filteredTours?.length || 0} Tours</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tour Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTours?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    No tours found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTours?.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell>
                      <div className="font-medium">{tour.tourName}</div>
                      {tour.description && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {tour.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{tour.city?.name || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{tour.duration || '-'}</span>
                    </TableCell>
                    <TableCell>
                      {tour.tourType ? (
                        <Badge variant="outline">{tour.tourType}</Badge>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tour.supplier ? (
                        <div className="text-sm">
                          <div className="font-medium">{tour.supplier.name}</div>
                          <div className="text-gray-500 text-xs">
                            {tour.supplier.type?.replace('_', ' ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No supplier assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tour.hasPricing ? (
                        <Badge variant="default" className="bg-green-500">Has Pricing</Badge>
                      ) : (
                        <Badge variant="secondary">No Pricing</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tour.isActive ? 'default' : 'secondary'}>
                        {tour.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/${locale}/suppliers/tours/${tour.id}/pricing`}>
                          <Button variant="ghost" size="sm" title="Manage Pricing">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/${locale}/suppliers/tours/${tour.id}`}>
                          <Button variant="ghost" size="sm" title="Edit Tour">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Deactivate Tour"
                          disabled={!tour.isActive || deleteTour.isPending}
                          onClick={() => handleDelete(tour.id, tour.tourName)}
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
