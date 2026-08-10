import {
  apiClient,
} from '@/lib/api/apiClient';

import type {
  ConcertMutationResponse,
  ConcertPosterUploadUrlResponse,
  CreateConcertPosterUploadUrlRequest,
  CreateConcertRequest,
  GetAdminConcertsParams,
  GetAdminConcertsResponse,
  UpdateConcertPosterRequest,
  UpdateConcertRequest,
  UpdateConcertStatusRequest,
} from '../types/adminConcert';

/*
 * ============================================================
 * Concert Query
 * ============================================================
 */

export async function getAdminConcerts(
    params: GetAdminConcertsParams,
): Promise<GetAdminConcertsResponse> {
  const { data } =
      await apiClient.get<GetAdminConcertsResponse>(
          '/api/v1/admin/concerts',
          {
            params: {
              page:
              params.page,

              size:
              params.size,

              keyword:
                  params.keyword ||
                  undefined,

              category:
                  params.category ||
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
 * Concert Mutation
 * ============================================================
 */

export async function createConcert(
    request: CreateConcertRequest,
): Promise<ConcertMutationResponse> {
  const { data } =
      await apiClient.post<ConcertMutationResponse>(
          '/api/v1/admin/concerts',
          request,
      );

  return data;
}

export async function updateConcert(
    concertId: number,
    request: UpdateConcertRequest,
): Promise<ConcertMutationResponse> {
  const { data } =
      await apiClient.patch<ConcertMutationResponse>(
          `/api/v1/admin/concerts/${concertId}`,
          request,
      );

  return data;
}

export async function updateConcertStatus(
    concertId: number,
    request: UpdateConcertStatusRequest,
): Promise<ConcertMutationResponse> {
  const { data } =
      await apiClient.patch<ConcertMutationResponse>(
          `/api/v1/admin/concerts/${concertId}/status`,
          request,
      );

  return data;
}

/*
 * ============================================================
 * Concert Poster
 * ============================================================
 */

/*
 * 1.
 * Backend에서 S3 Presigned PUT URL을 발급한다.
 */
export async function createConcertPosterUploadUrl(
    concertId: number,
    request: CreateConcertPosterUploadUrlRequest,
): Promise<ConcertPosterUploadUrlResponse> {
  const { data } =
      await apiClient.post<ConcertPosterUploadUrlResponse>(
          `/api/v1/admin/concerts/${concertId}/poster/upload-url`,
          request,
      );

  return data;
}

/*
 * 2.
 * Browser → S3 직접 PUT.
 *
 * Backend용 apiClient를 사용하면 안 된다.
 * Presigned URL 자체가 완성된 S3 URL이기 때문이다.
 */
export async function uploadConcertPosterToS3(
    uploadUrl: string,
    file: File,
): Promise<void> {
  const response =
      await fetch(
          uploadUrl,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
              file.type,
            },

            body:
            file,
          },
      );

  if (!response.ok) {
    throw new Error(
        `공연 포스터 업로드에 실패했습니다. (${response.status})`,
    );
  }
}

/*
 * 3.
 * S3에 실제 업로드된 object key를
 * Concert.posterUrl 필드에 확정한다.
 */
export async function updateConcertPoster(
    concertId: number,
    request: UpdateConcertPosterRequest,
): Promise<void> {
  await apiClient.patch(
      `/api/v1/admin/concerts/${concertId}/poster`,
      request,
  );
}

/*
 * 4.
 * DB 연결 제거 + Backend AFTER_COMMIT S3 삭제.
 */
export async function deleteConcertPoster(
    concertId: number,
): Promise<void> {
  await apiClient.delete(
      `/api/v1/admin/concerts/${concertId}/poster`,
  );
}

/*
 * ============================================================
 * Complete Poster Upload Flow
 * ============================================================
 *
 * 모달에서 매번 3개의 API를 직접 연결하지 않도록
 * 하나의 유틸 함수로 묶는다.
 */

export async function uploadAndApplyConcertPoster(
    concertId: number,
    file: File,
): Promise<void> {
  /*
   * STEP 1.
   * Presigned PUT URL.
   */
  const upload =
      await createConcertPosterUploadUrl(
          concertId,
          {
            contentType:
            file.type,
          },
      );

  /*
   * STEP 2.
   * Browser → S3.
   */
  await uploadConcertPosterToS3(
      upload.uploadUrl,
      file,
  );

  /*
   * STEP 3.
   * DB object key 확정.
   */
  await updateConcertPoster(
      concertId,
      {
        objectKey:
        upload.objectKey,
      },
  );
}
