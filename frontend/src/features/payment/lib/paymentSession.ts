export interface PaymentSession {
  paymentId: number;
  reservationId: number;
  paymentNumber: string;
  amount: number;
}

const PREFIX =
    'concert_payment_';

function getStorageKey(
    paymentId: number,
): string {
  return `${PREFIX}${paymentId}`;
}

export function savePaymentSession(
    session: PaymentSession,
): void {
  sessionStorage.setItem(
      getStorageKey(
          session.paymentId,
      ),
      JSON.stringify(session),
  );
}

export function getPaymentSession(
    paymentId: number,
): PaymentSession | null {
  const value =
      sessionStorage.getItem(
          getStorageKey(paymentId),
      );

  if (!value) {
    return null;
  }

  try {
    const parsed =
        JSON.parse(
            value,
        ) as PaymentSession;

    if (
        parsed.paymentId !==
        paymentId ||
        !parsed.paymentNumber ||
        !Number.isFinite(
            parsed.amount,
        )
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function removePaymentSession(
    paymentId: number,
): void {
  sessionStorage.removeItem(
      getStorageKey(paymentId),
  );
}
