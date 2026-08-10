import {
  apiClient,
} from '@/lib/api/apiClient';

import type {
  BulkCreatePerformanceSeatsRequest,
  GetAdminPerformanceSeatCandidatesParams,
  GetAdminPerformanceSeatCandidatesResponse,
  GetAdminPerformanceSeatsParams,
  GetAdminPerformanceSeatsResponse,
  UpdatePerformanceSeatRequest,
  UpdatePerformanceSeatStatusRequest,
} from '../types/adminPerformanceSeat';

export async function getAdminPerformanceSeats(
    performanceId: number,
    params: GetAdminPerformanceSeatsParams,
): Promise<GetAdminPerformanceSeatsResponse> {
  const { data } =
      await apiClient.get<GetAdminPerformanceSeatsResponse>(
          `/api/v1/admin/performances/${performanceId}/seats`,
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

              grade:
                  params.grade ||
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

export async function getAdminPerformanceSeatCandidates(
    performanceId: number,
    params: GetAdminPerformanceSeatCandidatesParams,
): Promise<GetAdminPerformanceSeatCandidatesResponse> {
  const { data } =
      await apiClient.get<GetAdminPerformanceSeatCandidatesResponse>(
          `/api/v1/admin/performances/${performanceId}/candidate-seats`,
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
            },
          },
      );

  return data;
}

export async function bulkCreatePerformanceSeats(
    performanceId: number,
    request: BulkCreatePerformanceSeatsRequest,
): Promise<void> {
  await apiClient.post(
      `/api/v1/admin/performances/${performanceId}/seats/bulk`,
      request,
  );
}

export async function updatePerformanceSeat(
    performanceSeatId: number,
    request: UpdatePerformanceSeatRequest,
): Promise<void> {
  await apiClient.patch(
      `/api/v1/admin/performance-seats/${performanceSeatId}`,
      request,
  );
}

export async function updatePerformanceSeatStatus(
    performanceSeatId: number,
    request: UpdatePerformanceSeatStatusRequest,
): Promise<void> {
  await apiClient.patch(
      `/api/v1/admin/performance-seats/${performanceSeatId}/status`,
      request,
  );
}
