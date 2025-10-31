'use client';

import { useParams, useRouter } from 'next/navigation';
import { useClient } from '@/lib/api/hooks/use-clients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Mail, Phone, Calendar, Globe, FileText, User } from 'lucide-react';
import Link from 'next/link';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const clientId = parseInt(params.id as string);

  const { data: client, isLoading } = useClient(clientId);

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
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-700 mt-1 text-base">Client Details</p>
          </div>
        </div>
        <Link href={`/${locale}/clients/${client.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Client
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Name</label>
              <p className="text-gray-900 mt-1">{client.name}</p>
            </div>
            {client.email && (
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-gray-900 mt-1">{client.email}</p>
              </div>
            )}
            {client.phone && (
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Phone
                </label>
                <p className="text-gray-900 mt-1">{client.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.nationality && (
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  Nationality
                </label>
                <p className="text-gray-900 mt-1">{client.nationality}</p>
              </div>
            )}
            {client.passportNumber && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Passport Number</label>
                <p className="text-gray-900 mt-1">{client.passportNumber}</p>
              </div>
            )}
            {client.dateOfBirth && (
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </label>
                <p className="text-gray-900 mt-1">
                  {new Date(client.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            )}
            {client.preferredLanguage && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Preferred Language</label>
                <p className="text-gray-900 mt-1">{client.preferredLanguage.toUpperCase()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {client.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">{client.notes}</p>
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
                {new Date(client.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Last Updated</label>
              <p className="text-gray-900 mt-1">
                {new Date(client.updatedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Status</label>
              <p className="text-gray-900 mt-1">
                {client.isActive ? (
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
