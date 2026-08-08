import { apiClient } from '@/lib/api/apiClient';

import type {
  CreateReservationRequest,
  CreateReservationResponse,
  MyReservationDetail,
  MyReservationPageResponse,
  ReservationDetail,
  ReservationListResponse,
} from '../types/reservation';

export async function createReservation(
    performanceId: number,
    request: CreateReservationRequest,
): Promise<CreateReservationResponse> {
  const { data } =
      await apiClient.post<CreateReservationResponse>(
          `/api/v1/performances/${performanceId}/reservations`,
          request,
      );

  return data;
}

export async function getReservation(
    reservationId: number,
): Promise<ReservationDetail> {
  const { data } =
      await apiClient.get<ReservationDetail>(
          `/api/v1/reservations/${reservationId}`,
      );

  return data;
}

export async function getMyReservations(): Promise<ReservationListResponse> {
  const { data } =
      await apiClient.get<ReservationListResponse>(
          '/api/v1/reservations/my',
      );

  return data;
}

export async function getMyBookingReservations(
    params?: {
      status?: string;
      concertProgress?: string;
      keyword?: string;
      from?: string;
      to?: string;
      sort?: string;
      page?: number;
      size?: number;
    },
): Promise<MyReservationPageResponse> {
  const { data } =
      await apiClient.get<MyReservationPageResponse>(
          '/api/v1/me/reservations',
          {
            params,
          },
      );

  return data;
}

export async function getMyBookingReservation(
    reservationId: number,
): Promise<MyReservationDetail> {
  const { data } =
      await apiClient.get<MyReservationDetail>(
          `/api/v1/me/reservations/${reservationId}`,
      );

  return data;
}
