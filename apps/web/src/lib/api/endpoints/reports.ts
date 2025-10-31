import { apiClient } from '../client';
import {
  PnLReport,
  RevenueReport,
  LeadsReport,
  ReportFilter,
  LeadReportFilter,
} from '../types';

export const reportsApi = {
  /**
   * Get Profit & Loss report
   */
  getPnL: async (filters?: ReportFilter): Promise<PnLReport> => {
    const queryParams = new URLSearchParams();

    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

    const response = await apiClient.get<PnLReport>(
      `/reports/pnl?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get Revenue report
   */
  getRevenue: async (filters?: ReportFilter): Promise<RevenueReport> => {
    const queryParams = new URLSearchParams();

    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

    const response = await apiClient.get<RevenueReport>(
      `/reports/revenue?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get Leads report
   */
  getLeads: async (filters?: LeadReportFilter): Promise<LeadsReport> => {
    const queryParams = new URLSearchParams();

    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.status) queryParams.append('status', filters.status);

    const response = await apiClient.get<LeadsReport>(
      `/reports/leads?${queryParams.toString()}`
    );
    return response.data;
  },
};
