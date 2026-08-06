import axios from 'axios';

import type { ProblemDetail } from '@/types/api';

export function getApiErrorMessage(
    error: unknown,
    fallbackMessage = '요청 처리 중 오류가 발생했습니다.',
): string {
  if (!axios.isAxiosError<ProblemDetail>(error)) {
    return fallbackMessage;
  }

  return (
      error.response?.data?.detail ??
      error.message ??
      fallbackMessage
  );
}
