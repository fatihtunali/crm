'use client';

import { useParams, useRouter } from 'next/navigation';
import { useVendor } from '@/lib/api/hooks/use-vendors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Mail, Phone, Building2, FileText, MapPin } from 'lucide-react';
import Link from 'next/link';

const vendorTypeColors: Record<string, string> = {
  HOTEL: 'bg-blue-100 text-blue-800',
  TRANSPORT: 'bg-green-100 text-green-800',
  GUIDE: 'bg-purple-100 text-purple-800',
  ACTIVITY: 'bg-orange-100 text-orange-800',
};

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const vendorId = parseInt(params.id as string);

  const { data: vendor, isLoading } = useVendor(vendorId);

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
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
            <p className="text-gray-700 mt-1 text-base">Vendor Details</p>
          </div>
        </div>
        <Link href={`/${locale}/vendors/${vendor.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Vendor
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Name</label>
              <p className="text-gray-900 mt-1">{vendor.name}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Type</label>
              <p className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    vendorTypeColors[vendor.type]
                  }`}
                >
                  {vendor.type}
                </span>
              </p>
            </div>
            {vendor.taxId && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Tax ID</label>
                <p className="text-gray-900 mt-1">{vendor.taxId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendor.contactName && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Contact Person</label>
                <p className="text-gray-900 mt-1">{vendor.contactName}</p>
              </div>
            )}
            {vendor.phone && (
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Phone
                </label>
                <p className="text-gray-900 mt-1">{vendor.phone}</p>
              </div>
            )}
            {vendor.email && (
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-gray-900 mt-1">{vendor.email}</p>
              </div>
            )}
            {vendor.address && (
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Address
                </label>
                <p className="text-gray-900 mt-1">{vendor.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {vendor.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">{vendor.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Created At</label>
              <p className="text-gray-900 mt-1">
                {new Date(vendor.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Last Updated</label>
              <p className="text-gray-900 mt-1">
                {new Date(vendor.updatedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Status</label>
              <p className="text-gray-900 mt-1">
                {vendor.isActive ? (
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                    Inactive
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
