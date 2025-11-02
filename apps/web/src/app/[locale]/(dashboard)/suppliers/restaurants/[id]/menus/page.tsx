'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useRestaurantFromSuppliers,
  useAllRestaurantMenus,
  useCreateRestaurantMenu,
  useUpdateRestaurantMenu,
  useDeleteRestaurantMenu
} from '@/lib/api/hooks/use-suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function RestaurantMenusPage() {
  const params = useParams();
  const locale = params.locale as string;
  const restaurantId = parseInt(params.id as string);

  const { data: restaurant, isLoading: restaurantLoading } = useRestaurantFromSuppliers(restaurantId);
  const { data: menus = [], isLoading: menusLoading } = useAllRestaurantMenus(restaurantId);
  const createMenu = useCreateRestaurantMenu();
  const updateMenu = useUpdateRestaurantMenu();
  const deleteMenu = useDeleteRestaurantMenu();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    menuName: '',
    description: '',
    pricePerPerson: '',
    startDate: '',
    endDate: '',
  });

  const resetForm = () => {
    setFormData({
      menuName: '',
      description: '',
      pricePerPerson: '',
      startDate: '',
      endDate: '',
    });
    setEditingId(null);
  };

  const handleOpenDialog = (menu?: any) => {
    if (menu) {
      setEditingId(menu.id);
      setFormData({
        menuName: menu.menuName || '',
        description: menu.description || '',
        pricePerPerson: menu.pricePerPerson?.toString() || '',
        startDate: menu.startDate ? new Date(menu.startDate).toISOString().split('T')[0] : '',
        endDate: menu.endDate ? new Date(menu.endDate).toISOString().split('T')[0] : '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      menuName: formData.menuName,
      description: formData.description || null,
      pricePerPerson: parseFloat(formData.pricePerPerson),
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
    };

    if (editingId) {
      await updateMenu.mutateAsync({ restaurantId, id: editingId, data });
    } else {
      await createMenu.mutateAsync({ restaurantId, data });
    }

    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to deactivate this menu?')) {
      deleteMenu.mutate({ restaurantId, id });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount: any) => {
    if (!amount) return '-';
    return `₺${parseFloat(amount).toFixed(2)}`;
  };

  if (restaurantLoading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Restaurant not found</h2>
          <Link href={`/${locale}/suppliers/restaurants`}>
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Restaurants
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/suppliers/restaurants/${restaurantId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Menus</h1>
            <p className="text-gray-700 mt-1">{restaurant.name}</p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{menus?.length || 0} Menus</CardTitle>
        </CardHeader>
        <CardContent>
          {menusLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Menu Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price per Person</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No menus found. Add your first menu to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  menus?.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell>
                        <div className="font-medium">{menu.menuName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {menu.description || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(menu.pricePerPerson)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(menu.startDate)} - {formatDate(menu.endDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={menu.isActive ? 'default' : 'secondary'}>
                          {menu.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(menu)}
                            title="Edit Menu"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(menu.id)}
                            disabled={!menu.isActive || deleteMenu.isPending}
                            title="Deactivate Menu"
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
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Menu' : 'Add New Menu'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Menu Name */}
              <div>
                <Label htmlFor="menuName">Menu Name *</Label>
                <Input
                  id="menuName"
                  value={formData.menuName}
                  onChange={(e) => setFormData({ ...formData, menuName: e.target.value })}
                  required
                  placeholder="e.g., Set Menu A, Lunch Special"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Describe what's included in this menu"
                />
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="pricePerPerson">Price per Person (₺) *</Label>
                <Input
                  id="pricePerPerson"
                  type="number"
                  step="0.01"
                  value={formData.pricePerPerson}
                  onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>

              {/* Valid Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMenu.isPending || updateMenu.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {editingId ? 'Update' : 'Create'} Menu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
