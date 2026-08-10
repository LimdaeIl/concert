import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import { useAuthStore } from '@/features/auth/store/authStore';

interface ReissueResponse {
  id: number;
  accessToken: string;
}

interface RetryableRequestConfig
    extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const baseURL =
    import.meta.env
        .VITE_API_BASE_URL;

export const publicApiClient =
    axios.create({
      baseURL,

      /*
       * Refresh Token이 HttpOnly Cookie이므로
       * 반드시 true여야 한다.
       */
      withCredentials: true,

      headers: {
        'Content-Type':
            'application/json',
      },
    });

export const apiClient =
    axios.create({
      baseURL,

      withCredentials: true,

      headers: {
        'Content-Type':
            'application/json',
      },
    });

/*
 * 여러 API가 동시에 401을 반환해도
 * reissue 요청은 한 번만 발생하도록
 * Promise를 공유한다.
 */
let refreshPromise:
    Promise<string> | null = null;

/*
 * 보호 API 요청 전에
 * 현재 Zustand의 Access Token을 붙인다.
 */
apiClient.interceptors.request.use(
    (config) => {
      const accessToken =
          useAuthStore
          .getState()
              .accessToken;

      if (accessToken) {
        config.headers.Authorization =
            `Bearer ${accessToken}`;
      } else {
        delete config.headers.Authorization;
      }

      return config;
    },

    (error) =>
        Promise.reject(error),
);

/*
 * 보호 API에서 401을 받으면
 *
 * 1. reissue
 * 2. authStore 갱신
 * 3. 원래 요청에 새 Access Token 적용
 * 4. 원래 요청 1회 재시도
 */
apiClient.interceptors.response.use(
    (response) =>
        response,

    async (
        error: AxiosError,
    ) => {
      const originalRequest =
          error.config as
              | RetryableRequestConfig
              | undefined;

      /*
       * 401이 아니면 그대로 실패 처리한다.
       */
      if (
          !originalRequest ||
          error.response?.status !==
          401
      ) {
        return Promise.reject(
            error,
        );
      }

      /*
       * 이미 재시도했던 요청이면
       * 다시 reissue하지 않는다.
       *
       * 무한 루프 방지.
       */
      if (
          originalRequest._retry
      ) {
        return Promise.reject(
            error,
        );
      }

      originalRequest._retry =
          true;

      try {
        const newAccessToken =
            await getRefreshedAccessToken();

        originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`;

        /*
         * 실패했던 원래 API를
         * 새 Access Token으로 다시 호출한다.
         */
        return apiClient(
            originalRequest,
        );
      } catch (refreshError) {
        /*
         * Refresh Token까지 유효하지 않다면
         * 인증 상태를 제거한다.
         *
         * ProtectedRoute가 이를 감지해서
         * /login으로 이동한다.
         */
        useAuthStore
        .getState()
        .clearAuthentication();

        return Promise.reject(
            refreshError,
        );
      }
    },
);

async function getRefreshedAccessToken(): Promise<string> {
  /*
   * 이미 다른 요청이 reissue 중이라면
   * 새로운 reissue 요청을 보내지 않는다.
   */
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise =
      reissueAccessToken();

  try {
    return await refreshPromise;
  } finally {
    /*
     * 성공/실패와 관계없이
     * 완료되면 다시 null로 초기화한다.
     */
    refreshPromise = null;
  }
}
/*
 * 중요:
 *
 * 여기서는 apiClient가 아니라
 * publicApiClient를 사용한다.
 *
 * apiClient를 사용하면 reissue 자체가
 * 401일 때 interceptor로 다시 들어가
 * 무한 재발급이 발생할 수 있다.
 */
async function reissueAccessToken():
    Promise<string> {
  const { data } =
      await publicApiClient.post<ReissueResponse>(
          '/api/v1/auth/reissue',
      );

  useAuthStore
  .getState()
  .setAuthentication(
      data.id,
      data.accessToken,
  );

  return data.accessToken;
}