import {
  AlertCircle,
} from 'lucide-react';
import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import {
  getPaymentSession,
} from '../lib/paymentSession';

export default function PaymentFailPage() {
  const navigate = useNavigate();

  const { paymentId } =
      useParams();

  const [searchParams] =
      useSearchParams();

  const numericPaymentId =
      Number(paymentId);

  const code =
      searchParams.get('code');

  const message =
      searchParams.get('message');

  const session =
      Number.isInteger(
          numericPaymentId,
      )
          ? getPaymentSession(
              numericPaymentId,
          )
          : null;

  const userCancelled =
      code === 'PAY_PROCESS_CANCELED';

  return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertCircle
              size={38}
              strokeWidth={1.8}
          />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-950">
          {userCancelled
              ? '결제를 취소했습니다'
              : '결제에 실패했습니다'}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {message ||
              '결제 과정에서 문제가 발생했습니다.'}
        </p>

        {code && (
            <p className="mt-2 text-xs text-slate-400">
              {code}
            </p>
        )}

        {session && (
            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/reservations/${session.reservationId}/payment`,
                        {
                          replace: true,
                        },
                    )
                }
                className="mt-8 h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white"
            >
              다시 결제하기
            </button>
        )}

        <button
            type="button"
            onClick={() =>
                navigate(
                    '/reservations',
                    {
                      replace: true,
                    },
                )
            }
            className="mt-3 h-12 w-full rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
        >
          예매 내역으로
        </button>
      </div>
  );
}
