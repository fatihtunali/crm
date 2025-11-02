'use client';

import { useState } from 'react';
import { useAllRestaurantsFromSuppliers, useDeleteRestaurant } from '@/lib/api/hooks/use-suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Trash2, Edit, Menu } from 'lucide-react';
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

export default function RestaurantsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { data: restaurants = [], isLoading } = useAllRestaurantsFromSuppliers(showInactive);
  const deleteRestaurant = useDeleteRestaurant();

  const filteredRestaurants = restaurants?.filter((restaurant) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      restaurant.name?.toLowerCase().includes(searchLower) ||
      restaurant.city?.name?.toLowerCase().includes(searchLower) ||
      restaurant.supplier?.name?.toLowerCase().includes(searchLower) ||
      restaurant.category?.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = (restaurantId: number, restaurantName: string) => {
    if (confirm(`Are you sure you want to deactivate "${restaurantName}"?`)) {
      deleteRestaurant.mutate(restaurantId);
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
          <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-gray-700 mt-1 text-base">
            Manage your restaurant catalog - {filteredRestaurants?.length || 0} restaurants
          </p>
        </div>
        <Link href={`/${locale}/suppliers/restaurants/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Restaurant
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
                placeholder="Search by restaurant name, city, supplier, or category..."
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
          <CardTitle>{filteredRestaurants?.length || 0} Restaurants</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Menus</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No restaurants found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRestaurants?.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      <div className="font-medium">{restaurant.name}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{restaurant.city?.name || '-'}</span>
                    </TableCell>
                    <TableCell>
                      {restaurant.category ? (
                        <Badge variant="outline">{restaurant.category}</Badge>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {restaurant.supplier ? (
                        <div className="text-sm">
                          <div className="font-medium">{restaurant.supplier.name}</div>
                          <div className="text-gray-500 text-xs">
                            {restaurant.supplier.type?.replace('_', ' ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No supplier assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {restaurant.hasMenus ? (
                        <Badge variant="default" className="bg-green-500">Has Menus</Badge>
                      ) : (
                        <Badge variant="secondary">No Menus</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={restaurant.isActive ? 'default' : 'secondary'}>
                        {restaurant.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/${locale}/suppliers/restaurants/${restaurant.id}/menus`}>
                          <Button variant="ghost" size="sm" title="Manage Menus">
                            <Menu className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/${locale}/suppliers/restaurants/${restaurant.id}`}>
                          <Button variant="ghost" size="sm" title="Edit Restaurant">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Deactivate Restaurant"
                          disabled={!restaurant.isActive || deleteRestaurant.isPending}
                          onClick={() => handleDelete(restaurant.id, restaurant.name)}
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
