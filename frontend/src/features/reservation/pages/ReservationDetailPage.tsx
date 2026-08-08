import type { ReactNode } from 'react';
import ConcertPoster from '@/features/concert/components/ConcertPoster';

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  CreditCard,
  MapPin,
  Ticket,
  XCircle,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import { cancelPayment } from '@/features/payment/api/paymentApi';
import PaymentCancelDialog from '@/features/payment/components/PaymentCancelDialog';
import { useReservationCountdown } from '@/features/reservation/hooks/useReservationCountdown';
import { getApiErrorMessage } from '@/lib/api/getApiErrorMessage';
import {
  formatDate,
  formatDateTime,
  formatTime,
} from '@/lib/date/formatDateTime';

import { getMyBookingReservation } from '../api/reservationApi';
import type { MyReservationDetail } from '../types/reservation';

export default function ReservationDetailPage() {
  const navigate = useNavigate();
  const { reservationId } = useParams();

  const numericReservationId =
      Number(reservationId);

  const [
    reservation,
    setReservation,
  ] = useState<MyReservationDetail | null>(
      null,
  );

  const [loading, setLoading] =
      useState(true);

  const [errorMessage, setErrorMessage] =
      useState('');

  const [
    actionErrorMessage,
    setActionErrorMessage,
  ] = useState('');

  const [
    cancelDialogOpen,
    setCancelDialogOpen,
  ] = useState(false);

  const [cancelling, setCancelling] =
      useState(false);

  const countdown =
      useReservationCountdown(
          reservation?.expiresAt,
      );

  const reloadReservation =
      useCallback(async () => {
        const response =
            await getMyBookingReservation(
                numericReservationId,
            );

        setReservation(response);

        return response;
      }, [numericReservationId]);

  useEffect(() => {
    let active = true;

    async function loadReservation() {
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

        setReservation(response);
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(
            getApiErrorMessage(
                error,
                '예약 정보를 불러오지 못했습니다.',
            ),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadReservation();

    return () => {
      active = false;
    };
  }, [numericReservationId]);

  useEffect(() => {
    if (
        !countdown.expired ||
        reservation?.reservationStatus !==
        'PENDING_PAYMENT'
    ) {
      return;
    }

    void reloadReservation().catch(() => {
      // 만료 직후 자동 재조회 실패 시
      // 현재 화면 상태를 유지한다.
    });
  }, [
    countdown.expired,
    reservation?.reservationStatus,
    reloadReservation,
  ]);

  async function handleRefreshReservation() {
    setActionErrorMessage('');

    try {
      await reloadReservation();
    } catch (error) {
      setActionErrorMessage(
          getApiErrorMessage(
              error,
              '예약 상태를 다시 불러오지 못했습니다.',
          ),
      );
    }
  }

  async function handleCancelPayment(
      reason: string,
  ) {
    if (!reservation?.payment) {
      setActionErrorMessage(
          '취소할 결제 정보를 찾을 수 없습니다.',
      );

      return;
    }

    setCancelling(true);
    setActionErrorMessage('');

    try {
      await cancelPayment(
          reservation.payment.paymentId,
          {
            reason,
            providerData: {},
          },
      );

      await reloadReservation();

      setCancelDialogOpen(false);
    } catch (error) {
      setActionErrorMessage(
          getApiErrorMessage(
              error,
              '예매 취소에 실패했습니다.',
          ),
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
        <div className="flex min-h-dvh items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

            <p className="text-sm text-slate-500">
              예매 정보를 불러오고 있습니다.
            </p>
          </div>
        </div>
    );
  }

  if (
      errorMessage ||
      !reservation
  ) {
    return (
        <div className="min-h-dvh">
          <header className="flex h-14 items-center border-b border-slate-100 px-4">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100"
                aria-label="뒤로가기"
            >
              <ArrowLeft size={22} />
            </button>

            <h1 className="ml-2 text-base font-semibold text-slate-900">
              예매 상세
            </h1>
          </header>

          <div className="px-5 py-8">
            <p className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
              {errorMessage ||
                  '예약 정보를 확인할 수 없습니다.'}
            </p>
          </div>
        </div>
    );
  }

  const isPendingPayment =
      reservation.reservationStatus ===
      'PENDING_PAYMENT';

  const isCancelled =
      reservation.reservationStatus ===
      'CANCELLED';

  const paymentExpired =
      isPendingPayment &&
      reservation.expiresAt !== null &&
      countdown.expired;

  return (
      <>
        <div className="min-h-dvh pb-32">
          <header className="sticky top-0 z-30 flex h-14 items-center border-b border-slate-100 bg-white px-4">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100"
                aria-label="뒤로가기"
            >
              <ArrowLeft size={22} />
            </button>

            <h1 className="ml-2 text-base font-semibold text-slate-900">
              예매 상세
            </h1>
          </header>

          <section className="px-5 pt-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex gap-4 p-4">
                <div className="aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
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
                  <ReservationStatusBadge
                      status={
                        reservation.reservationStatus
                      }
                  />

                  <p className="mt-3 text-xs font-semibold text-indigo-600">
                    {
                      reservation.concert
                          .category
                    }
                  </p>

                  <h2 className="mt-1 line-clamp-2 text-lg font-bold leading-7 text-slate-950">
                    {
                      reservation.concert
                          .title
                    }
                  </h2>

                  {reservation.concert
                      .subtitle && (
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {
                          reservation.concert
                              .subtitle
                        }
                      </p>
                  )}
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 px-5 py-5">
                <InfoRow
                    icon={
                      <CalendarDays size={17} />
                    }
                    label="공연일"
                    value={`${formatDate(
                        reservation.performance
                            .startsAt,
                    )} ${formatTime(
                        reservation.performance
                            .startsAt,
                    )}`}
                />

                <InfoRow
                    icon={
                      <Clock3 size={17} />
                    }
                    label="공연시간"
                    value={`${formatTime(
                        reservation.performance
                            .startsAt,
                    )} ~ ${formatTime(
                        reservation.performance
                            .endsAt,
                    )}`}
                />

                <InfoRow
                    icon={
                      <MapPin size={17} />
                    }
                    label="공연장"
                    value={`${reservation.venue.name} · ${reservation.venue.venueHallName}`}
                />

                <InfoRow
                    icon={
                      <Ticket size={17} />
                    }
                    label="예약번호"
                    value={
                      reservation.reservationNumber
                    }
                    last
                />
              </div>
            </div>
          </section>

          {isPendingPayment &&
              reservation.expiresAt && (
                  <section className="mt-6 px-5">
                    {paymentExpired ? (
                        <div className="flex gap-3 rounded-2xl bg-red-50 p-4">
                          <AlertTriangle
                              size={20}
                              className="mt-0.5 shrink-0 text-red-500"
                          />

                          <div>
                            <p className="text-sm font-semibold text-red-700">
                              결제 시간이 만료되었습니다.
                            </p>

                            <p className="mt-1 text-xs leading-5 text-red-500">
                              서버의 최신 예약 상태를
                              확인해주세요.
                            </p>
                          </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-4">
                          <div className="flex items-center gap-3">
                            <Clock3
                                size={20}
                                className="text-amber-500"
                            />

                            <div>
                              <p className="text-sm font-semibold text-amber-700">
                                결제 대기 중
                              </p>

                              <p className="mt-1 text-xs text-amber-600">
                                남은 시간
                              </p>
                            </div>
                          </div>

                          <strong className="font-mono text-xl text-amber-700">
                            {
                              countdown.remainingText
                            }
                          </strong>
                        </div>
                    )}
                  </section>
              )}

          <section className="mt-8 px-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-950">
                좌석
              </h3>

              <span className="text-sm text-slate-500">
              {reservation.seats.length}매
            </span>
            </div>

            <div className="mt-4 space-y-3">
              {reservation.seats.map(
                  (seat) => (
                      <div
                          key={
                            seat.reservationSeatId
                          }
                          className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                        {seat.grade}
                      </span>

                            <span className="text-sm font-semibold text-slate-900">
                        {seat.sectionName}
                      </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-600">
                            {seat.floor}층 ·{' '}
                            {seat.rowName}열 ·{' '}
                            {seat.seatNumber}번
                          </p>
                        </div>

                        <strong className="text-sm text-slate-900">
                          {seat.price.toLocaleString(
                              'ko-KR',
                          )}
                          원
                        </strong>
                      </div>
                  ),
              )}
            </div>
          </section>

          <section className="mt-8 px-5">
            <h3 className="text-lg font-bold text-slate-950">
              공연장
            </h3>

            <div className="mt-4 rounded-2xl border border-slate-200 p-5">
              <p className="font-semibold text-slate-900">
                {reservation.venue.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {
                  reservation.venue
                      .venueHallName
                }

                {reservation.venue
                    .venueHallFloor
                    ? ` · ${reservation.venue.venueHallFloor}`
                    : ''}
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {
                  reservation.venue
                      .roadAddress
                }

                {reservation.venue
                    .detailAddress
                    ? ` ${reservation.venue.detailAddress}`
                    : ''}
              </p>
            </div>
          </section>

          <section className="mt-8 px-5">
            <h3 className="text-lg font-bold text-slate-950">
              결제
            </h3>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
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

              {reservation.payment ? (
                  <>
                    <DetailRow
                        label="결제번호"
                        value={
                          reservation.payment
                              .paymentNumber
                        }
                    />

                    <DetailRow
                        label="결제사"
                        value={
                          reservation.payment
                              .provider
                        }
                    />

                    <DetailRow
                        label="결제수단"
                        value={
                            reservation.payment
                                .method || '-'
                        }
                    />

                    <DetailRow
                        label="결제상태"
                        value={
                          reservation.payment
                              .status
                        }
                        last
                    />
                  </>
              ) : (
                  <div className="px-5 py-4">
                    <p className="text-sm text-slate-500">
                      아직 결제 정보가 없습니다.
                    </p>
                  </div>
              )}
            </div>
          </section>

          {reservation.canCancel &&
              reservation.payment && (
                  <section className="mt-6 px-5">
                    <button
                        type="button"
                        onClick={() => {
                          setActionErrorMessage('');
                          setCancelDialogOpen(true);
                        }}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <XCircle size={18} />

                      예매 취소
                    </button>

                    <p className="mt-2 text-center text-xs text-slate-400">
                      결제 전체 취소가 진행됩니다.
                    </p>
                  </section>
              )}

          {actionErrorMessage && (
              <section className="mt-5 px-5">
                <p
                    role="alert"
                    className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {actionErrorMessage}
                </p>
              </section>
          )}

          <section className="mt-8 px-5">
            <h3 className="text-lg font-bold text-slate-950">
              예약 정보
            </h3>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <DetailRow
                  label="예약일"
                  value={formatDateTime(
                      reservation.reservedAt,
                  )}
              />

              {reservation.expiresAt && (
                  <DetailRow
                      label="결제 만료"
                      value={formatDateTime(
                          reservation.expiresAt,
                      )}
                  />
              )}

              {reservation.completedAt && (
                  <DetailRow
                      label="예매 완료"
                      value={formatDateTime(
                          reservation.completedAt,
                      )}
                  />
              )}

              {reservation.cancelledAt && (
                  <DetailRow
                      label="취소일"
                      value={formatDateTime(
                          reservation.cancelledAt,
                      )}
                  />
              )}

              {reservation.refundStatus && (
                  <DetailRow
                      label="환불 상태"
                      value={
                        reservation.refundStatus
                      }
                      last
                  />
              )}
            </div>
          </section>

          <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[640px] -translate-x-1/2 border-t border-slate-200 bg-white p-4">
            {reservation.requiresPayment &&
            !paymentExpired ? (
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/reservations/${reservation.reservationId}/payment`,
                        )
                    }
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  <CreditCard size={18} />

                  {reservation.totalAmount.toLocaleString(
                      'ko-KR',
                  )}
                  원 결제하기
                </button>
            ) : paymentExpired ? (
                <button
                    type="button"
                    onClick={() =>
                        void handleRefreshReservation()
                    }
                    className="h-12 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white"
                >
                  예약 상태 다시 확인
                </button>
            ) : isCancelled ? (
                <button
                    type="button"
                    onClick={() =>
                        navigate('/concerts')
                    }
                    className="h-12 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white"
                >
                  다른 공연 찾아보기
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/reservations',
                        )
                    }
                    className="h-12 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white"
                >
                  예매 목록으로
                </button>
            )}
          </div>
        </div>

        <PaymentCancelDialog
            open={cancelDialogOpen}
            submitting={cancelling}
            onClose={() => {
              if (!cancelling) {
                setCancelDialogOpen(false);
              }
            }}
            onConfirm={handleCancelPayment}
        />
      </>
  );
}

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: string;
  last?: boolean;
}

function InfoRow({
                   icon,
                   label,
                   value,
                   last = false,
                 }: InfoRowProps) {
  return (
      <div
          className={[
            'flex gap-3 py-3',
            last
                ? ''
                : 'border-b border-slate-100',
          ].join(' ')}
      >
        <div className="mt-0.5 text-slate-400">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-sm font-medium text-slate-700">
            {value}
          </p>
        </div>
      </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  last?: boolean;
}

function DetailRow({
                     label,
                     value,
                     last = false,
                   }: DetailRowProps) {
  return (
      <div
          className={[
            'flex items-center justify-between gap-5 px-5 py-4',
            last
                ? ''
                : 'border-b border-slate-100',
          ].join(' ')}
      >
      <span className="shrink-0 text-sm text-slate-500">
        {label}
      </span>

        <span className="min-w-0 text-right text-sm font-medium text-slate-800">
        {value}
      </span>
      </div>
  );
}

interface ReservationStatusBadgeProps {
  status: string;
}

function ReservationStatusBadge({
                                  status,
                                }: ReservationStatusBadgeProps) {
  const label =
      status === 'PENDING_PAYMENT'
          ? '결제 대기'
          : status === 'COMPLETED'
              ? '예매 완료'
              : status === 'CANCELLED'
                  ? '취소'
                  : status;

  const className =
      status === 'PENDING_PAYMENT'
          ? 'bg-amber-50 text-amber-600'
          : status === 'COMPLETED'
              ? 'bg-emerald-50 text-emerald-600'
              : status === 'CANCELLED'
                  ? 'bg-red-50 text-red-500'
                  : 'bg-slate-100 text-slate-500';

  return (
      <span
          className={[
            'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold',
            className,
          ].join(' ')}
      >
      {label}
    </span>
  );
}
