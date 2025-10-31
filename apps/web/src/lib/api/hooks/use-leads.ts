import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../endpoints/leads';
import {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  LeadStatus,
  QueryParams,
} from '../types';

const LEADS_KEY = 'leads';

// Get all leads with pagination
export function useLeads(params?: QueryParams & { status?: LeadStatus }) {
  return useQuery({
    queryKey: [LEADS_KEY, params],
    queryFn: () => leadsApi.getAll(params),
  });
}

// Get lead by ID
export function useLead(id: number) {
  return useQuery({
    queryKey: [LEADS_KEY, id],
    queryFn: () => leadsApi.getById(id),
    enabled: !!id,
  });
}

// Get leads statistics
export function useLeadStats() {
  return useQuery({
    queryKey: [LEADS_KEY, 'stats'],
    queryFn: () => leadsApi.getStats(),
  });
}

// Create lead
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadDto) => leadsApi.create(data),
    onSuccess: () => {
      // Invalidate leads list and stats
      queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
    },
  });
}

// Update lead
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLeadDto }) =>
      leadsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific lead and lists
      queryClient.invalidateQueries({ queryKey: [LEADS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
    },
  });
}

// Delete lead
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => leadsApi.delete(id),
    onSuccess: () => {
      // Invalidate all leads queries
      queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
    },
  });
}
