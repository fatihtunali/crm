import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  suppliersApi,
  serviceOfferingsApi,
  type CreateSupplierDto,
  type UpdateSupplierDto,
  type CreateServiceOfferingDto,
  type UpdateServiceOfferingDto,
  type SupplierType,
  type ServiceType,
} from '../endpoints/suppliers';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
}

// Suppliers Hooks
export function useSuppliers(params?: { type?: SupplierType; includeInactive?: boolean }) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => suppliersApi.getAll(params),
  });
}

export function useSupplier(id: number) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => suppliersApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateSupplierDto) => suppliersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Success',
        description: 'Supplier created successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create supplier',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierDto }) =>
      suppliersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', variables.id] });
      toast({
        title: 'Success',
        description: 'Supplier updated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update supplier',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => suppliersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Success',
        description: 'Supplier deactivated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate supplier',
        variant: 'destructive',
      });
    },
  });
}

// Service Offerings Hooks
export function useServiceOfferings(params?: {
  serviceType?: ServiceType;
  supplierId?: number;
  includeInactive?: boolean;
}) {
  return useQuery({
    queryKey: ['service-offerings', params],
    queryFn: () => serviceOfferingsApi.getAll(params),
  });
}

export function useServiceOffering(id: number) {
  return useQuery({
    queryKey: ['service-offerings', id],
    queryFn: () => serviceOfferingsApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateServiceOffering() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateServiceOfferingDto) => serviceOfferingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-offerings'] });
      toast({
        title: 'Success',
        description: 'Service offering created successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create service offering',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateServiceOffering() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceOfferingDto }) =>
      serviceOfferingsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-offerings'] });
      queryClient.invalidateQueries({ queryKey: ['service-offerings', variables.id] });
      toast({
        title: 'Success',
        description: 'Service offering updated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update service offering',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteServiceOffering() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => serviceOfferingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-offerings'] });
      toast({
        title: 'Success',
        description: 'Service offering deactivated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate service offering',
        variant: 'destructive',
      });
    },
  });
}

// Hotel Management Hooks (using suppliers API)
export function useAllHotelsFromSuppliers(includeInactive: boolean = false) {
  return useQuery({
    queryKey: ['suppliers', 'hotels', 'all', includeInactive],
    queryFn: () => suppliersApi.getAllHotels(includeInactive),
  });
}

export function useHotelFromSuppliers(id: number) {
  return useQuery({
    queryKey: ['suppliers', 'hotels', id],
    queryFn: () => suppliersApi.getHotel(id),
    enabled: !!id,
  });
}

export function useCreateHotel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: any) => suppliersApi.createHotel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'hotels'] });
      toast({
        title: 'Success',
        description: 'Hotel created successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create hotel',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateHotel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      suppliersApi.updateHotel(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'hotels'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'hotels', variables.id] });
      toast({
        title: 'Success',
        description: 'Hotel updated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update hotel',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteHotel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => suppliersApi.deleteHotel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'hotels'] });
      toast({
        title: 'Success',
        description: 'Hotel deactivated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate hotel',
        variant: 'destructive',
      });
    },
  });
}

// Hotel Pricing Hooks
export function useAllHotelPricing(hotelId: number) {
  return useQuery({
    queryKey: ['suppliers', 'hotels', hotelId, 'pricing'],
    queryFn: () => suppliersApi.getAllHotelPricing(hotelId),
    enabled: !!hotelId,
  });
}

export function useHotelPricing(hotelId: number, id: number) {
  return useQuery({
    queryKey: ['suppliers', 'hotels', hotelId, 'pricing', id],
    queryFn: () => suppliersApi.getHotelPricing(hotelId, id),
    enabled: !!hotelId && !!id,
  });
}

