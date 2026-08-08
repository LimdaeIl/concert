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
