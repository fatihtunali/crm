'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClient, useUpdateClient } from '@/lib/api/hooks/use-clients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { UpdateClientDto } from '@/lib/api/types';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const clientId = parseInt(params.id as string);

  const { data: client, isLoading } = useClient(clientId);
  const updateClient = useUpdateClient();

  const [formData, setFormData] = useState<UpdateClientDto>({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    preferredLanguage: 'en',
    passportNumber: '',
    dateOfBirth: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when client data is loaded
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        nationality: client.nationality || '',
        preferredLanguage: client.preferredLanguage || 'en',
        passportNumber: client.passportNumber || '',
        dateOfBirth: client.dateOfBirth || '',
        notes: client.notes || '',
      });
    }
  }, [client]);

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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateClient.mutateAsync({ id: clientId, data: formData });
      router.push(`/${locale}/clients/${clientId}`);
    } catch (error) {
      console.error('Failed to update client:', error);
      alert('Failed to update client. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8">
        <p>Client not found</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Client</h1>
          <p className="text-gray-700 mt-1 text-base">
            Update client information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
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
                placeholder="John Smith"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
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
                placeholder="john.smith@email.com"
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
                placeholder="+1 555 123 4567"
              />
            </div>

            {/* Nationality */}
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="American"
              />
            </div>

            {/* Preferred Language */}
            <div className="space-y-2">
              <Label htmlFor="preferredLanguage">Preferred Language</Label>
              <select
                id="preferredLanguage"
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="tr">Turkish</option>
              </select>
            </div>

            {/* Passport Number */}
            <div className="space-y-2">
              <Label htmlFor="passportNumber">Passport Number</Label>
              <Input
                id="passportNumber"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                placeholder="AB1234567"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
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
                placeholder="Additional notes about this client..."
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
                disabled={updateClient.isPending}
              >
                {updateClient.isPending ? 'Updating...' : 'Update Client'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
