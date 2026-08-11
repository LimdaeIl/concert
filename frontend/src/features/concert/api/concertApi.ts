import { publicApiClient } from '@/lib/api/apiClient';

import type {
  ConcertDetailResponse,
  ConcertListResponse,
  PopularConcertListResponse,
} from '../types/concert';

/*
 * ============================================================
 * 공개 공연 목록
 * ============================================================
 */
export async function getConcerts(): Promise<ConcertListResponse> {
  const { data } =
      await publicApiClient.get<ConcertListResponse>(
          '/api/v1/concerts',
      );

  return data;
}

/*
 * ============================================================
 * 공연 상세
 * ============================================================
 */
export async function getConcert(
    concertId: number,
): Promise<ConcertDetailResponse> {
  const { data } =
      await publicApiClient.get<ConcertDetailResponse>(
          `/api/v1/concerts/${concertId}`,
      );

  return data;
}

/*
 * ============================================================
 * 인기 공연 TOP 10
 * ============================================================
 *
 * 현재 V1에서는 Redis Cache를 사용하지 않는다.
 *
 * 백엔드가 MySQL에서 COMPLETED 예약 좌석 수를
 * 직접 집계한 결과를 반환한다.
 *
 * 이후 Redis Cache 도입 전/후 성능 비교 대상이 되는 API다.
 */
export async function getPopularConcerts(): Promise<PopularConcertListResponse> {
  const { data } =
      await publicApiClient.get<PopularConcertListResponse>(
          '/api/v1/concerts/popular',
      );

  return data;
}
