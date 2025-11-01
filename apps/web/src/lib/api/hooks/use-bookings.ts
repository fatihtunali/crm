import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../endpoints/bookings';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingStatus,
  SearchBookingParams,
} from '../types';

const BOOKINGS_KEY = 'bookings';

// Get all bookings with pagination and optional status filter
export function useBookings(params?: {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}) {
  return useQuery({
    queryKey: [BOOKINGS_KEY, params],
    queryFn: () => bookingsApi.getAll(params),
  });
}

// Search bookings with advanced filters
export function useBookingSearch(params: SearchBookingParams) {
  return useQuery({
    queryKey: [BOOKINGS_KEY, 'search', params],
    queryFn: () => bookingsApi.search(params),
    enabled: !!(
      params.bookingCode ||
      params.clientName ||
      params.clientEmail ||
      params.status ||
      params.startDateFrom ||
      params.startDateTo
    ),
  });
}

// Get booking statistics
export function useBookingStats() {
  return useQuery({
    queryKey: [BOOKINGS_KEY, 'stats'],
    queryFn: () => bookingsApi.getStats(),
  });
}

// Get booking by ID
export function useBooking(id: number) {
  return useQuery({
    queryKey: [BOOKINGS_KEY, id],
    queryFn: () => bookingsApi.getById(id),
    enabled: !!id,
  });
}

// Get booking P&L
export function useBookingPnL(id: number) {
  return useQuery({
    queryKey: [BOOKINGS_KEY, id, 'pnl'],
    queryFn: () => bookingsApi.getPnL(id),
    enabled: !!id,
  });
}

// Create booking
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingDto) => bookingsApi.create(data),
    onSuccess: () => {
      // Invalidate bookings list and stats
      queryClient.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
    },
  });
}

// Update booking
export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBookingDto }) =>
      bookingsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific booking, lists, and stats
      queryClient.invalidateQueries({ queryKey: [BOOKINGS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
    },
  });
}

// Delete booking
export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookingsApi.delete(id),
    onSuccess: () => {
      // Invalidate all bookings queries
      queryClient.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
    },
  });
}
