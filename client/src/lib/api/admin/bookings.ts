import apiClient from '@/lib/api-client';
import type {
  AdminBooking,
  AdminCreateBookingRequest,
  AdminUpdateBookingRequest,
  ApiResponse,
  Booking,
} from '@/lib/types';

export const adminBookingsApi = {
  list: (params: { dateFrom: string; dateTo?: string; hallId?: string; status?: string }) =>
    apiClient
      .get<ApiResponse<AdminBooking[]>>('/admin/bookings', { params })
      .then((r) => r.data),

  create: (data: AdminCreateBookingRequest) =>
    apiClient.post<ApiResponse<Booking>>('/admin/bookings', data).then((r) => r.data),

  update: (bookingId: string, data: AdminUpdateBookingRequest) =>
    apiClient
      .patch<ApiResponse<Booking>>(`/admin/bookings/${bookingId}`, data)
      .then((r) => r.data),

  forceCreate: (bookingId: string, data: AdminCreateBookingRequest) =>
    apiClient
      .post<ApiResponse<Booking>>(`/admin/bookings/${bookingId}/force-create`, data)
      .then((r) => r.data),
};
