interface TossPaymentAmount {
  value: number;
  currency: 'KRW';
}

interface TossPaymentRequest {
  orderId: string;
  orderName: string;

  successUrl: string;
  failUrl: string;

  customerEmail?: string;
  customerName?: string;
  customerMobilePhone?: string;
}

interface TossPaymentMethod {
  code: string;
  methodId?: string;
}

interface TossPaymentWindow {
  on(
      eventName: 'paymentRequest',
      callback: (
          paymentMethod: TossPaymentMethod,
      ) => void | Promise<void>,
  ): void;

  destroy(): Promise<void> | void;
}

interface TossPaymentWidgets {
  setAmount(
      amount: TossPaymentAmount,
  ): Promise<void> | void;

  renderPaymentWindow(
      options?: {
        variantKey?: {
          paymentMethod?: string;
          agreement?: string;
        };
      },
  ): Promise<TossPaymentWindow>;

  requestPayment(
      request: TossPaymentRequest,
  ): Promise<void> | void;
}

interface TossPaymentsInstance {
  widgets(options: {
    customerKey: string;
  }): TossPaymentWidgets;
}

declare function TossPayments(
    clientKey: string,
): TossPaymentsInstance;
