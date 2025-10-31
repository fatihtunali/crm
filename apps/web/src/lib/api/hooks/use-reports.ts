import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../endpoints/reports';
import { ReportFilter, LeadReportFilter } from '../types';

const REPORTS_KEY = 'reports';

/**
 * Get Profit & Loss report
 */
export function usePnLReport(filters?: ReportFilter) {
  return useQuery({
    queryKey: [REPORTS_KEY, 'pnl', filters],
    queryFn: () => reportsApi.getPnL(filters),
  });
}

/**
 * Get Revenue report
 */
export function useRevenueReport(filters?: ReportFilter) {
  return useQuery({
    queryKey: [REPORTS_KEY, 'revenue', filters],
    queryFn: () => reportsApi.getRevenue(filters),
  });
}

/**
 * Get Leads report
 */
export function useLeadsReport(filters?: LeadReportFilter) {
  return useQuery({
    queryKey: [REPORTS_KEY, 'leads', filters],
    queryFn: () => reportsApi.getLeads(filters),
  });
}
