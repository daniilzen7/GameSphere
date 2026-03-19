import apiClient from '@/lib/api-client';
import type { ApiResponse, AuthData, LoginRequest, RegisterRequest, User } from '@/lib/types';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/login', data).then((r) => r.data),

  me: () =>
    apiClient.get<ApiResponse<User>>('/auth/me').then((r) => r.data),

  logout: () => apiClient.post('/auth/logout'),
};
