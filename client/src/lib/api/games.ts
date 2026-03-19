import apiClient from '@/lib/api-client';
import type { ApiResponse, Game, GamesFilter, PaginatedData } from '@/lib/types';

export const gamesApi = {
  list: (params?: GamesFilter) =>
    apiClient.get<ApiResponse<PaginatedData<Game>>>('/games', { params }).then((r) => r.data),

  get: (gameId: string) =>
    apiClient.get<ApiResponse<Game>>(`/games/${gameId}`).then((r) => r.data),
};
