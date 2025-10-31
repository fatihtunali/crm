'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useVendor, useUpdateVendor } from '@/lib/api/hooks/use-vendors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { UpdateVendorDto } from '@/lib/api/types';

export default function EditVendorPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const vendorId = parseInt(params.id as string);

  const { data: vendor, isLoading } = useVendor(vendorId);
  const updateVendor = useUpdateVendor();

  const [formData, setFormData] = useState<UpdateVendorDto>({
    name: '',
    type: 'HOTEL',
    contactName: '',
    phone: '',
    email: '',
    taxId: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when vendor data is loaded
  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        type: vendor.type || 'HOTEL',
        contactName: vendor.contactName || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        taxId: vendor.taxId || '',
        address: vendor.address || '',
        notes: vendor.notes || '',
      });
    }
  }, [vendor]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateVendor.mutateAsync({ id: vendorId, data: formData });
      router.push(`/${locale}/vendors/${vendorId}`);
    } catch (error) {
      console.error('Failed to update vendor:', error);
      alert('Failed to update vendor. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-8">
        <p>Vendor not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Vendor</h1>
          <p className="text-gray-700 mt-1 text-base">
            Update vendor information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name - Required */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Grand Istanbul Hotel"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Type - Required */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`flex h-10 w-full rounded-md border ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                } bg-white px-3 py-2 text-sm`}
              >
                <option value="HOTEL">Hotel</option>
                <option value="TRANSPORT">Transport</option>
                <option value="GUIDE">Guide</option>
                <option value="ACTIVITY">Activity</option>
              </select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            {/* Contact Name */}
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Person</Label>
              <Input
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="Mehmet Yılmaz"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+90 212 555 1234"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@vendor.com"
              />
            </div>

            {/* Tax ID */}
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                placeholder="TR9876543210"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Sultanahmet, Istanbul"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes about this vendor..."
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateVendor.isPending}
              >
                {updateVendor.isPending ? 'Updating...' : 'Update Vendor'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