export function useCreateHotelPricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ hotelId, data }: { hotelId: number; data: any }) =>
      suppliersApi.createHotelPricing(hotelId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'hotels', variables.hotelId, 'pricing'] });
      toast({
        title: 'Success',
        description: 'Pricing created successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create pricing',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateHotelPricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ hotelId, id, data }: { hotelId: number; id: number; data: any }) =>
      suppliersApi.updateHotelPricing(hotelId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'hotels', variables.hotelId, 'pricing'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'hotels', variables.hotelId, 'pricing', variables.id] });
      toast({
        title: 'Success',
        description: 'Pricing updated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update pricing',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteHotelPricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ hotelId, id }: { hotelId: number; id: number }) =>
      suppliersApi.deleteHotelPricing(hotelId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'hotels', variables.hotelId, 'pricing'] });
      toast({
        title: 'Success',
        description: 'Pricing deactivated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate pricing',
        variant: 'destructive',
      });
    },
  });
}

// Tour Management Hooks (using suppliers API)
export function useAllToursFromSuppliers(includeInactive: boolean = false) {
  return useQuery({
    queryKey: ['suppliers', 'tours', 'all', includeInactive],
    queryFn: () => suppliersApi.getAllTours(includeInactive),
  });
}

export function useTourFromSuppliers(id: number) {
  return useQuery({
    queryKey: ['suppliers', 'tours', id],
    queryFn: () => suppliersApi.getTour(id),
    enabled: !!id,
  });
}

export function useCreateTour() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: any) => suppliersApi.createTour(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'tours'] });
      toast({
        title: 'Success',
        description: 'Tour created successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create tour',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTour() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      suppliersApi.updateTour(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'tours'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'tours', variables.id] });
      toast({
        title: 'Success',
        description: 'Tour updated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update tour',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteTour() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => suppliersApi.deleteTour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'tours'] });
      toast({
        title: 'Success',
        description: 'Tour deactivated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate tour',
        variant: 'destructive',
      });
    },
  });
}

// Tour Pricing Hooks
export function useAllTourPricing(tourId: number) {
  return useQuery({
    queryKey: ['suppliers', 'tours', tourId, 'pricing'],
    queryFn: () => suppliersApi.getAllTourPricing(tourId),
    enabled: !!tourId,
  });
}

export function useTourPricing(tourId: number, id: number) {
  return useQuery({
    queryKey: ['suppliers', 'tours', tourId, 'pricing', id],
    queryFn: () => suppliersApi.getTourPricing(tourId, id),
    enabled: !!tourId && !!id,
  });
}

export function useCreateTourPricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ tourId, data }: { tourId: number; data: any }) =>
      suppliersApi.createTourPricing(tourId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'tours', variables.tourId, 'pricing'] });
      toast({
        title: 'Success',
        description: 'Pricing created successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create pricing',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTourPricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ tourId, id, data }: { tourId: number; id: number; data: any }) =>
      suppliersApi.updateTourPricing(tourId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'tours', variables.tourId, 'pricing'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'tours', variables.tourId, 'pricing', variables.id] });
      toast({
        title: 'Success',
        description: 'Pricing updated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update pricing',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteTourPricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ tourId, id }: { tourId: number; id: number }) =>
      suppliersApi.deleteTourPricing(tourId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'tours', variables.tourId, 'pricing'] });
      toast({
        title: 'Success',
        description: 'Pricing deactivated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate pricing',
        variant: 'destructive',
      });
    },
  });
}

// Transfer Management Hooks (using suppliers API)
export function useAllTransfersFromSuppliers(includeInactive: boolean = false) {
  return useQuery({
    queryKey: ['suppliers', 'transfers', 'all', includeInactive],
    queryFn: () => suppliersApi.getAllTransfers(includeInactive),
  });
}

export function useTransferFromSuppliers(id: number) {
  return useQuery({
    queryKey: ['suppliers', 'transfers', id],
    queryFn: () => suppliersApi.getTransfer(id),
    enabled: !!id,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: any) => suppliersApi.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'transfers'] });
      toast({
        title: 'Success',
        description: 'Transfer created successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create transfer',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      suppliersApi.updateTransfer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'transfers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'transfers', variables.id] });
      toast({
        title: 'Success',
        description: 'Transfer updated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update transfer',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => suppliersApi.deleteTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'transfers'] });
      toast({
        title: 'Success',
        description: 'Transfer deactivated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate transfer',
        variant: 'destructive',
      });
    },
  });
}

