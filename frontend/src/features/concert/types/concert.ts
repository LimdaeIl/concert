export interface Concert {
  concertId: number;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  runningTime: number;
  ageRating: string;
  posterUrl: string;
  status: string;
}

export interface ConcertListResponse {
  concerts: Concert[];
}

export type ConcertDetailResponse = Concert;

/*
 * ============================================================
 * 인기 공연
 * ============================================================
 *
 * 백엔드:
 *
 * GET /api/v1/concerts/popular
 *
 * 인기 기준:
 *
 * COMPLETED 예약에 포함된 실제 판매 좌석 수
 */
export interface PopularConcert {
  concertId: number;
  title: string;
  subtitle: string;
  category: string;
  ageRating: string;
  posterUrl: string;

  /*
   * 결제까지 완료된 예약 좌석 수.
   */
  completedReservationSeatCount: number;

  /*
   * 인기 순위.
   *
   * 1부터 시작한다.
   */
  rank: number;
}

export interface PopularConcertListResponse {
  concerts: PopularConcert[];
}
