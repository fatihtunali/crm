import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerItinerariesApi } from '../endpoints/customer-itineraries';
import {
  GenerateItineraryDto,
  UpdateItineraryStatusDto,
  QueryParams,
} from '../types';

const CUSTOMER_ITINERARIES_KEY = 'customer-itineraries';

// PUBLIC: Generate AI itinerary (no auth required)
export function useGenerateItinerary() {
  return useMutation({
    mutationFn: ({ data, tenantId }: { data: GenerateItineraryDto; tenantId: number }) =>
      customerItinerariesApi.generate(data, tenantId),
  });
}

// PUBLIC: Get itinerary by UUID (no auth required)
export function useItineraryByUuid(uuid: string) {
  return useQuery({
    queryKey: [CUSTOMER_ITINERARIES_KEY, 'uuid', uuid],
    queryFn: () => customerItinerariesApi.getByUuid(uuid),
    enabled: !!uuid,
  });
}

// PUBLIC: Request booking (no auth required)
export function useRequestBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => customerItinerariesApi.requestBooking(uuid),
    onSuccess: (_, uuid) => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_ITINERARIES_KEY, 'uuid', uuid] });
    },
  });
}

// PROTECTED: Get all customer itineraries with pagination
export function useCustomerItineraries(params?: QueryParams) {
  return useQuery({
    queryKey: [CUSTOMER_ITINERARIES_KEY, params],
    queryFn: () => customerItinerariesApi.getAll(params),
  });
}

// PROTECTED: Get customer itinerary by ID
export function useCustomerItinerary(id: number) {
  return useQuery({
    queryKey: [CUSTOMER_ITINERARIES_KEY, id],
    queryFn: () => customerItinerariesApi.getById(id),
    enabled: !!id,
  });
}

// PROTECTED: Update itinerary status
export function useUpdateItineraryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateItineraryStatusDto }) =>
      customerItinerariesApi.updateStatus(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_ITINERARIES_KEY] });
    },
  });
}

// PROTECTED: Convert itinerary to manual quote
export function useConvertToManualQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customerItinerariesApi.convertToManualQuote(id),
    onSuccess: () => {
      // Invalidate manual quotes list since a new one was created
      queryClient.invalidateQueries({ queryKey: ['manual-quotes'] });
    },
  });
}
