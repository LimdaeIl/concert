import {
  apiClient,
  publicApiClient,
} from '@/lib/api/apiClient';

import type {
  ChangeEmailRequest,
  ChangePhoneRequest,
  MemberMeResponse,
  SignUpRequest,
  SignUpResponse,
  UpdateMemberProfileRequest,
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
