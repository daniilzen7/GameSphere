import apiClient from '@/lib/api-client';
import type { ApiResponse, CreateGameRequest, Game, UpdateGameRequest } from '@/lib/types';

export const adminGamesApi = {
  create: (data: CreateGameRequest) =>
    apiClient.post<ApiResponse<Game>>('/admin/games', data).then((r) => r.data),

  update: (gameId: string, data: UpdateGameRequest) =>
    apiClient.put<ApiResponse<Game>>(`/admin/games/${gameId}`, data).then((r) => r.data),

  delete: (gameId: string) =>
    apiClient.delete<ApiResponse<void>>(`/admin/games/${gameId}`).then((r) => r.data),
};
