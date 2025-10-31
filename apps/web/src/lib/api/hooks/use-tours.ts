import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toursApi } from '../endpoints/tours';
import {
  Tour,
  CreateTourDto,
  UpdateTourDto,
  QueryParams,
} from '../types';

const TOURS_KEY = 'tours';

// Get all tours with pagination
export function useTours(params?: QueryParams) {
  return useQuery({
    queryKey: [TOURS_KEY, params],
    queryFn: () => toursApi.getAll(params),
  });
}

// Get tour by ID
export function useTour(id: number) {
  return useQuery({
    queryKey: [TOURS_KEY, id],
    queryFn: () => toursApi.getById(id),
    enabled: !!id,
  });
}

// Search tours
export function useTourSearch(query: string) {
  return useQuery({
    queryKey: [TOURS_KEY, 'search', query],
    queryFn: () => toursApi.search(query),
    enabled: query.length > 0,
  });
}

// Create tour
export function useCreateTour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTourDto) => toursApi.create(data),
    onSuccess: () => {
      // Invalidate tours list
      queryClient.invalidateQueries({ queryKey: [TOURS_KEY] });
    },
  });
}

// Update tour
export function useUpdateTour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTourDto }) =>
      toursApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific tour and lists
      queryClient.invalidateQueries({ queryKey: [TOURS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [TOURS_KEY] });
    },
  });
}

// Delete tour
export function useDeleteTour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toursApi.delete(id),
    onSuccess: () => {
      // Invalidate all tours queries
      queryClient.invalidateQueries({ queryKey: [TOURS_KEY] });
    },
  });
}
