import {
  CheckCircle2,
} from 'lucide-react';
import {
  useEffect,
  useState,
} from 'react';
import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { getApiErrorMessage } from '@/lib/api/getApiErrorMessage';

import { confirmPayment } from '../api/paymentApi';
import {
  getPaymentSession,
  removePaymentSession,
} from '../lib/paymentSession';

type PaymentState =
    | 'confirming'
    | 'success'
    | 'error';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  const { paymentId } =
      useParams();

  const [searchParams] =
      useSearchParams();

  const numericPaymentId =
      Number(paymentId);

  const [state, setState] =
      useState<PaymentState>(
          'confirming',
      );

  const [reservationId, setReservationId] =
      useState<number | null>(null);

  const [errorMessage, setErrorMessage] =
      useState('');

  useEffect(() => {
    let active = true;

    async function confirm() {
      const paymentKey =
          searchParams.get(
              'paymentKey',
          );

      const orderId =
          searchParams.get(
              'orderId',
          );

      const amountString =
          searchParams.get(
              'amount',
          );

      const amount =
          Number(amountString);

      if (
          !Number.isInteger(
              numericPaymentId,
          ) ||
          numericPaymentId <= 0 ||
          !paymentKey ||
          !orderId ||
          !Number.isFinite(amount)
      ) {
        setState('error');

        setErrorMessage(
            '결제 인증 정보가 올바르지 않습니다.',
        );

        return;
      }

      const session =
          getPaymentSession(
              numericPaymentId,
          );

      if (!session) {
        setState('error');

        setErrorMessage(
            '결제 준비 정보를 찾을 수 없습니다.',
        );

        return;
      }

      if (
          session.paymentNumber !==
          orderId ||
          session.amount !== amount
      ) {
        setState('error');

        setErrorMessage(
            '결제 정보가 일치하지 않습니다.',
        );

        return;
      }

      try {
        const payment =
            await confirmPayment(
                numericPaymentId,
                {
                  // 쿼리 amount를 그대로 신뢰하지 않고
                  // 우리가 결제 준비 때 저장한 금액을 전달한다.
                  amount:
                  session.amount,

                  providerData: {
                    paymentKey,
                    orderId,
                  },
                },
            );

        if (!active) {
          return;
        }

        removePaymentSession(
            numericPaymentId,
        );

        setReservationId(
            payment.reservationId,
        );

        setState('success');
      } catch (error) {
        if (!active) {
          return;
        }

        setState('error');

        setErrorMessage(
            getApiErrorMessage(
                error,
                '결제 승인에 실패했습니다.',
            ),
        );
      }
    }

    void confirm();

    return () => {
      active = false;
    };
  }, [
    numericPaymentId,
    searchParams,
  ]);

  if (state === 'confirming') {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center px-5">
          <div className="size-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">
            결제를 승인하고 있습니다.
          </p>
        </div>
    );
  }

  if (state === 'error') {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-50 text-2xl">
            !
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-950">
            결제를 완료하지 못했습니다
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {errorMessage}
          </p>

          <button
              type="button"
              onClick={() =>
                  navigate(
                      '/reservations',
                  )
              }
              className="mt-8 h-12 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white"
          >
            내 예매 내역 확인
          </button>
        </div>
    );
  }

  return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2
              size={38}
              strokeWidth={1.8}
          />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-950">
          결제가 완료되었습니다
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          예매가 정상적으로 완료되었습니다.
        </p>

        {reservationId && (
            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/reservations/${reservationId}`,
                        {
                          replace: true,
                        },
                    )
                }
                className="mt-8 h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white"
            >
              예매 상세 확인
            </button>
        )}

        <button
            type="button"
            onClick={() =>
                navigate('/', {
                  replace: true,
                })
            }
            className="mt-3 h-12 w-full rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
        >
          홈으로
        </button>
      </div>
  );
}
