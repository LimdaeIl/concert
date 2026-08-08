import axios from 'axios';
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import {
  useEffect,
  useState,
} from 'react';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import { getMe } from '@/features/member/api/memberApi';
import { getMyBookingReservation } from '@/features/reservation/api/reservationApi';
import type { MyReservationDetail } from '@/features/reservation/types/reservation';
import { getApiErrorMessage } from '@/lib/api/getApiErrorMessage';

import { preparePayment } from '../api/paymentApi';
import { getTossCustomerKey } from '../lib/getTossCustomerKey';
import { savePaymentSession } from '../lib/paymentSession';
import type { PreparePaymentResponse } from '../types/payment';

import ConcertPoster from '@/features/concert/components/ConcertPoster';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { reservationId } = useParams();

  const numericReservationId =
      Number(reservationId);

  const [
    reservation,
    setReservation,
  ] =
      useState<MyReservationDetail | null>(
          null,
      );

  const [
    preparedPayment,
    setPreparedPayment,
  ] =
      useState<PreparePaymentResponse | null>(
          null,
      );

  const [loading, setLoading] =
      useState(true);

  const [openingPayment, setOpeningPayment] =
      useState(false);

  const [errorMessage, setErrorMessage] =
      useState('');

  useEffect(() => {
    let active = true;

    async function initialize() {
      if (
          !Number.isInteger(
              numericReservationId,
          ) ||
          numericReservationId <= 0
      ) {
        setErrorMessage(
            '잘못된 예약 정보입니다.',
        );

        setLoading(false);
        return;
      }

      try {
        const response =
            await getMyBookingReservation(
                numericReservationId,
            );

        if (!active) {
          return;
        }

        if (!response.requiresPayment) {
          setErrorMessage(
              '결제가 필요한 예약이 아닙니다.',
          );

          return;
        }

        if (
            response.reservationStatus !==
            'PENDING_PAYMENT'
        ) {
          setErrorMessage(
              '결제할 수 있는 예약 상태가 아닙니다.',
          );

          return;
        }

        setReservation(response);
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(
            getApiErrorMessage(
                error,
                '결제 정보를 불러오지 못했습니다.',
            ),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [
    numericReservationId,
  ]);

  async function resolvePayment(): Promise<PreparePaymentResponse> {
    if (!reservation) {
      throw new Error(
          '예약 정보가 없습니다.',
      );
    }

    /*
     * 이미 이 화면에서 결제 준비를 완료했다면
     * 같은 payment를 다시 사용한다.
     */
    if (preparedPayment) {
      return preparedPayment;
    }

    try {
      /*
       * 우선 백엔드에 새로운 결제 준비를 요청한다.
       *
       * 활성 결제가 없다면:
       * 201 → 새로운 payment 생성
       */
      const payment =
          await preparePayment(
              reservation.reservationId,
              {
                provider: 'TOSS',
              },
          );

      setPreparedPayment(payment);

      return payment;
    } catch (error) {
      /*
       * 백엔드가 409를 반환했다면
       * 이미 활성 결제가 존재할 가능성이 있다.
       *
       * status 이름을 READY/PENDING 등으로
       * 프론트에서 추측하지 않고,
       * My Booking 상세의 최신 payment를 사용한다.
       */
      if (
          axios.isAxiosError(error) &&
          error.response?.status === 409 &&
          reservation.payment
      ) {
        if (
            reservation.payment.provider !==
            'TOSS'
        ) {
          throw new Error(
              '이미 다른 결제수단으로 진행 중인 결제가 있습니다.',
          );
        }

        const existingPayment: PreparePaymentResponse =
            {
              paymentId:
              reservation.payment.paymentId,

              paymentNumber:
              reservation.payment
                  .paymentNumber,

              provider:
              reservation.payment.provider,

              /*
               * My Booking payment에는 amount가 없으므로
               * 예약 총액을 사용한다.
               *
               * 실제 보안 검증은 반드시
               * 백엔드 confirm에서 다시 수행해야 한다.
               */
              amount:
              reservation.totalAmount,
            };

        setPreparedPayment(
            existingPayment,
        );

        return existingPayment;
      }

      throw error;
    }
  }

  async function handleOpenPayment() {
    if (!reservation) {
      return;
    }

    const clientKey =
        import.meta.env
            .VITE_TOSS_PAYMENTS_CLIENT_KEY;

    if (!clientKey) {
      setErrorMessage(
          'Toss Payments 클라이언트 키가 설정되지 않았습니다.',
      );

      return;
    }

    setOpeningPayment(true);
    setErrorMessage('');

    try {
      /*
       * 1. 회원정보 조회
       * 2. 결제 준비 또는 기존 결제 복구
       *
       * 서로 독립적인 작업이므로 병렬 실행한다.
       */
      const [
        member,
        payment,
      ] = await Promise.all([
        getMe(),
        resolvePayment(),
      ]);

      /*
       * Toss 성공 URL에서 검증할 수 있도록
       * 결제 준비 정보를 sessionStorage에 저장한다.
       */
      savePaymentSession({
        paymentId:
        payment.paymentId,

        reservationId:
        reservation.reservationId,

        paymentNumber:
        payment.paymentNumber,

        amount:
        payment.amount,
      });

      const tossPayments =
          TossPayments(clientKey);

      const widgets =
          tossPayments.widgets({
            customerKey:
                getTossCustomerKey(),
          });

      await widgets.setAmount({
        currency: 'KRW',
        value:
        payment.amount,
      });

      const paymentWindow =
          await widgets.renderPaymentWindow();

      paymentWindow.on(
          'paymentRequest',
          async () => {
            await widgets.requestPayment({
              orderId:
              payment.paymentNumber,

              orderName:
                  createOrderName(
                      reservation,
                  ),

              customerEmail:
              member.email,

              customerName:
              member.name,

              customerMobilePhone:
              member.phone,

              successUrl:
                  `${window.location.origin}` +
                  `/payments/${payment.paymentId}/success`,

              failUrl:
                  `${window.location.origin}` +
                  `/payments/${payment.paymentId}/fail`,
            });
          },
      );
    } catch (error) {
      setOpeningPayment(false);

      setErrorMessage(
          getApiErrorMessage(
              error,
              '결제창을 열지 못했습니다.',
          ),
      );
    }
  }

  if (loading) {
    return (
        <div className="flex min-h-dvh items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

            <p className="text-sm text-slate-500">
              결제 정보를 확인하고 있습니다.
            </p>
          </div>
        </div>
    );
  }

  if (
      errorMessage &&
      !reservation
  ) {
    return (
        <div className="min-h-dvh">
          <header className="flex h-14 items-center border-b border-slate-100 px-4">
            <button
                type="button"
                onClick={() =>
                    navigate(-1)
                }
                className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100"
                aria-label="뒤로가기"
            >
              <ArrowLeft size={22} />
            </button>

            <h1 className="ml-2 text-base font-semibold text-slate-900">
              결제
            </h1>
          </header>

          <div className="px-5 py-8">
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        </div>
    );
  }

  if (!reservation) {
    return null;
  }

  return (
      <div className="min-h-dvh pb-32">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-slate-100 bg-white px-4">
          <button
              type="button"
              onClick={() =>
                  navigate(-1)
              }
              className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100"
              aria-label="뒤로가기"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="ml-2 text-base font-semibold text-slate-900">
            결제
          </h1>
        </header>

        <section className="px-5 pt-7">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <CreditCard size={26} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-950">
            결제 정보를 확인해주세요
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            결제수단 선택과 인증은 Toss Payments에서
            안전하게 진행됩니다.
          </p>
        </section>

        <section className="mt-8 px-5">
          <div className="flex gap-4 rounded-2xl border border-slate-200 p-4">
            <div className="aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              <ConcertPoster
                  src={
                    reservation.concert
                        .posterUrl
                  }
                  alt={`${reservation.concert.title} 포스터`}
                  className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1 py-1">
              <p className="text-xs font-semibold text-indigo-600">
                {
                  reservation.concert
                      .category
                }
              </p>

              <h3 className="mt-1 line-clamp-2 text-base font-bold leading-6 text-slate-900">
                {
                  reservation.concert
                      .title
                }
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {
                  reservation.venue
                      .name
                }
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {
                  reservation.venue
                      .venueHallName
                }
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 px-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <PaymentInfoRow
                label="예약번호"
                value={
                  reservation.reservationNumber
                }
            />

            <PaymentInfoRow
                label="티켓 수"
                value={`${reservation.seats.length}매`}
            />

            <PaymentInfoRow
                label="결제 Provider"
                value="Toss Payments"
            />

            <div className="flex items-end justify-between bg-slate-50 px-5 py-5">
            <span className="text-sm font-semibold text-slate-800">
              최종 결제금액
            </span>

              <strong className="text-2xl text-indigo-600">
                {reservation.totalAmount.toLocaleString(
                    'ko-KR',
                )}
                원
              </strong>
            </div>
          </div>
        </section>

        {preparedPayment && (
            <section className="mt-5 px-5">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400">
                  결제번호
                </p>

                <p className="mt-1 break-all text-sm font-medium text-slate-700">
                  {
                    preparedPayment.paymentNumber
                  }
                </p>
              </div>
            </section>
        )}

        <section className="mt-6 px-5">
          <div className="flex gap-3 rounded-2xl bg-emerald-50 p-4">
            <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
            />

            <div>
              <p className="text-sm font-semibold text-emerald-700">
                안전한 결제
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-600">
                카드 및 결제정보는 Toss Payments에서
                처리되며 서비스에 저장되지 않습니다.
              </p>
            </div>
          </div>
        </section>

        {errorMessage && (
            <section className="mt-5 px-5">
              <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </p>
            </section>
        )}

        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[640px] -translate-x-1/2 border-t border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            결제금액
          </span>

            <strong className="text-lg text-slate-950">
              {reservation.totalAmount.toLocaleString(
                  'ko-KR',
              )}
              원
            </strong>
          </div>

          <button
              type="button"
              disabled={openingPayment}
              onClick={() =>
                  void handleOpenPayment()
              }
              className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {openingPayment
                ? '결제창 여는 중...'
                : `${reservation.totalAmount.toLocaleString('ko-KR')}원 결제하기`}
          </button>
        </div>
      </div>
  );
}

interface PaymentInfoRowProps {
  label: string;
  value: string;
}

function PaymentInfoRow({
                          label,
                          value,
                        }: PaymentInfoRowProps) {
  return (
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

        <span className="min-w-0 text-right text-sm font-medium text-slate-900">
        {value}
      </span>
      </div>
  );
}

function createOrderName(
    reservation: MyReservationDetail,
): string {
  const ticketCount =
      reservation.seats.length;

  if (ticketCount <= 1) {
    return reservation.concert.title;
  }

  return `${reservation.concert.title} 외 ${ticketCount - 1}매`;
}
