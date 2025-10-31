'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLead, useDeleteLead } from '@/lib/api/hooks/use-leads';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800 border-blue-300',
  CONTACTED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  QUOTED: 'bg-purple-100 text-purple-800 border-purple-300',
  WON: 'bg-green-100 text-green-800 border-green-300',
  LOST: 'bg-red-100 text-red-800 border-red-300',
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const leadId = parseInt(params.id as string);

  const { data: lead, isLoading } = useLead(leadId);
  const deleteMutation = useDeleteLead();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(leadId);
      router.push(`/${locale}/leads`);
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8">
        <p className="text-gray-700">Lead not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/${locale}/leads`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Details</h1>
            <p className="text-gray-700 mt-1">
              Created on {new Date(lead.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/${locale}/leads/${leadId}/edit`}>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500">
            <CardTitle className="text-white">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Inquiry Date</label>
              <p className="text-gray-900 font-medium mt-1">
                {new Date(lead.inquiryDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Status</label>
              <div className="mt-1">
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold border-2 ${statusColors[lead.status]}`}>
                  {lead.status}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Source</label>
              <p className="text-gray-900 font-medium mt-1">{lead.source || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Destination</label>
              <p className="text-gray-900 font-medium mt-1">{lead.destination || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Travel Details */}
        <Card className="border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500">
            <CardTitle className="text-white">Travel Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Adults</label>
              <p className="text-gray-900 font-medium mt-1">{lead.paxAdults}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Children</label>
              <p className="text-gray-900 font-medium mt-1">{lead.paxChildren}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Total Passengers</label>
              <p className="text-gray-900 font-medium mt-1">{lead.paxAdults + lead.paxChildren}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Budget</label>
              <p className="text-gray-900 font-medium mt-1">
                {lead.budgetEur ? `€${parseFloat(lead.budgetEur.toString()).toLocaleString()}` : 'Not specified'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        {lead.notes && (
          <Card className="border-2 border-green-200 shadow-lg md:col-span-2">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500">
              <CardTitle className="text-white">Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-900 whitespace-pre-wrap">{lead.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Client Information */}
        {lead.clientId && (
          <Card className="border-2 border-orange-200 shadow-lg md:col-span-2">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500">
              <CardTitle className="text-white">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div>
                <label className="text-sm font-semibold text-gray-600">Client ID</label>
                <p className="text-gray-900 font-medium mt-1">{lead.clientId}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full border-2 border-red-300">
            <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500">
              <CardTitle className="text-white">Confirm Deletion</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-900 mb-6">
                Are you sure you want to delete this lead? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
