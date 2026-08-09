import {publicApiClient} from '@/lib/api/apiClient';
import type {
  PerformanceDetailResponse,
  PerformanceListResponse,
  PerformanceSeatListResponse,
} from '../types/performance';

export async function getPerformances(concertId: number,): Promise<PerformanceListResponse> {
  const {data} = await publicApiClient.get<PerformanceListResponse>(`/api/v1/concerts/${concertId}/performances`,);
  return data;
}

export async function getPerformance(performanceId: number,): Promise<PerformanceDetailResponse> {
  const {data} = await publicApiClient.get<PerformanceDetailResponse>(`/api/v1/performances/${performanceId}`,);
  return data;
}

export async function getPerformanceSeats(performanceId: number,): Promise<PerformanceSeatListResponse> {
  const {data} = await publicApiClient.get<PerformanceSeatListResponse>(`/api/v1/performances/${performanceId}/seats`,);
  return data;
}
