import { apiClient } from '@/lib/api/apiClient';

import type {
  CancelPaymentRequest,
  ConfirmPaymentRequest,
  PaymentResponse,
  PreparePaymentRequest,
  PreparePaymentResponse,
} from '../types/payment';

export async function preparePayment(
    reservationId: number,
    request: PreparePaymentRequest,
): Promise<PreparePaymentResponse> {
  const { data } =
      await apiClient.post<PreparePaymentResponse>(
          `/api/v1/reservations/${reservationId}/payments`,
          request,
      );

  return data;
}

export async function confirmPayment(
    paymentId: number,
    request: ConfirmPaymentRequest,
): Promise<PaymentResponse> {
  const { data } =
      await apiClient.post<PaymentResponse>(
          `/api/v1/payments/${paymentId}/confirm`,
          request,
      );

  return data;
}

export async function cancelPayment(
    paymentId: number,
    request: CancelPaymentRequest,
): Promise<PaymentResponse> {
  const { data } =
      await apiClient.post<PaymentResponse>(
          `/api/v1/payments/${paymentId}/cancel`,
          request,
      );

  return data;
}
