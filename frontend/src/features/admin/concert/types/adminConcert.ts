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

  /*
   * Backend에서는 DB object key를
   * Presigned GET URL로 변환한 뒤 반환한다.
   */
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

/*
 * ============================================================
 * Concert Mutation
 * ============================================================
 *
 * 포스터는 공연 기본정보 Request에서 제거한다.
 * 포스터는 별도의 S3 lifecycle API로 관리한다.
 */

export interface CreateConcertRequest {
  title: string;
  subtitle: string | null;
  description: string | null;

  category: ConcertCategory;

  runningTime: number | null;

  ageRating: AgeRating;
}

export interface UpdateConcertRequest {
  title: string;
  subtitle: string | null;
  description: string | null;

  category: ConcertCategory;

  runningTime: number | null;

  ageRating: AgeRating;
}

export interface UpdateConcertStatusRequest {
  status: ConcertStatus;
}

/*
 * POST /api/v1/admin/concerts
 *
 * Backend ConcertResponse와 동일한 구조.
 */
export type ConcertMutationResponse =
    AdminConcert;

/*
 * ============================================================
 * Concert Poster
 * ============================================================
 */

export interface CreateConcertPosterUploadUrlRequest {
  contentType: string;
}

export interface ConcertPosterUploadUrlResponse {
  objectKey: string;
  uploadUrl: string;
  expiresAt: string;
}

export interface UpdateConcertPosterRequest {
  objectKey: string;
}
