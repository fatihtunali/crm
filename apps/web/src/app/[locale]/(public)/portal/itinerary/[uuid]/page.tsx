'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { CurrencyDisplay } from '@/components/common/currency-display';
import { BookingCTA } from '@/components/public/booking-cta';
import { useItineraryByUuid } from '@/lib/api/hooks/use-customer-itineraries';
import { format } from 'date-fns';

export default function PublicItineraryViewPage() {
  const params = useParams();
  const locale = params.locale as string;
  const uuid = params.uuid as string;

  const { data: itinerary, isLoading } = useItineraryByUuid(uuid);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Itinerary not found</h2>
          <p className="text-gray-600 mt-2">The itinerary you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href={`/${locale}/portal`}>
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Parse itinerary data
  let itineraryData: any = null;
  try {
    itineraryData = typeof itinerary.itineraryData === 'string'
      ? JSON.parse(itinerary.itineraryData)
      : itinerary.itineraryData;
  } catch (e) {
    console.error('Failed to parse itinerary data:', e);
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <Link href={`/${locale}/portal`}>
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">Your Personalized Itinerary</h1>
          <Badge className="bg-purple-600">{itinerary.status}</Badge>
        </div>
        <p className="text-lg text-gray-600">
          Generated on {format(new Date(itinerary.createdAt || new Date()), 'MMMM dd, yyyy')}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Trip Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                <span className="font-semibold">{itinerary.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>
                  {format(new Date(itinerary.startDate), 'MMM dd, yyyy')} - {format(new Date(itinerary.endDate), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>
                  {itinerary.adults} Adult{itinerary.adults > 1 ? 's' : ''}
                  {itinerary.children > 0 && `, ${itinerary.children} Child${itinerary.children > 1 ? 'ren' : ''}`}
                </span>
              </div>
              {itinerary.cityNights && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-1">Your Journey:</p>
                  <p className="font-medium text-gray-900">
                    {(itinerary.cityNights as unknown as string).split(',').map(cn => {
                      const [city, nights] = cn.split(':');
                      return `${city} (${nights} night${parseInt(nights) > 1 ? 's' : ''})`;
                    }).join(' → ')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Special Requests */}
          {itinerary.specialRequests && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <p className="text-sm font-medium text-blue-900 mb-1">Your Special Requests:</p>
                <p className="text-sm text-blue-800 italic">&quot;{itinerary.specialRequests}&quot;</p>
              </CardContent>
            </Card>
          )}

          {/* Day-by-Day Itinerary */}
          <Card>
            <CardHeader>
              <CardTitle>Day-by-Day Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              {itineraryData && itineraryData.days && itineraryData.days.length > 0 ? (
                <div className="space-y-6">
                  {itineraryData.days.map((day: any, index: number) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4 pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {day.dayNumber || index + 1}
                        </div>
                        <h4 className="font-semibold text-lg text-gray-900">
                          Day {day.dayNumber || index + 1}
                          {day.date && ` - ${format(new Date(day.date), 'MMM dd')}`}
                        </h4>
                      </div>
                      {day.city && (
                        <p className="text-sm text-gray-600 mb-2 ml-11">
                          <MapPin className="inline h-4 w-4 mr-1" />
                          {day.city}
                        </p>
                      )}
                      {day.description && (
                        <p className="text-gray-700 mb-3 ml-11">{day.description}</p>
                      )}
                      {day.activities && day.activities.length > 0 && (
                        <div className="space-y-2 ml-11">
                          {day.activities.map((activity: any, actIdx: number) => (
                            <div key={actIdx} className="bg-gray-50 rounded-lg p-3">
                              <p className="font-medium text-gray-900">{activity.name || activity.title}</p>
                              {activity.description && (
                                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {day.hotel && (
                        <div className="mt-3 ml-11 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-sm text-purple-900">
                            <strong>Accommodation:</strong> {day.hotel.name || day.hotel}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {itineraryData ? JSON.stringify(itineraryData, null, 2) : 'No itinerary data available'}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          {itinerary.totalPrice && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="text-3xl font-bold text-purple-600">
                      <CurrencyDisplay amount={itinerary.totalPrice} />
                    </p>
                  </div>
                  {itinerary.pricePerPerson && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600">Price per Person</p>
                      <p className="text-xl font-semibold text-gray-900">
                        <CurrencyDisplay amount={itinerary.pricePerPerson} />
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking CTA */}
          <BookingCTA
            uuid={uuid}
            customerEmail={itinerary.customerEmail}
            customerPhone={itinerary.customerPhone}
          />

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{itinerary.customerName}</p>
              </div>
              {itinerary.customerEmail && (
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{itinerary.customerEmail}</p>
                </div>
              )}
              {itinerary.customerPhone && (
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{itinerary.customerPhone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share Link */}
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-2">Share this itinerary:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  className="flex-1 text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                >
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
