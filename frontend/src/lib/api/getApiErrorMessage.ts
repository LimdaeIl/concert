import axios from 'axios';

import type {
  ApiProblemDetail,
} from '@/types/api';

export function getApiErrorMessage(
    error: unknown,
    fallbackMessage =
    '요청을 처리하지 못했습니다.',
): string {
  if (!axios.isAxiosError(error)) {
    if (
        error instanceof Error &&
        error.message
    ) {
      return error.message;
    }

    return fallbackMessage;
  }

  if (!error.response) {
    return getNetworkErrorMessage(
        error.code,
        fallbackMessage,
    );
  }

  const status =
      error.response.status;

  const data =
      error.response
          .data as ApiProblemDetail | undefined;

  const invalidParameterMessage =
      getInvalidParameterMessage(
          data?.invalidParameters,
      );

  if (invalidParameterMessage) {
    return invalidParameterMessage;
  }

  if (data?.detail) {
    return data.detail;
  }

  if (data?.title) {
    return data.title;
  }

  return getStatusMessage(
      status,
      fallbackMessage,
  );
}

function getInvalidParameterMessage(
    invalidParameters:
        | ApiProblemDetail['invalidParameters']
        | undefined,
): string | null {
  if (
      !invalidParameters ||
      invalidParameters.length === 0
  ) {
    return null;
  }

  return invalidParameters
  .map(({ name, reason }) => {
    if (!name) {
      return reason;
    }

    return `${name}: ${reason}`;
  })
  .join('\n');
}

function getNetworkErrorMessage(
    code: string | undefined,
    fallbackMessage: string,
): string {
  if (code === 'ECONNABORTED') {
    return '요청 시간이 초과되었습니다.';
  }

  if (
      code === 'ERR_NETWORK'
  ) {
    return '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.';
  }

  return fallbackMessage;
}

function getStatusMessage(
    status: number,
    fallbackMessage: string,
): string {
  switch (status) {
    case 400:
      return '요청 내용을 확인해주세요.';

    case 401:
      return '로그인이 필요하거나 인증 정보가 만료되었습니다.';

    case 403:
      return '이 요청을 수행할 권한이 없습니다.';

    case 404:
      return '요청한 정보를 찾을 수 없습니다.';

    case 409:
      return '현재 상태에서는 요청을 처리할 수 없습니다.';

    case 422:
      return '입력한 정보를 처리할 수 없습니다.';

    case 429:
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';

    case 500:
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

    case 502:
      return '외부 서비스와 통신하는 중 오류가 발생했습니다.';

    case 503:
      return '현재 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.';

    default:
      return fallbackMessage;
  }
}
