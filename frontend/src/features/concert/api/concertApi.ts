import { publicApiClient } from '@/lib/api/apiClient';

import type {
  ConcertDetailResponse,
  ConcertListResponse,
} from '../types/concert';

export async function getConcerts(): Promise<ConcertListResponse> {
  const { data } =
      await publicApiClient.get<ConcertListResponse>(
          '/api/v1/concerts',
      );

  return data;
}

export async function getConcert(
    concertId: number,
): Promise<ConcertDetailResponse> {
  const { data } =
      await publicApiClient.get<ConcertDetailResponse>(
          `/api/v1/concerts/${concertId}`,
      );

  return data;
}
