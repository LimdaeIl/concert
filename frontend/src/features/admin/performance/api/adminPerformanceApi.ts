import {
  apiClient,
} from '@/lib/api/apiClient';

import type {
  CreatePerformanceRequest,
  GetAdminPerformancesParams,
  GetAdminPerformancesResponse,
  UpdatePerformanceRequest,
  UpdatePerformanceStatusRequest,
} from '../types/adminPerformance';

export async function getAdminPerformances(
    concertId: number,
    params: GetAdminPerformancesParams,
): Promise<GetAdminPerformancesResponse> {
  const { data } =
      await apiClient.get<GetAdminPerformancesResponse>(
          `/api/v1/admin/concerts/${concertId}/performances`,
          {
            params: {
              page:
              params.page,

              size:
              params.size,

              status:
                  params.status ||
                  undefined,

              from:
                  params.from ||
                  undefined,

              to:
                  params.to ||
                  undefined,
            },
          },
      );

  return data;
}

export async function createPerformance(
    concertId: number,
    request: CreatePerformanceRequest,
): Promise<void> {
  await apiClient.post(
      `/api/v1/admin/concerts/${concertId}/performances`,
      request,
  );
}

export async function updatePerformance(
    performanceId: number,
    request: UpdatePerformanceRequest,
): Promise<void> {
  await apiClient.patch(
      `/api/v1/admin/performances/${performanceId}`,
      request,
  );
}

export async function updatePerformanceStatus(
    performanceId: number,
    request: UpdatePerformanceStatusRequest,
): Promise<void> {
  await apiClient.patch(
      `/api/v1/admin/performances/${performanceId}/status`,
      request,
  );
}
