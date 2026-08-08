import {
  apiClient,
  publicApiClient,
} from '@/lib/api/apiClient';

import type {
  AuthenticationResponse,
  SendEmailVerificationRequest,
  SendPhoneVerificationRequest,
  SignInRequest,
  VerificationTokenResponse,
  VerifyEmailRequest,
  VerifyPhoneRequest,
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
  await apiClient.post(
      '/api/v1/auth/sign-out',
  );
}

export async function sendEmailVerification(
    request: SendEmailVerificationRequest,
): Promise<void> {
  await publicApiClient.post(
      '/api/v1/auth/email-verifications',
      request,
  );
}

export async function verifyEmail(
    request: VerifyEmailRequest,
): Promise<VerificationTokenResponse> {
  const { data } =
      await publicApiClient.post<VerificationTokenResponse>(
          '/api/v1/auth/email-verifications/verify',
          request,
      );

  return data;
}

export async function sendPhoneVerification(
    request: SendPhoneVerificationRequest,
): Promise<void> {
  await publicApiClient.post(
      '/api/v1/auth/phone-verifications',
      request,
  );
}

export async function verifyPhone(
    request: VerifyPhoneRequest,
): Promise<VerificationTokenResponse> {
  const { data } =
      await publicApiClient.post<VerificationTokenResponse>(
          '/api/v1/auth/phone-verifications/verify',
          request,
      );

  return data;
}
