export type ConcertCategory =
    | 'CONCERT'
    | 'MUSICAL'
    | 'PLAY'
    | 'CLASSIC'
    | 'DANCE'
    | 'ETC';

export type AgeRating =
    | 'ALL'
    | 'AGE_7'
    | 'AGE_12'
    | 'AGE_15'
    | 'AGE_19';

export type ConcertStatus =
    | 'DRAFT'
    | 'PUBLISHED'
    | 'CLOSED'
    | 'CANCELLED';

export interface AdminConcert {
  concertId: number;

  title: string;
  subtitle: string | null;
  description: string | null;

  category: ConcertCategory;

  runningTime: number | null;

  ageRating: AgeRating;

  posterUrl: string | null;

  status: ConcertStatus;
}

export interface GetAdminConcertsResponse {
  concerts: AdminConcert[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;
}

export interface GetAdminConcertsParams {
  page: number;
  size: number;

  keyword?: string;
  category?: ConcertCategory;
  status?: ConcertStatus;
}

export interface CreateConcertRequest {
  title: string;
  subtitle: string | null;
  description: string | null;

  category: ConcertCategory;

  runningTime: number | null;

  ageRating: AgeRating;

  posterUrl: string | null;
}

export interface UpdateConcertRequest {
  title: string;
  subtitle: string | null;
  description: string | null;

  category: ConcertCategory;

  runningTime: number | null;

  ageRating: AgeRating;

  posterUrl: string | null;
}

export interface UpdateConcertStatusRequest {
  status: ConcertStatus;
}
