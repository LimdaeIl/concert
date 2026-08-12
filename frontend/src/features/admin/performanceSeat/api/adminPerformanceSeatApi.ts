import {
  apiClient,
} from '@/lib/api/apiClient';

import type {
  BulkCreatePerformanceSeatsRequest,
  GetAdminPerformanceSeatCandidateMapResponse,
  GetAdminPerformanceSeatCandidatesParams,
  GetAdminPerformanceSeatCandidatesResponse,
  GetAdminPerformanceSeatsParams,
  GetAdminPerformanceSeatsResponse,
  UpdatePerformanceSeatRequest,
  UpdatePerformanceSeatStatusRequest,
} from '../types/adminPerformanceSeat';

/*
 * ============================================================
 * Performance Seat List
 * ============================================================
 */

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

/*
 * ============================================================
 * 기존 Candidate List
 *
 * 검색 / pagination 용.
 * ============================================================
 */

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

/*
 * ============================================================
 * Candidate Seat Map
 *
 * 배치도 전용 전체 조회.
 * ============================================================
 */

export async function getAdminPerformanceSeatCandidateMap(
    performanceId: number,
): Promise<GetAdminPerformanceSeatCandidateMapResponse> {
  const { data } =
      await apiClient.get<GetAdminPerformanceSeatCandidateMapResponse>(
          `/api/v1/admin/performances/${performanceId}/candidate-seat-map`,
      );

  return data;
}

/*
 * ============================================================
 * Create
 * ============================================================
 */

export async function bulkCreatePerformanceSeats(
    performanceId: number,
    request: BulkCreatePerformanceSeatsRequest,
): Promise<void> {
  await apiClient.post(
      `/api/v1/admin/performances/${performanceId}/seats/bulk`,
      request,
  );
}

/*
 * ============================================================
 * Update
 * ============================================================
 */

export async function updatePerformanceSeat(
    performanceSeatId: number,
    request: UpdatePerformanceSeatRequest,
): Promise<void> {
  await apiClient.patch(
      `/api/v1/admin/performance-seats/${performanceSeatId}`,
      request,
  );
}

/*
 * ============================================================
 * Administrative Status
 * ============================================================
 */

export async function updatePerformanceSeatStatus(
    performanceSeatId: number,
    request: UpdatePerformanceSeatStatusRequest,
): Promise<void> {
  await apiClient.patch(
      `/api/v1/admin/performance-seats/${performanceSeatId}/status`,
      request,
  );
}
