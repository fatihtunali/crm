import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../endpoints/clients';
import {
  CreateClientDto,
  UpdateClientDto,
  QueryParams,
} from '../types';

const CLIENTS_KEY = 'clients';

// Get all clients with pagination
export function useClients(params?: QueryParams) {
  return useQuery({
    queryKey: [CLIENTS_KEY, params],
    queryFn: () => clientsApi.getAll(params),
  });
}

// Get client by ID
export function useClient(id: number) {
  return useQuery({
    queryKey: [CLIENTS_KEY, id],
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
  });
}

// Search clients
export function useClientSearch(query: string) {
  return useQuery({
    queryKey: [CLIENTS_KEY, 'search', query],
    queryFn: () => clientsApi.search(query),
    enabled: query.length > 0,
  });
}

// Create client
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientDto) => clientsApi.create(data),
    onSuccess: () => {
      // Invalidate clients list
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
}

// Update client
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClientDto }) =>
      clientsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific client and lists
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
}

// Delete client
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess: () => {
      // Invalidate all clients queries
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
}
