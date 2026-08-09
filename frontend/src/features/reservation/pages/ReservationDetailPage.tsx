import type {
  ReactNode,
} from 'react';
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

import ConcertPoster from '@/features/concert/components/ConcertPoster';
import {
  cancelPayment,
} from '@/features/payment/api/paymentApi';
import PaymentCancelDialog from '@/features/payment/components/PaymentCancelDialog';
import {
  useReservationCountdown,
} from '@/features/reservation/hooks/useReservationCountdown';
import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';
import {
  formatDate,
  formatDateTime,
  formatTime,
} from '@/lib/date/formatDateTime';

import {
  cancelPendingReservation,
  getMyBookingReservation,
} from '../api/reservationApi';
import type {
  MyReservationDetail,
} from '../types/reservation';

export default function ReservationDetailPage() {
  const navigate =
      useNavigate();

  const { reservationId } =
      useParams();

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
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    actionErrorMessage,
    setActionErrorMessage,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  /*
   * 결제 완료 예약의 Toss 결제 취소 Dialog.
   */
  const [
    paymentCancelDialogOpen,
    setPaymentCancelDialogOpen,
  ] = useState(false);

  /*
   * 결제 전 PENDING_PAYMENT 예약 취소 Dialog.
   */
  const [
    pendingCancelDialogOpen,
    setPendingCancelDialogOpen,
  ] = useState(false);

  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  const countdown =
      useReservationCountdown(
          reservation?.expiresAt,
      );

  const reloadReservation =
      useCallback(
          async () => {
            const response =
                await getMyBookingReservation(
                    numericReservationId,
                );

            setReservation(
                response,
            );

            return response;
          },
          [
            numericReservationId,
          ],
      );

  /*
   * -------------------------------------------------------
   * 최초 조회
   * -------------------------------------------------------
   */
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

        setReservation(
            response,
        );
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
  }, [
    numericReservationId,
  ]);

  /*
   * 결제 시간이 화면에서 만료되면
   * 서버의 최신 예약 상태를 다시 조회한다.
   */
  useEffect(() => {
    if (
        !countdown.expired ||
        reservation?.reservationStatus !==
        'PENDING_PAYMENT'
    ) {
      return;
    }

    void reloadReservation()
    .catch(() => {
      /*
       * 자동 갱신 실패 시
       * 현재 화면 상태 유지.
       */
    });
  }, [
    countdown.expired,
    reservation?.reservationStatus,
    reloadReservation,
  ]);

  /*
   * -------------------------------------------------------
   * 수동 상태 갱신
   * -------------------------------------------------------
   */
  async function handleRefreshReservation() {
    setActionErrorMessage('');
    setSuccessMessage('');

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

  /*
   * -------------------------------------------------------
   * 결제 전 예약 취소
   *
   * PENDING_PAYMENT
   * HELD -> AVAILABLE
   * Reservation -> CANCELLED
   * -------------------------------------------------------
   */
  async function handleCancelPendingReservation() {
    if (!reservation) {
      return;
    }

    setCancelling(true);
    setActionErrorMessage('');
    setSuccessMessage('');

    try {
      await cancelPendingReservation(
          reservation.reservationId,
      );

      await reloadReservation();

      setPendingCancelDialogOpen(
          false,
      );

      setSuccessMessage(
          '예약이 취소되었습니다. 확보되어 있던 좌석을 다시 선택할 수 있습니다.',
      );
    } catch (error) {
      setActionErrorMessage(
          getApiErrorMessage(
              error,
              '예약 취소에 실패했습니다.',
          ),
      );
    } finally {
      setCancelling(false);
    }
  }

  /*
   * -------------------------------------------------------
   * 결제 완료 예약 취소
   *
   * Toss 결제 취소
   * RESERVED -> AVAILABLE
   * Reservation -> CANCELLED
   * -------------------------------------------------------
   */
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
    setSuccessMessage('');

    try {
      await cancelPayment(
          reservation.payment.paymentId,
          {
            reason,
            providerData: {},
          },
      );

      await reloadReservation();

      setPaymentCancelDialogOpen(
          false,
      );

      setSuccessMessage(
          '예매 및 결제가 취소되었습니다.',
      );
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

  /*
   * -------------------------------------------------------
   * Loading
   * -------------------------------------------------------
   */
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

  /*
   * -------------------------------------------------------
   * Error
   * -------------------------------------------------------
   */
  if (
      errorMessage ||
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
              <ArrowLeft
                  size={22}
              />
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

  const isCompleted =
      reservation.reservationStatus ===
      'COMPLETED';

  const isCancelled =
      reservation.reservationStatus ===
      'CANCELLED';

  const isExpired =
      reservation.reservationStatus ===
      'EXPIRED';

  const paymentExpired =
      isPendingPayment &&
      reservation.expiresAt !== null &&
      countdown.expired;

  /*
   * 결제 전 예약 취소 가능.
   */
  const canCancelPendingReservation =
      isPendingPayment &&
      reservation.canCancel &&
      !paymentExpired;

  /*
   * 결제 완료 후 전체 결제 취소 가능.
   */
  const canCancelCompletedReservation =
      isCompleted &&
      reservation.canCancel &&
      reservation.payment !== null;

  return (
      <>
        <div className="min-h-dvh pb-36">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-14 items-center border-b border-slate-100 bg-white px-4">
            <button
                type="button"
                onClick={() =>
                    navigate(-1)
                }
                className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100"
                aria-label="뒤로가기"
            >
              <ArrowLeft
                  size={22}
              />
            </button>

            <h1 className="ml-2 text-base font-semibold text-slate-900">
              예매 상세
            </h1>
          </header>

          {/* 공연 */}
          <section className="px-5 pt-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex gap-4 p-4">
                <div className="aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <ConcertPoster
                      src={
                        reservation
                            .concert
                            .posterUrl
                      }
                      alt={`${reservation.concert.title} 포스터`}
                      className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1 py-1">
                  <ReservationStatusBadge
                      status={
                        reservation
                            .reservationStatus
                      }
                  />

                  <p className="mt-3 text-xs font-semibold text-indigo-600">
                    {
                      reservation
                          .concert
                          .category
                    }
                  </p>

                  <h2 className="mt-1 line-clamp-2 text-lg font-bold leading-7 text-slate-950">
                    {
                      reservation
                          .concert
                          .title
                    }
                  </h2>

                  {reservation
                      .concert
                      .subtitle && (
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {
                          reservation
                              .concert
                              .subtitle
                        }
                      </p>
                  )}
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 px-5 py-5">
                <InfoRow
                    icon={
                      <CalendarDays
                          size={17}
                      />
                    }
                    label="공연일"
                    value={`${formatDate(
                        reservation
                            .performance
                            .startsAt,
                    )} ${formatTime(
                        reservation
                            .performance
                            .startsAt,
                    )}`}
                />

                <InfoRow
                    icon={
                      <Clock3
                          size={17}
                      />
                    }
                    label="공연시간"
                    value={`${formatTime(
                        reservation
                            .performance
                            .startsAt,
                    )} ~ ${formatTime(
                        reservation
                            .performance
                            .endsAt,
                    )}`}
                />

                <InfoRow
                    icon={
                      <MapPin
                          size={17}
                      />
                    }
                    label="공연장"
                    value={
                        `${reservation.venue.name} · ` +
                        reservation.venue
                            .venueHallName
                    }
                />

                <InfoRow
                    icon={
                      <Ticket
                          size={17}
                      />
                    }
                    label="예약번호"
                    value={
                      reservation
                          .reservationNumber
                    }
                    last
                />
              </div>
            </div>
          </section>

          {/* 결제 대기 */}
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
                              서버의 최신 예약 상태를 확인해주세요.
                            </p>
                          </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                          <div className="flex items-center justify-between">
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
                                countdown
                                    .remainingText
                              }
                            </strong>
                          </div>

                          <p className="mt-3 border-t border-amber-100 pt-3 text-xs leading-5 text-amber-700">
                            결제를 완료하면 예매가 확정됩니다.
                            다른 좌석을 선택하려면 현재 예약을 먼저
                            취소해주세요.
                          </p>
                        </div>
                    )}
                  </section>
              )}

          {/* 성공 */}
          {successMessage && (
              <section className="mt-5 px-5">
                <p
                    role="status"
                    className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                  {successMessage}
                </p>
              </section>
          )}

          {/* Action error */}
          {actionErrorMessage && (
              <section className="mt-5 px-5">
                <p
                    role="alert"
                    className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {
                    actionErrorMessage
                  }
                </p>
              </section>
          )}

          {/* 좌석 */}
          <section className="mt-8 px-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-950">
                좌석
              </h3>

              <span className="text-sm text-slate-500">
              {
                reservation
                    .seats
                    .length
              }
                매
            </span>
            </div>

            <div className="mt-4 space-y-3">
              {reservation.seats.map(
                  (seat) => (
                      <div
                          key={
                            seat
                                .reservationSeatId
                          }
                          className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                        {
                          seat.grade
                        }
                      </span>

                            <span className="text-sm font-semibold text-slate-900">
                        {
                          seat
                              .sectionName
                        }
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

          {/* 공연장 */}
          <section className="mt-8 px-5">
            <h3 className="text-lg font-bold text-slate-950">
              공연장
            </h3>

            <div className="mt-4 rounded-2xl border border-slate-200 p-5">
              <p className="font-semibold text-slate-900">
                {
                  reservation
                      .venue
                      .name
                }
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {
                  reservation
                      .venue
                      .venueHallName
                }

                {reservation
                    .venue
                    .venueHallFloor
                    ? ` · ${reservation.venue.venueHallFloor}`
                    : ''}
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {
                  reservation
                      .venue
                      .roadAddress
                }

                {reservation
                    .venue
                    .detailAddress
                    ? ` ${reservation.venue.detailAddress}`
                    : ''}
              </p>
            </div>
          </section>

          {/* 결제 */}
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
                  {reservation
                  .totalAmount
                  .toLocaleString(
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
                          reservation
                              .payment
                              .paymentNumber
                        }
                    />

                    <DetailRow
                        label="결제사"
                        value={
                          reservation
                              .payment
                              .provider
                        }
                    />

                    <DetailRow
                        label="결제수단"
                        value={
                            reservation
                                .payment
                                .method ||
                            '-'
                        }
                    />

                    <DetailRow
                        label="결제상태"
                        value={
                          reservation
                              .payment
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

          {/* 결제 완료 예약 취소 */}
          {canCancelCompletedReservation && (
              <section className="mt-6 px-5">
                <button
                    type="button"
                    onClick={() => {
                      setActionErrorMessage('');
                      setSuccessMessage('');

                      setPaymentCancelDialogOpen(
                          true,
                      );
                    }}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <XCircle
                      size={18}
                  />

                  예매 취소
                </button>

                <p className="mt-2 text-center text-xs text-slate-400">
                  결제 전체 취소 및 좌석 반환이 진행됩니다.
                </p>
              </section>
          )}

          {/* 예약 정보 */}
          <section className="mt-8 px-5">
            <h3 className="text-lg font-bold text-slate-950">
              예약 정보
            </h3>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <DetailRow
                  label="예약일"
                  value={
                    formatDateTime(
                        reservation
                            .reservedAt,
                    )
                  }
              />

              {reservation.expiresAt && (
                  <DetailRow
                      label="결제 만료"
                      value={
                        formatDateTime(
                            reservation
                                .expiresAt,
                        )
                      }
                  />
              )}

              {reservation.completedAt && (
                  <DetailRow
                      label="예매 완료"
                      value={
                        formatDateTime(
                            reservation
                                .completedAt,
                        )
                      }
                  />
              )}

              {reservation.cancelledAt && (
                  <DetailRow
                      label="취소일"
                      value={
                        formatDateTime(
                            reservation
                                .cancelledAt,
                        )
                      }
                  />
              )}

              {reservation.refundStatus && (
                  <DetailRow
                      label="환불 상태"
                      value={
                        reservation
                            .refundStatus
                      }
                      last
                  />
              )}
            </div>
          </section>

          {/* Footer */}
          <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[640px] -translate-x-1/2 border-t border-slate-200 bg-white p-4">
            {reservation.requiresPayment &&
            !paymentExpired ? (
                canCancelPendingReservation ? (
                    /*
                     * 결제 전에는:
                     *
                     * [예약 취소] [결제하기]
                     */
                    <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
                      <button
                          type="button"
                          disabled={
                            cancelling
                          }
                          onClick={() => {
                            setActionErrorMessage('');
                            setSuccessMessage('');

                            setPendingCancelDialogOpen(
                                true,
                            );
                          }}
                          className="h-12 rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        예약 취소
                      </button>

                      <button
                          type="button"
                          disabled={
                            cancelling
                          }
                          onClick={() =>
                              navigate(
                                  `/reservations/${reservation.reservationId}/payment`,
                              )
                          }
                          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                      >
                        <CreditCard
                            size={18}
                        />

                        결제하기
                      </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/reservations/${reservation.reservationId}/payment`,
                            )
                        }
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                    >
                      <CreditCard
                          size={18}
                      />

                      {reservation
                      .totalAmount
                      .toLocaleString(
                          'ko-KR',
                      )}
                      원 결제하기
                    </button>
                )
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
                        navigate(
                            `/performances/${reservation.performance.performanceId}/seats`,
                        )
                    }
                    className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white"
                >
                  다시 좌석 선택하기
                </button>
            ) : isExpired ? (
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/performances/${reservation.performance.performanceId}/seats`,
                        )
                    }
                    className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white"
                >
                  다시 좌석 선택하기
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

        {/* 결제 전 예약 취소 확인 */}
        <PendingReservationCancelDialog
            open={
              pendingCancelDialogOpen
            }
            submitting={
              cancelling
            }
            onClose={() => {
              if (!cancelling) {
                setPendingCancelDialogOpen(
                    false,
                );
              }
            }}
            onConfirm={() =>
                void handleCancelPendingReservation()
            }
        />

        {/* 결제 완료 후 Toss 결제 취소 */}
        <PaymentCancelDialog
            open={
              paymentCancelDialogOpen
            }
            submitting={
              cancelling
            }
            onClose={() => {
              if (!cancelling) {
                setPaymentCancelDialogOpen(
                    false,
                );
              }
            }}
            onConfirm={
              handleCancelPayment
            }
        />
      </>
  );
}

/*
 * -----------------------------------------------------------
 * PENDING_PAYMENT 예약 취소 Dialog
 * -----------------------------------------------------------
 */

interface PendingReservationCancelDialogProps {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function PendingReservationCancelDialog({
                                          open,
                                          submitting,
                                          onClose,
                                          onConfirm,
                                        }: PendingReservationCancelDialogProps) {
  if (!open) {
    return null;
  }

  return (
      <div className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/45 sm:items-center sm:p-5">
        <div className="w-full max-w-[560px] rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <XCircle
                size={23}
            />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            예약을 취소할까요?
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            아직 결제가 완료되지 않은 예약입니다.
            예약을 취소하면 현재 확보되어 있는 좌석이
            즉시 해제됩니다.
          </p>

          <div className="mt-4 flex gap-3 rounded-2xl bg-amber-50 p-4">
            <AlertTriangle
                size={19}
                className="mt-0.5 shrink-0 text-amber-600"
            />

            <p className="text-xs leading-5 text-amber-800">
              취소된 좌석은 다른 회원이 바로 예매할 수
              있습니다. 다시 예매하려면 좌석 선택부터
              진행해야 합니다.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
                type="button"
                disabled={
                  submitting
                }
                onClick={
                  onClose
                }
                className="h-12 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              계속 결제하기
            </button>

            <button
                type="button"
                disabled={
                  submitting
                }
                onClick={
                  onConfirm
                }
                className="h-12 rounded-xl bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {submitting
                  ? '취소 중...'
                  : '예약 취소하기'}
            </button>
          </div>
        </div>
      </div>
  );
}

/*
 * -----------------------------------------------------------
 * Info Row
 * -----------------------------------------------------------
 */

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

/*
 * -----------------------------------------------------------
 * Detail Row
 * -----------------------------------------------------------
 */

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

/*
 * -----------------------------------------------------------
 * Status Badge
 * -----------------------------------------------------------
 */

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
                  : status === 'EXPIRED'
                      ? '만료'
                      : status;

  const className =
      status === 'PENDING_PAYMENT'
          ? 'bg-amber-50 text-amber-600'
          : status === 'COMPLETED'
              ? 'bg-emerald-50 text-emerald-600'
              : status === 'CANCELLED'
                  ? 'bg-red-50 text-red-500'
                  : status === 'EXPIRED'
                      ? 'bg-slate-100 text-slate-500'
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
