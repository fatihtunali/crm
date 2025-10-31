import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webhooksApi } from '../endpoints/webhooks';
import { WebhookFilter } from '../types';

const WEBHOOKS_KEY = 'webhooks';

/**
 * Get all webhook events with filters
 */
export function useWebhooks(filters?: WebhookFilter) {
  return useQuery({
    queryKey: [WEBHOOKS_KEY, filters],
    queryFn: () => webhooksApi.getAll(filters),
  });
}

/**
 * Get webhook statistics
 */
export function useWebhookStats() {
  return useQuery({
    queryKey: [WEBHOOKS_KEY, 'stats'],
    queryFn: () => webhooksApi.getStats(),
  });
}

/**
 * Get webhook event by ID
 */
export function useWebhook(id: number) {
  return useQuery({
    queryKey: [WEBHOOKS_KEY, id],
    queryFn: () => webhooksApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Retry failed webhook
 */
export function useRetryWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => webhooksApi.retry(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [WEBHOOKS_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [WEBHOOKS_KEY] });
    },
  });
}
