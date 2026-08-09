import {
  AlertTriangle,
  Armchair,
  ArrowLeft,
  CreditCard,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { useAuthStore } from '@/features/auth/store/authStore';
import {
  createReservation,
  getReservationContext,
} from '@/features/reservation/api/reservationApi';
import type {
  ReservationContext,
} from '@/features/reservation/types/reservation';
import { getApiErrorMessage } from '@/lib/api/getApiErrorMessage';

import {
  getPerformance,
  getPerformanceSeats,
} from '../api/performanceApi';
import type {
  Performance,
  PerformanceSeat,
} from '../types/performance';

export default function SeatSelectionPage() {
  const navigate = useNavigate();

  const { performanceId } = useParams();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const numericPerformanceId =
      Number(performanceId);

  const accessToken =
      useAuthStore(
          (state) =>
              state.accessToken,
      );

  const [
    performance,
    setPerformance,
  ] =
      useState<Performance | null>(
          null,
      );

  const [
    reservationContext,
    setReservationContext,
  ] =
      useState<ReservationContext | null>(
          null,
      );

  const [
    seats,
    setSeats,
  ] =
      useState<PerformanceSeat[]>(
          [],
      );

  const [
    selectedSeatIds,
    setSelectedSeatIds,
  ] =
      useState<number[]>(
          [],
      );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    infoMessage,
    setInfoMessage,
  ] = useState('');

  /*
   * 결제 대기 모달을 닫아도
   * 좌석 선택 잠금 상태는 유지한다.
   */
  const [
    pendingModalDismissed,
    setPendingModalDismissed,
  ] = useState(false);

  /*
   * -------------------------------------------------------
   * 회원별 예매 컨텍스트 갱신
   * -------------------------------------------------------
   */
  const refreshReservationContext =
      useCallback(
          async () => {
            if (
                !accessToken ||
                !Number.isInteger(
                    numericPerformanceId,
                ) ||
                numericPerformanceId <= 0
            ) {
              setReservationContext(
                  null,
              );

              return null;
            }

            const response =
                await getReservationContext(
                    numericPerformanceId,
                );

            setReservationContext(
                response,
            );

            return response;
          },
          [
            accessToken,
            numericPerformanceId,
          ],
      );

  /*
   * -------------------------------------------------------
   * 좌석 + 회원 예매 상태 새로고침
   * -------------------------------------------------------
   */
  const refreshSeats =
      useCallback(
          async (
              showLoading = false,
          ) => {
            if (
                !Number.isInteger(
                    numericPerformanceId,
                ) ||
                numericPerformanceId <= 0
            ) {
              return;
            }

            if (showLoading) {
              setRefreshing(true);
            }

            try {
              const [
                seatsResponse,
                contextResponse,
              ] =
                  await Promise.all([
                    getPerformanceSeats(
                        numericPerformanceId,
                    ),

                    accessToken
                        ? getReservationContext(
                            numericPerformanceId,
                        )
                        : Promise.resolve(
                            null,
                        ),
                  ]);

              setSeats(
                  seatsResponse.seats,
              );

              setReservationContext(
                  contextResponse,
              );

              const availableIds =
                  new Set(
                      seatsResponse.seats
                      .filter(
                          (
                              seat: PerformanceSeat,
                          ) =>
                              seat.status ===
                              'AVAILABLE',
                      )
                      .map(
                          (
                              seat: PerformanceSeat,
                          ) =>
                              seat.performanceSeatId,
                      ),
                  );

              /*
               * 로그인 회원이면 서버에서 계산한
               * remainingTicketCount가 최종 기준.
               */
              const selectableCount =
                  contextResponse
                      ? Math.max(
                          contextResponse
                              .remainingTicketCount,
                          0,
                      )
                      : Number.MAX_SAFE_INTEGER;

              const hasPending =
                  Boolean(
                      contextResponse
                          ?.pendingReservation,
                  );

              setSelectedSeatIds(
                  (current) => {
                    let next =
                        current.filter(
                            (seatId) =>
                                availableIds.has(
                                    seatId,
                                ),
                        );

                    if (hasPending) {
                      next = [];
                    } else {
                      next =
                          next.slice(
                              0,
                              selectableCount,
                          );
                    }

                    if (
                        next.length !==
                        current.length
                    ) {
                      if (hasPending) {
                        setInfoMessage(
                            '결제 대기 중인 기존 예매가 있어 선택한 좌석을 해제했습니다.',
                        );
                      } else if (
                          contextResponse &&
                          contextResponse
                              .remainingTicketCount <= 0
                      ) {
                        setInfoMessage(
                            '이미 최대 예매 가능 매수까지 예매하여 선택한 좌석을 해제했습니다.',
                        );
                      } else {
                        setInfoMessage(
                            '좌석 상태 또는 예매 가능 매수가 변경되어 일부 선택을 해제했습니다.',
                        );
                      }
                    }

                    return next;
                  },
              );
            } catch (error) {
              if (showLoading) {
                setErrorMessage(
                    getApiErrorMessage(
                        error,
                        '좌석 정보를 새로고침하지 못했습니다.',
                    ),
                );
              }
            } finally {
              if (showLoading) {
                setRefreshing(false);
              }
            }
          },
          [
            accessToken,
            numericPerformanceId,
          ],
      );

  /*
   * -------------------------------------------------------
   * 최초 페이지 로딩
   * -------------------------------------------------------
   */
  useEffect(() => {
    let active = true;

    async function loadPage() {
      if (
          !Number.isInteger(
              numericPerformanceId,
          ) ||
          numericPerformanceId <= 0
      ) {
        setErrorMessage(
            '잘못된 공연 회차입니다.',
        );

        setLoading(false);

        return;
      }

      try {
        const [
          performanceResponse,
          seatsResponse,
          contextResponse,
        ] =
            await Promise.all([
              getPerformance(
                  numericPerformanceId,
              ),

              getPerformanceSeats(
                  numericPerformanceId,
              ),

              accessToken
                  ? getReservationContext(
                      numericPerformanceId,
                  )
                  : Promise.resolve(
                      null,
                  ),
            ]);

        if (!active) {
          return;
        }

        setPerformance(
            performanceResponse,
        );

        setSeats(
            seatsResponse.seats,
        );

        setReservationContext(
            contextResponse,
        );

        /*
         * 결제 대기 예약이 있다면
         * URL의 seatIds도 복원하지 않는다.
         */
        if (
            contextResponse
                ?.pendingReservation
        ) {
          setSelectedSeatIds(
              [],
          );

          return;
        }

        const seatIdsFromQuery =
            searchParams
            .get('seatIds')
            ?.split(',')
            .map(
                (value) =>
                    Number(value),
            )
            .filter(
                (value) =>
                    Number.isInteger(
                        value,
                    ) &&
                    value > 0,
            ) ?? [];

        const availableIds =
            new Set(
                seatsResponse.seats
                .filter(
                    (
                        seat: PerformanceSeat,
                    ) =>
                        seat.status ===
                        'AVAILABLE',
                )
                .map(
                    (
                        seat: PerformanceSeat,
                    ) =>
                        seat.performanceSeatId,
                ),
            );

        const selectableCount =
            contextResponse
                ? Math.max(
                    contextResponse
                        .remainingTicketCount,
                    0,
                )
                : performanceResponse
                    .maxTicketsPerMember;

        const restoredSeatIds =
            seatIdsFromQuery
            .filter(
                (seatId) =>
                    availableIds.has(
                        seatId,
                    ),
            )
            .slice(
                0,
                selectableCount,
            );

        setSelectedSeatIds(
            restoredSeatIds,
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(
            getApiErrorMessage(
                error,
                '좌석 정보를 불러오지 못했습니다.',
            ),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPage();

    return () => {
      active = false;
    };
  }, [
    accessToken,
    numericPerformanceId,
  ]);

  /*
   * -------------------------------------------------------
   * 선택 좌석을 URL에 유지
   * -------------------------------------------------------
   */
  useEffect(() => {
    if (loading) {
      return;
    }

    if (
        selectedSeatIds.length === 0
    ) {
      setSearchParams(
          {},
          {
            replace: true,
          },
      );

      return;
    }

    setSearchParams(
        {
          seatIds:
              selectedSeatIds.join(
                  ',',
              ),
        },
        {
          replace: true,
        },
    );
  }, [
    loading,
    selectedSeatIds,
    setSearchParams,
  ]);

  /*
   * -------------------------------------------------------
   * 10초마다 좌석/예약 상태 갱신
   * -------------------------------------------------------
   */
  useEffect(() => {
    if (
        loading ||
        !performance
    ) {
      return;
    }

    const intervalId =
        window.setInterval(
            () => {
              void refreshSeats();
            },
            10_000,
        );

    return () => {
      window.clearInterval(
          intervalId,
      );
    };
  }, [
    loading,
    performance,
    refreshSeats,
  ]);

  /*
   * -------------------------------------------------------
   * 선택 좌석
   * -------------------------------------------------------
   */
  const selectedSeats =
      useMemo(
          () =>
              seats.filter(
                  (
                      seat: PerformanceSeat,
                  ) =>
                      selectedSeatIds.includes(
                          seat.performanceSeatId,
                      ),
              ),
          [
            seats,
            selectedSeatIds,
          ],
      );

  /*
   * -------------------------------------------------------
   * 총 금액
   * -------------------------------------------------------
   */
  const totalAmount =
      useMemo(
          () =>
              selectedSeats.reduce(
                  (
                      total,
                      seat,
                  ) =>
                      total +
                      seat.price,
                  0,
              ),
          [
            selectedSeats,
          ],
      );

  /*
   * -------------------------------------------------------
   * 예약 가능한 실제 좌석 수
   * -------------------------------------------------------
   */
  const availableSeatCount =
      useMemo(
          () =>
              seats.filter(
                  (
                      seat: PerformanceSeat,
                  ) =>
                      seat.status ===
                      'AVAILABLE',
              ).length,
          [
            seats,
          ],
      );

  /*
   * 로그인 회원이면 ReservationContext의
   * remainingTicketCount가 최종 기준.
   */
  const selectableTicketCount =
      accessToken &&
      reservationContext
          ? Math.max(
              reservationContext
                  .remainingTicketCount,
              0,
          )
          : performance
              ?.maxTicketsPerMember ??
          0;

  const pendingReservation =
      reservationContext
          ?.pendingReservation ??
      null;

  const hasPendingReservation =
      Boolean(
          accessToken &&
          pendingReservation,
      );

  /*
   * PENDING_PAYMENT가 있으면
   * 최대 예매 수 도달보다 우선 처리한다.
   */
  const reservationLimitReached =
      Boolean(
          accessToken &&
          reservationContext &&
          !pendingReservation &&
          reservationContext
              .remainingTicketCount <= 0,
      );

  const showPendingReservationModal =
      hasPendingReservation &&
      !pendingModalDismissed;

  /*
   * -------------------------------------------------------
   * 좌석 선택
   * -------------------------------------------------------
   */
  function handleSeatClick(
      seat: PerformanceSeat,
  ) {
    if (
        seat.status !==
        'AVAILABLE' ||
        !performance
    ) {
      return;
    }

    setErrorMessage('');
    setInfoMessage('');

    const selected =
        selectedSeatIds.includes(
            seat.performanceSeatId,
        );

    /*
     * 이미 선택한 좌석은 항상 해제 가능.
     */
    if (selected) {
      setSelectedSeatIds(
          (current) =>
              current.filter(
                  (seatId) =>
                      seatId !==
                      seat.performanceSeatId,
              ),
      );

      return;
    }

    if (
        hasPendingReservation
    ) {
      setErrorMessage(
          '결제 대기 중인 기존 예매를 먼저 처리해주세요. 기존 예매를 결제하거나 취소해야 새로운 좌석을 선택할 수 있습니다.',
      );

      setPendingModalDismissed(
          false,
      );

      return;
    }

    if (
        reservationLimitReached
    ) {
      setErrorMessage(
          '이미 이 공연의 최대 예매 가능 매수까지 예매했습니다. 추가 좌석은 예매할 수 없습니다.',
      );

      return;
    }

    if (
        selectedSeatIds.length >=
        selectableTicketCount
    ) {
      setErrorMessage(
          accessToken
              ? `현재 추가로 최대 ${selectableTicketCount}매까지 예매할 수 있습니다.`
              : `한 번에 최대 ${selectableTicketCount}매까지 예매할 수 있습니다.`,
      );

      return;
    }

    setSelectedSeatIds(
        (current) => [
          ...current,
          seat.performanceSeatId,
        ],
    );
  }

  /*
   * -------------------------------------------------------
   * 예약 생성
   * -------------------------------------------------------
   */
  async function handleReservation() {
    if (
        !performance ||
        selectedSeatIds.length === 0
    ) {
      return;
    }

    const returnPath =
        `/performances/${performance.performanceId}/seats` +
        `?seatIds=${selectedSeatIds.join(',')}`;

    if (!accessToken) {
      navigate(
          '/login',
          {
            state: {
              from:
              returnPath,
            },
          },
      );

      return;
    }

    if (
        hasPendingReservation
    ) {
      setErrorMessage(
          '결제 대기 중인 기존 예매를 먼저 처리해주세요.',
      );

      setPendingModalDismissed(
          false,
      );

      return;
    }

    if (
        reservationLimitReached
    ) {
      setErrorMessage(
          '이미 이 공연의 최대 예매 가능 매수까지 예매했습니다. 추가 예매가 불가능합니다.',
      );

      return;
    }

    if (
        selectedSeatIds.length >
        selectableTicketCount
    ) {
      setErrorMessage(
          `현재 추가로 최대 ${selectableTicketCount}매까지 예매할 수 있습니다.`,
      );

      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      /*
       * 예약 생성 직전에 좌석 상태와
       * 회원별 예매 상태를 다시 검증한다.
       */
      const [
        latestSeatsResponse,
        latestContext,
      ] =
          await Promise.all([
            getPerformanceSeats(
                performance.performanceId,
            ),

            getReservationContext(
                performance.performanceId,
            ),
          ]);

      setSeats(
          latestSeatsResponse.seats,
      );

      setReservationContext(
          latestContext,
      );

      /*
       * 다른 탭 등에서 PENDING_PAYMENT가
       * 새로 생성되었을 수 있다.
       */
      if (
          latestContext
              .pendingReservation
      ) {
        setSelectedSeatIds(
            [],
        );

        setPendingModalDismissed(
            false,
        );

        setErrorMessage(
            '이미 결제 대기 중인 예매가 존재합니다. 기존 예매를 먼저 처리해주세요.',
        );

        return;
      }

      /*
       * 다른 탭에서 예매 한도를
       * 모두 사용했을 수 있다.
       */
      if (
          latestContext
              .remainingTicketCount <= 0
      ) {
        setSelectedSeatIds(
            [],
        );

        setErrorMessage(
            '이미 이 공연의 최대 예매 가능 매수까지 예매했습니다. 더 이상 추가 예매할 수 없습니다.',
        );

        return;
      }

      if (
          selectedSeatIds.length >
          latestContext
              .remainingTicketCount
      ) {
        setSelectedSeatIds(
            (current) =>
                current.slice(
                    0,
                    latestContext
                        .remainingTicketCount,
                ),
        );

        setErrorMessage(
            `예매 가능 매수가 변경되었습니다. 현재 추가로 ${latestContext.remainingTicketCount}매까지 예매할 수 있습니다.`,
        );

        return;
      }

      const availableIds =
          new Set(
              latestSeatsResponse
              .seats
              .filter(
                  (
                      seat: PerformanceSeat,
                  ) =>
                      seat.status ===
                      'AVAILABLE',
              )
              .map(
                  (
                      seat: PerformanceSeat,
                  ) =>
                      seat.performanceSeatId,
              ),
          );

      const stillAvailable =
          selectedSeatIds.every(
              (seatId) =>
                  availableIds.has(
                      seatId,
                  ),
          );

      if (!stillAvailable) {
        setSelectedSeatIds(
            (current) =>
                current.filter(
                    (seatId) =>
                        availableIds.has(
                            seatId,
                        ),
                ),
        );

        setErrorMessage(
            '선택한 좌석 중 이미 예약된 좌석이 있습니다. 좌석을 다시 선택해주세요.',
        );

        return;
      }

      const reservation =
          await createReservation(
              performance.performanceId,
              {
                performanceSeatIds:
                selectedSeatIds,
              },
          );

      navigate(
          `/reservations/${reservation.reservationId}`,
          {
            replace: true,
          },
      );
    } catch (error) {
      const message =
          getApiErrorMessage(
              error,
              '예약 생성에 실패했습니다. 좌석 상태를 다시 확인해주세요.',
          );

      if (
          message.includes(
              '회원별 최대 예매 가능 매수를 초과했습니다',
          )
      ) {
        setSelectedSeatIds(
            [],
        );

        setErrorMessage(
            '이미 최대 예매 가능 매수에 도달했습니다. 이 공연은 더 이상 추가 예매할 수 없습니다.',
        );

        try {
          await Promise.all([
            refreshSeats(true),
            refreshReservationContext(),
          ]);
        } catch {
          // 기존 오류 메시지 유지
        }

        return;
      }

      if (
          message.includes(
              '결제 대기',
          ) ||
          message.includes(
              'PENDING',
          )
      ) {
        setSelectedSeatIds(
            [],
        );

        setPendingModalDismissed(
            false,
        );

        setErrorMessage(
            '결제 대기 중인 기존 예매가 있습니다. 기존 예매를 결제하거나 취소한 뒤 다시 시도해주세요.',
        );

        try {
          await Promise.all([
            refreshSeats(true),
            refreshReservationContext(),
          ]);
        } catch {
          // 기존 오류 메시지 유지
        }

        return;
      }

      setErrorMessage(
          message,
      );

      await refreshSeats();
    } finally {
      setSubmitting(false);
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
              좌석 정보를 불러오고 있습니다.
            </p>
          </div>
        </div>
    );
  }

  /*
   * -------------------------------------------------------
   * Initial Error
   * -------------------------------------------------------
   */
  if (
      errorMessage &&
      !performance
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
              좌석 선택
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

  if (!performance) {
    return null;
  }

  return (
      <div className="min-h-dvh pb-40">
        {/* 결제 대기 예약 모달 */}
        {showPendingReservationModal &&
            pendingReservation && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 sm:items-center sm:p-5">
                  <div className="w-full max-w-[600px] rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <CreditCard
                            size={22}
                        />
                      </div>

                      <button
                          type="button"
                          onClick={() =>
                              setPendingModalDismissed(
                                  true,
                              )
                          }
                          className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                          aria-label="안내 닫기"
                      >
                        <X
                            size={19}
                        />
                      </button>
                    </div>

                    <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
                      완료되지 않은 예매가 있습니다.
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      이 공연에 결제 대기 중인 예매가 있습니다.
                      기존 예매가 좌석을 확보하고 있어 새로운
                      좌석을 선택할 수 없습니다.
                    </p>

                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    예약번호
                  </span>

                        <span className="truncate text-sm font-semibold text-slate-900">
                    {
                      pendingReservation
                          .reservationNumber
                    }
                  </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    예약 좌석
                  </span>

                        <span className="text-sm font-semibold text-slate-900">
                    {
                      pendingReservation
                          .ticketCount
                    }
                          매
                  </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    결제 예정 금액
                  </span>

                        <span className="text-sm font-bold text-slate-950">
                    {pendingReservation
                    .totalAmount
                    .toLocaleString(
                        'ko-KR',
                    )}
                          원
                  </span>
                      </div>

                      {pendingReservation
                          .expiresAt && (
                          <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      결제 만료
                    </span>

                            <span className="text-xs font-medium text-amber-700">
                      {formatDateTime(
                          pendingReservation
                              .expiresAt,
                      )}
                    </span>
                          </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <AlertTriangle
                          size={19}
                          className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          다른 좌석을 선택하고 싶나요?
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700">
                          기존 예매를 먼저 취소해야 합니다.
                          예매를 취소하면 현재 확보된 좌석이
                          해제되고 다시 좌석을 선택할 수 있습니다.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                          type="button"
                          onClick={() =>
                              navigate(
                                  `/reservations/${pendingReservation.reservationId}`,
                              )
                          }
                          className="h-12 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        예매 확인·취소
                      </button>

                      <button
                          type="button"
                          onClick={() =>
                              navigate(
                                  `/reservations/${pendingReservation.reservationId}/payment`,
                              )
                          }
                          className="h-12 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                      >
                        결제 계속하기
                      </button>
                    </div>
                  </div>
                </div>
            )}

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
            좌석 선택
          </h1>

          <div className="ml-auto flex items-center gap-3">
            <p className="text-xs font-medium text-slate-500">
              {selectedSeatIds.length}/
              {selectableTicketCount}
            </p>

            <button
                type="button"
                disabled={refreshing}
                onClick={() => {
                  setErrorMessage('');
                  setInfoMessage('');

                  void refreshSeats(
                      true,
                  );
                }}
                className="flex size-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50"
                aria-label="좌석 새로고침"
            >
              <RefreshCw
                  size={18}
                  className={
                    refreshing
                        ? 'animate-spin'
                        : ''
                  }
              />
            </button>
          </div>
        </header>

        {/* Stage */}
        <section className="px-5 pt-7">
          <div className="rounded-t-[50%] bg-slate-900 py-3 text-center text-xs font-semibold tracking-[0.3em] text-white">
            STAGE
          </div>

          <p className="mt-3 text-center text-xs text-slate-400">
            무대
          </p>
        </section>

        {/* 좌석 / 예매 가능 정보 */}
        <section className="mt-6 px-5">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              예약 가능 좌석
            </span>

              <strong className="text-sm text-slate-900">
                {availableSeatCount}석
              </strong>
            </div>

            <div className="mt-3 border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                1인 최대 예매
              </span>

                <strong className="text-sm text-slate-900">
                  {
                    performance
                        .maxTicketsPerMember
                  }
                  매
                </strong>
              </div>

              {accessToken &&
                  reservationContext && (
                      <>
                        <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      이미 예매한 좌석
                    </span>

                          <strong className="text-sm text-slate-900">
                            {
                              reservationContext
                                  .reservedTicketCount
                            }
                            매
                          </strong>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      추가 예매 가능
                    </span>

                          <strong
                              className={[
                                'text-sm',
                                reservationContext
                                    .remainingTicketCount > 0
                                    ? 'text-indigo-600'
                                    : 'text-red-600',
                              ].join(' ')}
                          >
                            {
                              reservationContext
                                  .remainingTicketCount
                            }
                            매
                          </strong>
                        </div>
                      </>
                  )}
            </div>
          </div>
        </section>

        {/* 결제 대기 예약 안내 */}
        {hasPendingReservation &&
            pendingReservation && (
                <section className="mt-5 px-5">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex gap-3">
                      <CreditCard
                          size={20}
                          className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-amber-900">
                          결제 대기 중인 예매가 있습니다.
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700">
                          기존 예매를 결제하거나 취소하기 전에는
                          새로운 좌석을 선택할 수 없습니다.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                              type="button"
                              onClick={() =>
                                  navigate(
                                      `/reservations/${pendingReservation.reservationId}`,
                                  )
                              }
                              className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-800"
                          >
                            예매 확인·취소
                          </button>

                          <button
                              type="button"
                              onClick={() =>
                                  navigate(
                                      `/reservations/${pendingReservation.reservationId}/payment`,
                                  )
                              }
                              className="rounded-lg bg-amber-700 px-3 py-2 text-xs font-semibold text-white"
                          >
                            결제 계속하기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
            )}

        {/* 최대 예매 수 도달 */}
        {reservationLimitReached && (
            <section className="mt-5 px-5">
              <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle
                    size={20}
                    className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    추가 예매가 불가능합니다.
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    이미 이 공연의 최대 예매 가능 매수인{' '}
                    {
                      performance
                          .maxTicketsPerMember
                    }
                    매까지 예매했습니다.
                  </p>

                  <button
                      type="button"
                      onClick={() =>
                          navigate(
                              '/reservations',
                          )
                      }
                      className="mt-3 text-xs font-semibold text-amber-800 underline underline-offset-4"
                  >
                    내 예매 내역 확인하기
                  </button>
                </div>
              </div>
            </section>
        )}

        {/* 범례 */}
        <section className="mt-6 px-5">
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <Legend
                label="선택 가능"
                className="border-slate-300 bg-white"
            />

            <Legend
                label="선택"
                className="border-indigo-600 bg-indigo-600"
            />

            <Legend
                label="선택 불가"
                className="border-slate-200 bg-slate-200"
            />
          </div>
        </section>

        {infoMessage && (
            <section className="mt-5 px-5">
              <p
                  role="status"
                  className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700"
              >
                {infoMessage}
              </p>
            </section>
        )}

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

        {/* 좌석 */}
        <section className="mt-7 px-5">
          {seats.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center">
                <Armchair
                    size={28}
                    className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm text-slate-500">
                  등록된 좌석이 없습니다.
                </p>
              </div>
          ) : (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                {seats.map(
                    (
                        seat: PerformanceSeat,
                    ) => {
                      const selected =
                          selectedSeatIds.includes(
                              seat.performanceSeatId,
                          );

                      const seatAvailable =
                          seat.status ===
                          'AVAILABLE';

                      const selectable =
                          seatAvailable &&
                          !hasPendingReservation &&
                          (
                              selected ||
                              !reservationLimitReached
                          );

                      return (
                          <button
                              key={
                                seat.performanceSeatId
                              }
                              type="button"
                              disabled={
                                !selectable
                              }
                              onClick={() =>
                                  handleSeatClick(
                                      seat,
                                  )
                              }
                              className={[
                                'flex min-h-24 flex-col items-center justify-center rounded-xl border px-2 py-3 transition',
                                selected
                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                    : selectable
                                        ? 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30'
                                        : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300',
                              ].join(' ')}
                          >
                    <span className="text-[10px] font-medium">
                      {
                        seat.sectionName
                      }
                    </span>

                            <span className="mt-1 text-sm font-bold">
                      {
                        seat.rowName
                      }
                              -
                              {
                                seat.seatNumber
                              }
                    </span>

                            <span className="mt-1 text-[10px]">
                      {
                        seat.grade
                      }
                    </span>

                            <span className="mt-1 text-[10px]">
                      {seat.price
                      .toLocaleString(
                          'ko-KR',
                      )}
                              원
                    </span>
                          </button>
                      );
                    },
                )}
              </div>
          )}
        </section>

        {/* 선택 좌석 */}
        <section className="mt-8 px-5">
          <h2 className="text-sm font-semibold text-slate-900">
            선택 좌석
          </h2>

          {selectedSeats.length === 0 ? (
              <div className="mt-3">
                {hasPendingReservation ? (
                    <p className="text-sm text-amber-600">
                      결제 대기 중인 기존 예매를 먼저
                      처리해주세요.
                    </p>
                ) : reservationLimitReached ? (
                    <p className="text-sm text-slate-400">
                      추가로 선택할 수 있는 좌석이 없습니다.
                    </p>
                ) : (
                    <p className="text-sm text-slate-400">
                      좌석을 선택해주세요.
                    </p>
                )}
              </div>
          ) : (
              <div className="mt-3 space-y-2">
                {selectedSeats.map(
                    (
                        seat: PerformanceSeat,
                    ) => (
                        <div
                            key={
                              seat.performanceSeatId
                            }
                            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {
                                seat.sectionName
                              }{' '}
                              {
                                seat.rowName
                              }
                              열{' '}
                              {
                                seat.seatNumber
                              }
                              번
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                seat.grade
                              }
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-slate-900">
                            {seat.price
                            .toLocaleString(
                                'ko-KR',
                            )}
                            원
                          </p>
                        </div>
                    ),
                )}
              </div>
          )}
        </section>

        {/* 하단 예약 영역 */}
        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[640px] -translate-x-1/2 border-t border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
            <span className="text-sm text-slate-500">
              총 결제 예정 금액
            </span>

              {selectedSeatIds.length >
                  0 && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {
                          selectedSeatIds.length
                        }
                        매 선택
                      </p>
                  )}
            </div>

            <strong className="text-lg text-slate-950">
              {totalAmount
              .toLocaleString(
                  'ko-KR',
              )}
              원
            </strong>
          </div>

          <button
              type="button"
              disabled={
                  selectedSeatIds.length ===
                  0 ||
                  submitting ||
                  reservationLimitReached ||
                  hasPendingReservation
              }
              onClick={() =>
                  void handleReservation()
              }
              className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting
                ? '예약 처리 중...'
                : hasPendingReservation
                    ? '기존 예매 처리 필요'
                    : reservationLimitReached
                        ? '추가 예매 불가'
                        : selectedSeatIds.length > 0
                            ? `${selectedSeatIds.length}매 예매하기`
                            : '좌석을 선택해주세요'}
          </button>
        </div>
      </div>
  );
}

interface LegendProps {
  label: string;
  className: string;
}

function Legend({
                  label,
                  className,
                }: LegendProps) {
  return (
      <div className="flex items-center gap-2">
      <span
          className={[
            'size-4 rounded border',
            className,
          ].join(' ')}
      />

        <span>
        {label}
      </span>
      </div>
  );
}

function formatDateTime(
    value: string,
): string {
  const date =
      new Date(value);

  if (
      Number.isNaN(
          date.getTime(),
      )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
      'ko-KR',
      {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      },
  ).format(date);
}