// Transfer Pricing Hooks
export function useAllTransferPricing(transferId: number) {
  return useQuery({
    queryKey: ['suppliers', 'transfers', transferId, 'pricing'],
    queryFn: () => suppliersApi.getAllTransferPricing(transferId),
    enabled: !!transferId,
  });
}

export function useTransferPricing(transferId: number, id: number) {
  return useQuery({
    queryKey: ['suppliers', 'transfers', transferId, 'pricing', id],
    queryFn: () => suppliersApi.getTransferPricing(transferId, id),
    enabled: !!transferId && !!id,
  });
}

export function useCreateTransferPricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ transferId, data }: { transferId: number; data: any }) =>
      suppliersApi.createTransferPricing(transferId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'transfers', variables.transferId, 'pricing'] });
      toast({
        title: 'Success',
        description: 'Transfer pricing created successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create transfer pricing',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTransferPricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ transferId, id, data }: { transferId: number; id: number; data: any }) =>
      suppliersApi.updateTransferPricing(transferId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'transfers', variables.transferId, 'pricing'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'transfers', variables.transferId, 'pricing', variables.id] });
      toast({
        title: 'Success',
        description: 'Transfer pricing updated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update transfer pricing',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteTransferPricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ transferId, id }: { transferId: number; id: number }) =>
      suppliersApi.deleteTransferPricing(transferId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'transfers', variables.transferId, 'pricing'] });
      toast({
        title: 'Success',
        description: 'Transfer pricing deactivated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate transfer pricing',
        variant: 'destructive',
      });
    },
  });
}

// Restaurant Management Hooks (using suppliers API)
export function useAllRestaurantsFromSuppliers(includeInactive: boolean = false) {
  return useQuery({
    queryKey: ['suppliers', 'restaurants', 'all', includeInactive],
    queryFn: () => suppliersApi.getAllRestaurants(includeInactive),
  });
}

export function useRestaurantFromSuppliers(id: number) {
  return useQuery({
    queryKey: ['suppliers', 'restaurants', id],
    queryFn: () => suppliersApi.getRestaurant(id),
    enabled: !!id,
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: any) => suppliersApi.createRestaurant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'restaurants'] });
      toast({
        title: 'Success',
        description: 'Restaurant created successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create restaurant',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      suppliersApi.updateRestaurant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'restaurants', variables.id] });
      toast({
        title: 'Success',
        description: 'Restaurant updated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update restaurant',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteRestaurant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => suppliersApi.deleteRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'restaurants'] });
      toast({
        title: 'Success',
        description: 'Restaurant deactivated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate restaurant',
        variant: 'destructive',
      });
    },
  });
}

// Restaurant Menu Hooks
export function useAllRestaurantMenus(restaurantId: number) {
  return useQuery({
    queryKey: ['suppliers', 'restaurants', restaurantId, 'menus'],
    queryFn: () => suppliersApi.getAllRestaurantMenus(restaurantId),
    enabled: !!restaurantId,
  });
}

export function useRestaurantMenu(restaurantId: number, id: number) {
  return useQuery({
    queryKey: ['suppliers', 'restaurants', restaurantId, 'menus', id],
    queryFn: () => suppliersApi.getRestaurantMenu(restaurantId, id),
    enabled: !!restaurantId && !!id,
  });
}

export function useCreateRestaurantMenu() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ restaurantId, data }: { restaurantId: number; data: any }) =>
      suppliersApi.createRestaurantMenu(restaurantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'restaurants', variables.restaurantId, 'menus'] });
      toast({
        title: 'Success',
        description: 'Menu created successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create menu',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateRestaurantMenu() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ restaurantId, id, data }: { restaurantId: number; id: number; data: any }) =>
      suppliersApi.updateRestaurantMenu(restaurantId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'restaurants', variables.restaurantId, 'menus'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'restaurants', variables.restaurantId, 'menus', variables.id] });
      toast({
        title: 'Success',
        description: 'Menu updated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update menu',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteRestaurantMenu() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ restaurantId, id }: { restaurantId: number; id: number }) =>
      suppliersApi.deleteRestaurantMenu(restaurantId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'restaurants', variables.restaurantId, 'menus'] });
      toast({
        title: 'Success',
        description: 'Menu deactivated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate menu',
        variant: 'destructive',
      });
    },
  });
}
