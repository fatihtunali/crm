'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTour } from '@/lib/api/hooks/use-tours';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Calendar, Users, Percent, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const tourId = parseInt(params.id as string);

  const { data: tour, isLoading } = useTour(tourId);

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="p-8">
        <p>Tour not found</p>
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
            <h1 className="text-3xl font-bold text-gray-900">{tour.name}</h1>
            <p className="text-gray-700 mt-1 text-base">Tour Code: {tour.code}</p>
          </div>
        </div>
        <Link href={`/${locale}/tours/${tour.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Tour
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Tour Code</label>
              <p className="text-gray-900 mt-1">{tour.code}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Name</label>
              <p className="text-gray-900 mt-1">{tour.name}</p>
            </div>
            {tour.description && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Description</label>
                <p className="text-gray-900 mt-1">{tour.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing & Capacity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pricing & Capacity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                <Users className="h-4 w-4" />
                Base Capacity
              </label>
              <p className="text-gray-900 mt-1">{tour.baseCapacity} passengers</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                <Percent className="h-4 w-4" />
                Default Markup
              </label>
              <p className="text-gray-900 mt-1">{tour.defaultMarkupPct}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Season Information */}
        {(tour.seasonStart || tour.seasonEnd) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Season Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tour.seasonStart && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Season Start</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(tour.seasonStart).toLocaleDateString()}
                  </p>
                </div>
              )}
              {tour.seasonEnd && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Season End</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(tour.seasonEnd).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-semibold text-gray-600">Status</label>
              <p className="text-gray-900 mt-1">
                {tour.isActive ? (
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

      {/* Itinerary */}
      {tour.itineraries && tour.itineraries.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Itinerary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tour.itineraries
                .sort((a, b) => a.dayNumber - b.dayNumber)
                .map((day) => (
                  <div
                    key={day.id}
                    className="border-l-4 border-indigo-500 pl-4 py-2"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-sm">
                        {day.dayNumber}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {day.title}
                      </h3>
                    </div>
                    {day.description && (
                      <p className="text-gray-700 mb-2">{day.description}</p>
                    )}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {day.transport && (
                        <div>
                          <span className="text-gray-600 font-semibold">Transport:</span>
                          <p className="text-gray-800">{day.transport}</p>
                        </div>
                      )}
                      {day.accommodation && (
                        <div>
                          <span className="text-gray-600 font-semibold">Accommodation:</span>
                          <p className="text-gray-800">{day.accommodation}</p>
                        </div>
                      )}
                      {day.meals && (
                        <div>
                          <span className="text-gray-600 font-semibold">Meals:</span>
                          <p className="text-gray-800">{day.meals}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">Created At</label>
            <p className="text-gray-900 mt-1">
              {new Date(tour.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Last Updated</label>
            <p className="text-gray-900 mt-1">
              {new Date(tour.updatedAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
