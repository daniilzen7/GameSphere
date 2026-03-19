import apiClient from '@/lib/api-client';
import type { ApiResponse, User } from '@/lib/types';

export const usersApi = {
  getMe: () =>
    apiClient.get<ApiResponse<User>>('/users/me').then((r) => r.data),

  updateMe: (data: { fullName?: string }) =>
    apiClient.patch<ApiResponse<User>>('/users/me', data).then((r) => r.data),
};
