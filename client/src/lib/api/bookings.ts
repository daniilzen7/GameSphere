import apiClient from '@/lib/api-client';
import type {
  ApiResponse,
  AvailableSlotsResponse,
  Booking,
  CreateBookingRequest,
  PaginatedData,
} from '@/lib/types';

export const bookingsApi = {
  getAvailableSlots: (params: { date: string; guests: number; durationMinutes?: number }) =>
    apiClient
      .get<ApiResponse<AvailableSlotsResponse>>('/bookings/available-slots', { params })
      .then((r) => r.data),

  create: (data: CreateBookingRequest) =>
    apiClient.post<ApiResponse<Booking>>('/bookings', data).then((r) => r.data),

  getMy: (params?: { status?: string; page?: number; perPage?: number }) =>
    apiClient
      .get<ApiResponse<PaginatedData<Booking>>>('/bookings/my', { params })
      .then((r) => r.data),

  cancel: (bookingId: string) =>
    apiClient.patch<ApiResponse<Booking>>(`/bookings/${bookingId}/cancel`).then((r) => r.data),
};
