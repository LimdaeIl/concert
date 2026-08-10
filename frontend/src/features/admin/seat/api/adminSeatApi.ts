import {apiClient,} from '@/lib/api/apiClient';

import type {
  BulkCreateSeatsRequest,
  GetAdminSeatsParams,
  GetAdminSeatsResponse,
  UpdateSeatRequest,
  UpdateSeatStatusRequest,
} from '../types/adminSeat';

export async function getAdminSeats(
    venueHallId: number,
    params: GetAdminSeatsParams,
): Promise<GetAdminSeatsResponse> {
  const {data} =
      await apiClient.get<GetAdminSeatsResponse>(
          `/api/v1/admin/halls/${venueHallId}/seats`,
          {
            params: {
              page:
              params.page,

              size:
              params.size,

              keyword:
                  params.keyword ||
                  undefined,

              floor:
                  params.floor ??
                  undefined,

              seatType:
                  params.seatType ||
                  undefined,

              status:
                  params.status ||
                  undefined,
            },
          },
      );

  return data;
}

export async function bulkCreateSeats(
    venueHallId: number,
    request: BulkCreateSeatsRequest,
): Promise<void> {
  await apiClient.post(
      `/api/v1/admin/halls/${venueHallId}/seats/bulk`,
      request,
  );
}

export async function updateSeat(
    seatId: number,
    request: UpdateSeatRequest,
): Promise<void> {
  await apiClient.patch(
      `/api/v1/admin/seats/${seatId}`,
      request,
  );
}

export async function updateSeatStatus(
    seatId: number,
    request: UpdateSeatStatusRequest,
): Promise<void> {
  await apiClient.patch(
      `/api/v1/admin/seats/${seatId}/status`,
      request,
  );
}
