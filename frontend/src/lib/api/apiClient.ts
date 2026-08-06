import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import { useAuthStore } from '@/features/auth/store/authStore';
import type { AuthenticationResponse } from '@/features/auth/types/auth';
import type { ProblemDetail } from '@/types/api';

interface RetryableRequestConfig
    extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicApiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let reissuePromise: Promise<string> | null = null;

async function reissueAccessToken(): Promise<string> {
  if (!reissuePromise) {
    reissuePromise = publicApiClient
    .post<AuthenticationResponse>('/api/v1/auth/reissue')
    .then(({ data }) => {
      useAuthStore
      .getState()
      .setAuthentication(data.id, data.accessToken);

      return data.accessToken;
    })
    .finally(() => {
      reissuePromise = null;
    });
  }

  return reissuePromise;
}

apiClient.interceptors.request.use((config) => {
  const accessToken =
      useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
    (response) => response,

    async (error: AxiosError<ProblemDetail>) => {
      const originalRequest = error.config as
          | RetryableRequestConfig
          | undefined;

      const isUnauthorized =
          error.response?.status === 401;

      const isRetryable =
          originalRequest &&
          !originalRequest._retry;

      if (!isUnauthorized || !isRetryable) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const accessToken =
            await reissueAccessToken();

        originalRequest.headers.Authorization =
            `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (reissueError) {
        useAuthStore
        .getState()
        .clearAuthentication();

        return Promise.reject(reissueError);
      }
    },
);
