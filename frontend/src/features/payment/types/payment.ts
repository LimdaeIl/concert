export interface PreparePaymentRequest {
  provider: 'TOSS';
}

export interface PreparePaymentResponse {
  paymentId: number;
  paymentNumber: string;
  provider: string;
  amount: number;
}

export interface ConfirmPaymentRequest {
  amount: number;

  providerData: {
    paymentKey: string;
    orderId: string;
  };
}

export interface PaymentResponse {
  paymentId: number;
  paymentNumber: string;
  reservationId: number;

  provider: string;
  method: string | null;
  providerPaymentId: string | null;

  amount: number;
  status: string;

  failureCode: string | null;
  failureMessage: string | null;

  requestedAt: string | null;
  approvedAt: string | null;
  cancelledAt: string | null;
}

export interface CancelPaymentRequest {
  reason: string;
  providerData: Record<string, string>;
}