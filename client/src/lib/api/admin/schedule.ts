import apiClient from '@/lib/api-client';
import type { ApiResponse, Schedule } from '@/lib/types';

export const adminScheduleApi = {
  list: (params: { dateFrom: string; dateTo?: string }) =>
    apiClient.get<ApiResponse<Schedule[]>>('/schedule', { params }).then((r) => r.data),

  upsert: (date: string, data: { openTime: string; closeTime: string; note?: string }) =>
    apiClient
      .put<ApiResponse<Schedule>>(`/admin/schedule/${date}`, data)
      .then((r) => r.data),
};
