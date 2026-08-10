import {
  apiClient,
  publicApiClient,
} from '@/lib/api/apiClient';

import type {
  ChangeEmailRequest,
  ChangePhoneRequest,
  MemberMeResponse,
  ProfileImageUploadUrlResponse,
  SignUpRequest,
  SignUpResponse,
  UpdateMemberProfileRequest,
  UpdateProfileImageRequest,
} from '../types/member';

export async function signUp(
    request: SignUpRequest,
): Promise<SignUpResponse> {
  const { data } =
      await publicApiClient.post<SignUpResponse>(
          '/api/v1/members/sign-up',
          request,
      );

  return data;
}

export async function getMe(): Promise<MemberMeResponse> {
  const { data } =
      await apiClient.get<MemberMeResponse>(
          '/api/v1/members/me',
      );

  return data;
}

export async function updateMyProfile(
    request: UpdateMemberProfileRequest,
): Promise<MemberMeResponse> {
  const { data } =
      await apiClient.patch<MemberMeResponse>(
          '/api/v1/members/me',
          request,
      );

  return data;
}

export async function changeEmail(
    request: ChangeEmailRequest,
): Promise<void> {
  await apiClient.patch(
      '/api/v1/members/me/email',
      request,
  );
}

export async function changePhone(
    request: ChangePhoneRequest,
): Promise<void> {
  await apiClient.patch(
      '/api/v1/members/me/phone',
      request,
  );
}

export async function deleteMe(): Promise<void> {
  await apiClient.delete(
      '/api/v1/members/me',
  );
}

/*
 * ============================================================
 * Profile Image
 * ============================================================
 */

/*
 * S3에 직접 업로드할 수 있는
 * Presigned PUT URL을 백엔드에서 발급받는다.
 */
export async function createProfileImageUploadUrl(
    contentType: string,
): Promise<ProfileImageUploadUrlResponse> {
  const { data } =
      await apiClient.post<ProfileImageUploadUrlResponse>(
          '/api/v1/members/me/profile-image/upload-url',
          {
            contentType,
          },
      );

  return data;
}

/*
 * 중요:
 *
 * S3 Presigned URL에는 apiClient를 사용하지 않는다.
 *
 * apiClient에는
 * - Backend baseURL
 * - Authorization
 * - Refresh interceptor
 *
 * 등이 있기 때문이다.
 *
 * Presigned URL에는 브라우저가
 * S3로 직접 PUT한다.
 */
export async function uploadProfileImageToS3(
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

            body: file,
          },
      );

  if (!response.ok) {
    throw new Error(
        `S3 이미지 업로드에 실패했습니다. (${response.status})`,
    );
  }
}

/*
 * S3 업로드가 완료된 Object Key를
 * 회원 프로필 이미지로 확정한다.
 */
export async function updateProfileImage(
    request: UpdateProfileImageRequest,
): Promise<void> {
  await apiClient.patch(
      '/api/v1/members/me/profile-image',
      request,
  );
}

/*
 * 프로필 이미지 연결 제거.
 *
 * 실제 S3 Object 삭제는
 * Backend AFTER_COMMIT listener에서 처리한다.
 */
export async function deleteProfileImage(): Promise<void> {
  await apiClient.delete(
      '/api/v1/members/me/profile-image',
  );
}
