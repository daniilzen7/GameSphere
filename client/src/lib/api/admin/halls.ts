import apiClient from '@/lib/api-client';
import type { ApiResponse, GameTable, Hall } from '@/lib/types';

export const adminHallsApi = {
  list: () =>
    apiClient.get<ApiResponse<Hall[]>>('/admin/halls').then((r) => r.data),

  create: (data: { name: string; description?: string }) =>
    apiClient.post<ApiResponse<Hall>>('/admin/halls', data).then((r) => r.data),

  update: (hallId: string, data: { name?: string; description?: string; isActive?: boolean }) =>
    apiClient.put<ApiResponse<Hall>>(`/admin/halls/${hallId}`, data).then((r) => r.data),

  delete: (hallId: string) =>
    apiClient.delete<ApiResponse<void>>(`/admin/halls/${hallId}`).then((r) => r.data),

  listTables: (hallId: string) =>
    apiClient
      .get<ApiResponse<GameTable[]>>(`/admin/halls/${hallId}/tables`)
      .then((r) => r.data),

  createTable: (hallId: string, data: { label: string; seats?: number }) =>
    apiClient
      .post<ApiResponse<GameTable>>(`/admin/halls/${hallId}/tables`, data)
      .then((r) => r.data),

  updateTable: (tableId: string, data: { label?: string; seats?: number }) =>
    apiClient
      .put<ApiResponse<GameTable>>(`/admin/tables/${tableId}`, data)
      .then((r) => r.data),

  deleteTable: (tableId: string) =>
    apiClient.delete<ApiResponse<void>>(`/admin/tables/${tableId}`).then((r) => r.data),
};
