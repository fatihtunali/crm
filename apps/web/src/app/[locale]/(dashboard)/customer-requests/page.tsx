'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Search, Users, MapPin, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import { CurrencyDisplay } from '@/components/common/currency-display';
import { useCustomerItineraries } from '@/lib/api/hooks/use-customer-itineraries';
import { format } from 'date-fns';

type ItineraryStatus = 'PENDING' | 'CONFIRMED' | 'BOOKED' | 'COMPLETED' | 'CANCELLED' | '';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  BOOKED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function CustomerRequestsPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ItineraryStatus>('');
  const [sourceFilter, setSourceFilter] = useState<'ONLINE' | 'AGENT' | 'API' | ''>('');

  const { data: response, isLoading } = useCustomerItineraries();
  const itineraries = response?.data || [];

  const filteredItineraries = itineraries.filter((itinerary) => {
    const matchesSearch =
      !search ||
      itinerary.customerName.toLowerCase().includes(search.toLowerCase()) ||
      itinerary.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      itinerary.destination?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || itinerary.status === statusFilter;
    const matchesSource = !sourceFilter || itinerary.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const stats = {
    total: itineraries.length,
    pending: itineraries.filter((i) => i.status === 'PENDING').length,
    confirmed: itineraries.filter((i) => i.status === 'CONFIRMED').length,
    booked: itineraries.filter((i) => i.status === 'BOOKED').length,
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Customer Requests</h1>
        <p className="text-gray-700 mt-1 text-base">
          Manage AI-generated customer itinerary requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Booked</p>
                <p className="text-2xl font-bold text-green-600">{stats.booked}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or destination..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter || undefined} onValueChange={(val: string) => setStatusFilter(val as ItineraryStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="BOOKED">Booked</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter || undefined} onValueChange={(val: string) => setSourceFilter(val as 'ONLINE' | 'AGENT' | 'API' | '')}>
              <SelectTrigger>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONLINE">Online</SelectItem>
                <SelectItem value="AGENT">Agent</SelectItem>
                <SelectItem value="API">API</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Itineraries List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredItineraries.length === 0 ? (
        <EmptyState
          title="No customer requests found"
          description={search || statusFilter || sourceFilter ? "Try adjusting your filters" : "Customer itinerary requests will appear here"}
        />
      ) : (
        <div className="space-y-4">
          {filteredItineraries.map((itinerary) => (
            <Card key={itinerary.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{itinerary.customerName}</h3>
                      <Badge className={statusColors[itinerary.status]}>
                        {itinerary.status}
                      </Badge>
                      <Badge variant="outline">{itinerary.source}</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 mb-3">
                      {itinerary.customerEmail && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Email:</span>
                          <span>{itinerary.customerEmail}</span>
                        </div>
                      )}
                      {itinerary.customerPhone && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Phone:</span>
                          <span>{itinerary.customerPhone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{itinerary.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(itinerary.startDate), 'MMM dd, yyyy')} - {format(new Date(itinerary.endDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {itinerary.adults} Adult{itinerary.adults > 1 ? 's' : ''}
                          {itinerary.children > 0 && `, ${itinerary.children} Child${itinerary.children > 1 ? 'ren' : ''}`}
                        </span>
                      </div>
                      {itinerary.hotelCategory && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Hotel:</span>
                          <span>{itinerary.hotelCategory}</span>
                        </div>
                      )}
                    </div>
                    {itinerary.cityNights && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Itinerary: </span>
                        {(itinerary.cityNights as unknown as string).split(',').join(' → ')}
                      </div>
                    )}
                    {itinerary.specialRequests && (
                      <div className="text-sm text-gray-600 italic">
                        &quot;{itinerary.specialRequests}&quot;
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-6">
                    {itinerary.totalPrice && (
                      <>
                        <p className="text-xs text-gray-600">Total Price</p>
                        <p className="text-xl font-semibold text-purple-600 mb-2">
                          <CurrencyDisplay amount={itinerary.totalPrice} />
                        </p>
                        {itinerary.pricePerPerson && (
                          <p className="text-xs text-gray-600">
                            <CurrencyDisplay amount={itinerary.pricePerPerson} /> / person
                          </p>
                        )}
                      </>
                    )}
                    <Link href={`/${locale}/customer-requests/${itinerary.id}`}>
                      <Button size="sm" className="mt-3">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
