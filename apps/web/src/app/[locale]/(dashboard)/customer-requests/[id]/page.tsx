'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, MapPin, Calendar, Mail, Phone, FileText, RefreshCw, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { CurrencyDisplay } from '@/components/common/currency-display';
import { useCustomerItinerary, useUpdateItineraryStatus, useConvertToManualQuote } from '@/lib/api/hooks/use-customer-itineraries';
import { format } from 'date-fns';
import { toast } from 'sonner';

type ItineraryStatus = 'PENDING' | 'CONFIRMED' | 'BOOKED' | 'COMPLETED' | 'CANCELLED';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  BOOKED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function CustomerRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const id = parseInt(params.id as string);

  const [selectedStatus, setSelectedStatus] = useState<ItineraryStatus | null>(null);

  const { data: itinerary, isLoading } = useCustomerItinerary(id);
  const updateStatusMutation = useUpdateItineraryStatus();
  const convertToQuoteMutation = useConvertToManualQuote();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Request not found</h2>
          <p className="text-gray-600 mt-2">The customer request you&apos;re looking for doesn&apos;t exist.</p>
          <Link href={`/${locale}/customer-requests`}>
            <Button className="mt-4">Back to Requests</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        uuid: itinerary.uuid,
        data: { status: selectedStatus },
      });
      toast.success('Status updated successfully');
      setSelectedStatus(null);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleConvertToQuote = async () => {
    if (!confirm('Convert this request to a manual quote? This will create a new quote based on the itinerary data.')) {
      return;
    }

    try {
      const result = await convertToQuoteMutation.mutateAsync(id);
      toast.success('Converted to manual quote successfully');
      router.push(`/${locale}/manual-quotes/${result.id}`);
    } catch (error) {
      toast.error('Failed to convert to manual quote');
    }
  };

  // Parse itinerary data if it's a string
  let itineraryData: any = null;
  try {
    itineraryData = typeof itinerary.itineraryData === 'string'
      ? JSON.parse(itinerary.itineraryData)
      : itinerary.itineraryData;
  } catch (e) {
    console.error('Failed to parse itinerary data:', e);
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/${locale}/customer-requests`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{itinerary.customerName}</h1>
            <Badge className={statusColors[itinerary.status]}>
              {itinerary.status}
            </Badge>
            <Badge variant="outline">{itinerary.source}</Badge>
          </div>
          <p className="text-gray-700 mt-1 text-base">
            Created {format(new Date(itinerary.createdAt || new Date()), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>

      {/* Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-medium text-gray-700">Change Status:</span>
              <Select
                value={selectedStatus || itinerary.status}
                onValueChange={(val: string) => setSelectedStatus(val as ItineraryStatus)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="BOOKED">Booked</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || selectedStatus === itinerary.status || updateStatusMutation.isPending}
                size="sm"
              >
                {updateStatusMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Update Status
              </Button>
            </div>
            <Button
              onClick={handleConvertToQuote}
              disabled={convertToQuoteMutation.isPending}
              variant="outline"
            >
              {convertToQuoteMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Convert to Manual Quote
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{itinerary.customerName}</p>
              </div>
              {itinerary.customerEmail && (
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Mail className="h-4 w-4" /> Email
                  </p>
                  <p className="font-medium text-gray-900">{itinerary.customerEmail}</p>
                </div>
              )}
              {itinerary.customerPhone && (
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="h-4 w-4" /> Phone
                  </p>
                  <p className="font-medium text-gray-900">{itinerary.customerPhone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Destination
                </p>
                <p className="font-medium text-gray-900">{itinerary.destination}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Travel Dates
                </p>
                <p className="font-medium text-gray-900">
                  {format(new Date(itinerary.startDate), 'MMM dd, yyyy')} - {format(new Date(itinerary.endDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Users className="h-4 w-4" /> Travelers
                </p>
                <p className="font-medium text-gray-900">
                  {itinerary.adults} Adult{itinerary.adults > 1 ? 's' : ''}
                  {itinerary.children > 0 && `, ${itinerary.children} Child${itinerary.children > 1 ? 'ren' : ''}`}
                </p>
              </div>
              {itinerary.hotelCategory && (
                <div>
                  <p className="text-sm text-gray-600">Hotel Category</p>
                  <p className="font-medium text-gray-900">{itinerary.hotelCategory}</p>
                </div>
              )}
              {itinerary.tourType && (
                <div>
                  <p className="text-sm text-gray-600">Tour Type</p>
                  <p className="font-medium text-gray-900">{itinerary.tourType}</p>
                </div>
              )}
              {itinerary.cityNights && (
                <div>
                  <p className="text-sm text-gray-600">City Nights</p>
                  <p className="font-medium text-gray-900">{(itinerary.cityNights as unknown as string).split(',').join(' → ')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {itinerary.totalPrice && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="text-2xl font-bold text-purple-600">
                    <CurrencyDisplay amount={itinerary.totalPrice} />
                  </p>
                </div>
                {itinerary.pricePerPerson && (
                  <div>
                    <p className="text-sm text-gray-600">Price per Person</p>
                    <p className="text-xl font-semibold text-gray-900">
                      <CurrencyDisplay amount={itinerary.pricePerPerson} />
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Itinerary Details */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              {itinerary.specialRequests && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Special Requests:</p>
                  <p className="text-sm text-blue-800 mt-1 italic">&quot;{itinerary.specialRequests}&quot;</p>
                </div>
              )}

              {itineraryData ? (
                <div className="space-y-4">
                  {itineraryData.days && itineraryData.days.length > 0 ? (
                    itineraryData.days.map((day: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Day {day.dayNumber || index + 1}
                          {day.date && ` - ${format(new Date(day.date), 'MMM dd, yyyy')}`}
                        </h4>
                        {day.city && (
                          <p className="text-sm text-gray-600 mb-2">
                            <MapPin className="inline h-4 w-4 mr-1" />
                            {day.city}
                          </p>
                        )}
                        {day.description && (
                          <p className="text-sm text-gray-700 mb-3">{day.description}</p>
                        )}
                        {day.activities && day.activities.length > 0 && (
                          <div className="space-y-2">
                            {day.activities.map((activity: any, actIdx: number) => (
                              <div key={actIdx} className="pl-4 border-l-2 border-purple-300">
                                <p className="text-sm font-medium text-gray-900">{activity.name || activity.title}</p>
                                {activity.description && (
                                  <p className="text-sm text-gray-600">{activity.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {day.hotel && (
                          <div className="mt-3 p-2 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">
                              <strong>Accommodation:</strong> {day.hotel.name || day.hotel}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                        {JSON.stringify(itineraryData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No itinerary data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
