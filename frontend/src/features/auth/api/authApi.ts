import {
  apiClient,
  publicApiClient,
} from '@/lib/api/apiClient';

import type {
  AuthenticationResponse,
  SignInRequest,
} from '../types/auth';

export async function signIn(
    request: SignInRequest,
): Promise<AuthenticationResponse> {
  const { data } =
      await publicApiClient.post<AuthenticationResponse>(
          '/api/v1/auth/sign-in',
          request,
      );

  return data;
}

export async function reissue(): Promise<AuthenticationResponse> {
  const { data } =
      await publicApiClient.post<AuthenticationResponse>(
          '/api/v1/auth/reissue',
      );

  return data;
}

export async function signOut(): Promise<void> {
  await apiClient.post('/api/v1/auth/sign-out');
}
