import apiClient from '@/lib/api-client';
import type { ApiResponse, Notification, PaginatedData } from '@/lib/types';

export const adminNotificationsApi = {
  list: (params?: { status?: string; template?: string; page?: number; perPage?: number }) =>
    apiClient
      .get<ApiResponse<PaginatedData<Notification>>>('/admin/notifications', { params })
      .then((r) => r.data),

  retry: (notificationId: string) =>
    apiClient
      .post<ApiResponse<Notification>>(`/admin/notifications/${notificationId}/retry`)
      .then((r) => r.data),
};
