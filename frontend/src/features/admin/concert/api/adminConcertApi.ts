import {
  apiClient,
} from '@/lib/api/apiClient';

import type {
  CreateConcertRequest,
  GetAdminConcertsParams,
  GetAdminConcertsResponse,
  UpdateConcertRequest,
  UpdateConcertStatusRequest,
} from '../types/adminConcert';

export async function getAdminConcerts(
    params: GetAdminConcertsParams,
): Promise<GetAdminConcertsResponse> {
  const { data } =
      await apiClient.get<GetAdminConcertsResponse>(
          '/api/v1/admin/concerts',
          {
            params: {
              page: params.page,
              size: params.size,
              keyword:
                  params.keyword ||
                  undefined,
              category:
                  params.category ||
                  undefined,
              status:
                  params.status ||
                  undefined,
            },
          },
      );

  return data;
}

export async function createConcert(
    request: CreateConcertRequest,
): Promise<void> {
  await apiClient.post(
      '/api/v1/admin/concerts',
      request,
  );
}

export async function updateConcert(
    concertId: number,
    request: UpdateConcertRequest,
): Promise<void> {
  await apiClient.patch(
      `/api/v1/admin/concerts/${concertId}`,
      request,
  );
}

export async function updateConcertStatus(
    concertId: number,
    request: UpdateConcertStatusRequest,
): Promise<void> {
  await apiClient.patch(
      `/api/v1/admin/concerts/${concertId}/status`,
      request,
  );
}