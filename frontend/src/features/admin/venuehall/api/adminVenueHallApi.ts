import {
  apiClient,
} from '@/lib/api/apiClient';

import type {
  AdminVenueHall,
  CreateVenueHallRequest,
  GetAdminVenueHallsParams,
  GetAdminVenueHallsResponse,
  UpdateVenueHallRequest,
  UpdateVenueHallStatusRequest,
} from '../types/adminVenueHall';

export async function getAdminVenueHalls(
    venueId: number,
    params: GetAdminVenueHallsParams,
): Promise<GetAdminVenueHallsResponse> {
  const { data } =
      await apiClient.get<GetAdminVenueHallsResponse>(
          `/api/v1/admin/venues/${venueId}/halls`,
          {
            params: {
              page: params.page,
              size: params.size,

              keyword:
                  params.keyword ||
                  undefined,

              status:
                  params.status ||
                  undefined,
            },
          },
      );

  return data;
}

export async function createVenueHall(
    venueId: number,
    request: CreateVenueHallRequest,
): Promise<AdminVenueHall> {
  const { data } =
      await apiClient.post<AdminVenueHall>(
          `/api/v1/admin/venues/${venueId}/halls`,
          request,
      );

  return data;
}

export async function updateVenueHall(
    venueHallId: number,
    request: UpdateVenueHallRequest,
): Promise<AdminVenueHall> {
  const { data } =
      await apiClient.patch<AdminVenueHall>(
          `/api/v1/admin/halls/${venueHallId}`,
          request,
      );

  return data;
}

export async function updateVenueHallStatus(
    venueHallId: number,
    request: UpdateVenueHallStatusRequest,
): Promise<AdminVenueHall> {
  const { data } =
      await apiClient.patch<AdminVenueHall>(
          `/api/v1/admin/halls/${venueHallId}/status`,
          request,
      );

  return data;
}
