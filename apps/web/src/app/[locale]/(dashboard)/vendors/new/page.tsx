'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCreateVendor } from '@/lib/api/hooks/use-vendors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { CreateVendorDto, VendorType } from '@/lib/api/types';

export default function NewVendorPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const createVendor = useCreateVendor();

  const [formData, setFormData] = useState<CreateVendorDto>({
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
    if (!formData.name.trim()) {
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
      const vendor = await createVendor.mutateAsync(formData);
      router.push(`/${locale}/vendors/${vendor.id}`);
    } catch (error) {
      console.error('Failed to create vendor:', error);
      alert('Failed to create vendor. Please try again.');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">New Vendor</h1>
          <p className="text-gray-700 mt-1 text-base">
            Add a new vendor to your database
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
                disabled={createVendor.isPending}
              >
                {createVendor.isPending ? 'Creating...' : 'Create Vendor'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
