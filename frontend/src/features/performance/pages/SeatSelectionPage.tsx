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

import {
  useAuthStore,
} from '@/features/auth/store/authStore';

import {
  createReservation,
  getReservationContext,
} from '@/features/reservation/api/reservationApi';

import type {
  ReservationContext,
} from '@/features/reservation/types/reservation';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  getPerformance,
  getPerformanceSeats,
} from '../api/performanceApi';

import type {
  Performance,
  PerformanceSeat,
} from '../types/performance';

/*
 * ============================================================
 * Seat Map View Models
 * ============================================================
 */

interface SeatRowGroup {
  rowName: string;
  seats: PerformanceSeat[];
}

interface SeatSectionGroup {
  sectionName: string;
  rows: SeatRowGroup[];
}

interface SeatGradeSummary {
  grade: string;
  minPrice: number;
  maxPrice: number;
}

/*
 * ============================================================
 * Page
 * ============================================================
 */

export default function SeatSelectionPage() {
  const navigate =
      useNavigate();

  const {
    performanceId,
  } =
      useParams();

  const [
    searchParams,
    setSearchParams,
  ] =
      useSearchParams();

  const numericPerformanceId =
      Number(
          performanceId,
      );

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
  ] =
      useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
      useState(false);

  const [
    submitting,
    setSubmitting,
  ] =
      useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
      useState('');

  const [
    infoMessage,
    setInfoMessage,
  ] =
      useState('');

  /*
   * 결제 대기 모달을 닫아도
   * 좌석 선택 잠금 상태는 유지한다.
   */
  const [
    pendingModalDismissed,
    setPendingModalDismissed,
  ] =
      useState(false);

  /*
   * ============================================================
   * 회원별 예매 컨텍스트 갱신
   * ============================================================
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
   * ============================================================
   * 좌석 + 회원 예매 상태 새로고침
   * ============================================================
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

            if (
                showLoading
            ) {
              setRefreshing(
                  true,
              );
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
                              seat:
                              PerformanceSeat,
                          ) =>
                              seat.status ===
                              'AVAILABLE',
                      )
                      .map(
                          (
                              seat:
                              PerformanceSeat,
                          ) =>
                              seat.performanceSeatId,
                      ),
                  );

              /*
               * 로그인 회원이면 서버의
               * remainingTicketCount가 최종 기준이다.
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
                            (
                                seatId,
                            ) =>
                                availableIds.has(
                                    seatId,
                                ),
                        );

                    if (
                        hasPending
                    ) {
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
                      if (
                          hasPending
                      ) {
                        setInfoMessage(
                            '결제 대기 중인 기존 예매가 있어 선택한 좌석을 해제했습니다.',
                        );
                      } else if (
                          contextResponse &&
                          contextResponse
                              .remainingTicketCount <=
                          0
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
            } catch (
                error
                ) {
              if (
                  showLoading
              ) {
                setErrorMessage(
                    getApiErrorMessage(
                        error,
                        '좌석 정보를 새로고침하지 못했습니다.',
                    ),
                );
              }
            } finally {
              if (
                  showLoading
              ) {
                setRefreshing(
                    false,
                );
              }
            }
          },
          [
            accessToken,
            numericPerformanceId,
          ],
      );

  /*
   * ============================================================
   * 최초 로딩
   * ============================================================
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

        setLoading(
            false,
        );

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

        if (
            !active
        ) {
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
         * URL seatIds도 복원하지 않는다.
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
            .get(
                'seatIds',
            )
            ?.split(
                ',',
            )
            .map(
                (
                    value,
                ) =>
                    Number(
                        value,
                    ),
            )
            .filter(
                (
                    value,
                ) =>
                    Number.isInteger(
                        value,
                    ) &&
                    value > 0,
            ) ??
            [];

        const availableIds =
            new Set(
                seatsResponse.seats
                .filter(
                    (
                        seat:
                        PerformanceSeat,
                    ) =>
                        seat.status ===
                        'AVAILABLE',
                )
                .map(
                    (
                        seat:
                        PerformanceSeat,
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
                (
                    seatId,
                ) =>
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
      } catch (
          error
          ) {
        if (
            !active
        ) {
          return;
        }

        setErrorMessage(
            getApiErrorMessage(
                error,
                '좌석 정보를 불러오지 못했습니다.',
            ),
        );
      } finally {
        if (
            active
        ) {
          setLoading(
              false,
          );
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
   * ============================================================
   * 선택 좌석을 URL에 유지
   * ============================================================
   */

  useEffect(() => {
    if (
        loading
    ) {
      return;
    }

    if (
        selectedSeatIds.length ===
        0
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
   * ============================================================
   * 10초마다 좌석 상태 갱신
   * ============================================================
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
   * ============================================================
   * Derived State
   * ============================================================
   */

  const selectedSeats =
      useMemo(
          () =>
              seats.filter(
                  (
                      seat,
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

  const availableSeatCount =
      useMemo(
          () =>
              seats.filter(
                  (
                      seat,
                  ) =>
                      seat.status ===
                      'AVAILABLE',
              ).length,
          [
            seats,
          ],
      );

  /*
   * 좌석을
   *
   * 구역
   *   └─ 열
   *       └─ 좌석번호
   *
   * 순서로 묶는다.
   */
  const seatSections =
      useMemo<
          SeatSectionGroup[]
      >(
          () => {
            const sectionMap =
                new Map<
                    string,
                    Map<
                        string,
                        PerformanceSeat[]
                    >
                >();

            for (
                const seat of seats
                ) {
              const sectionName =
                  seat.sectionName ||
                  '일반 구역';

              const rowName =
                  seat.rowName ||
                  '-';

              let rowMap =
                  sectionMap.get(
                      sectionName,
                  );

              if (
                  !rowMap
              ) {
                rowMap =
                    new Map();

                sectionMap.set(
                    sectionName,
                    rowMap,
                );
              }

              const rowSeats =
                  rowMap.get(
                      rowName,
                  ) ??
                  [];

              rowSeats.push(
                  seat,
              );

              rowMap.set(
                  rowName,
                  rowSeats,
              );
            }

            return Array.from(
                sectionMap.entries(),
            )
            .sort(
                (
                    [a],
                    [b],
                ) =>
                    a.localeCompare(
                        b,
                        'ko-KR',
                        {
                          numeric:
                              true,
                        },
                    ),
            )
            .map(
                ([
                   sectionName,
                   rowMap,
                 ]) => ({
                  sectionName,

                  rows:
                      Array.from(
                          rowMap.entries(),
                      )
                      .sort(
                          (
                              [a],
                              [b],
                          ) =>
                              a.localeCompare(
                                  b,
                                  'ko-KR',
                                  {
                                    numeric:
                                        true,
                                  },
                              ),
                      )
                      .map(
                          ([
                             rowName,
                             rowSeats,
                           ]) => ({
                            rowName,

                            seats:
                                [
                                  ...rowSeats,
                                ].sort(
                                    (
                                        a,
                                        b,
                                    ) =>
                                        Number(
                                            a.seatNumber,
                                        ) -
                                        Number(
                                            b.seatNumber,
                                        ),
                                ),
                          }),
                      ),
                }),
            );
          },
          [
            seats,
          ],
      );

  /*
   * 등급별 가격 정보.
   */
  const gradeSummaries =
      useMemo<
          SeatGradeSummary[]
      >(
          () => {
            const map =
                new Map<
                    string,
                    {
                      min:
                          number;
                      max:
                          number;
                    }
                >();

            for (
                const seat of seats
                ) {
              const current =
                  map.get(
                      seat.grade,
                  );

              if (
                  !current
              ) {
                map.set(
                    seat.grade,
                    {
                      min:
                      seat.price,
                      max:
                      seat.price,
                    },
                );

                continue;
              }

              current.min =
                  Math.min(
                      current.min,
                      seat.price,
                  );

              current.max =
                  Math.max(
                      current.max,
                      seat.price,
                  );
            }

            return Array.from(
                map.entries(),
            ).map(
                ([
                   grade,
                   price,
                 ]) => ({
                  grade,
                  minPrice:
                  price.min,
                  maxPrice:
                  price.max,
                }),
            );
          },
          [
            seats,
          ],
      );

  /*
   * 로그인 회원이면
   * ReservationContext가 최종 기준이다.
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

  const reservationLimitReached =
      Boolean(
          accessToken &&
          reservationContext &&
          !pendingReservation &&
          reservationContext
              .remainingTicketCount <=
          0,
      );

  const showPendingReservationModal =
      hasPendingReservation &&
      !pendingModalDismissed;

  const selectionCompleted =
      selectableTicketCount >
      0 &&
      selectedSeatIds.length ===
      selectableTicketCount;

  /*
   * ============================================================
   * 좌석 선택
   * ============================================================
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
    if (
        selected
    ) {
      setSelectedSeatIds(
          (
              current,
          ) =>
              current.filter(
                  (
                      seatId,
                  ) =>
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
          '결제 대기 중인 기존 예매를 먼저 처리해주세요. 기존 예매를 결제하거나 취소하면 새로운 좌석을 선택할 수 있습니다.',
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
          '이미 이 공연의 최대 예매 가능 매수까지 예매했습니다.',
      );

      return;
    }

    if (
        selectedSeatIds.length >=
        selectableTicketCount
    ) {
      setInfoMessage(
          `최대 ${selectableTicketCount}매까지 선택할 수 있습니다. 다른 좌석으로 변경하려면 선택한 좌석을 먼저 해제해주세요.`,
      );

      return;
    }

    setSelectedSeatIds(
        (
            current,
        ) => [
          ...current,
          seat.performanceSeatId,
        ],
    );
  }

  /*
   * ============================================================
   * 예약 생성
   * ============================================================
   */

  async function handleReservation() {
    if (
        !performance ||
        selectedSeatIds.length ===
        0
    ) {
      return;
    }

    const returnPath =
        `/performances/${performance.performanceId}/seats` +
        `?seatIds=${selectedSeatIds.join(',')}`;

    if (
        !accessToken
    ) {
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

    setSubmitting(
        true,
    );

    setErrorMessage('');
    setInfoMessage('');

    try {
      /*
       * 예약 생성 직전
       * 좌석/회원 상태 재검증.
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

      if (
          latestContext
              .remainingTicketCount <=
          0
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
            (
                current,
            ) =>
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
                      seat,
                  ) =>
                      seat.status ===
                      'AVAILABLE',
              )
              .map(
                  (
                      seat,
                  ) =>
                      seat.performanceSeatId,
              ),
          );

      const stillAvailable =
          selectedSeatIds.every(
              (
                  seatId,
              ) =>
                  availableIds.has(
                      seatId,
                  ),
          );

      if (
          !stillAvailable
      ) {
        setSelectedSeatIds(
            (
                current,
            ) =>
                current.filter(
                    (
                        seatId,
                    ) =>
                        availableIds.has(
                            seatId,
                        ),
                ),
        );

        setErrorMessage(
            '선택한 좌석 중 이미 예약된 좌석이 있습니다. 이용 가능한 좌석만 남겨두었습니다.',
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
    } catch (
        error
        ) {
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
            refreshSeats(
                true,
            ),

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
            refreshSeats(
                true,
            ),

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
      setSubmitting(
          false,
      );
    }
  }

  /*
   * ============================================================
   * Loading
   * ============================================================
   */

  if (
      loading
  ) {
    return (
        <div className="flex min-h-dvh items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"/>

            <p className="text-sm text-slate-500">
              좌석 정보를 불러오고 있습니다.
            </p>
          </div>
        </div>
    );
  }

  /*
   * ============================================================
   * Initial Error
   * ============================================================
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

  if (
      !performance
  ) {
    return null;
  }

  /*
   * ============================================================
   * Render
   * ============================================================
   */

  return (
      <div className="min-h-dvh bg-white pb-44">
        {/*
         * =====================================================
         * Pending Payment Modal
         * =====================================================
         */}
        {showPendingReservationModal &&
            pendingReservation && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 backdrop-blur-[1px] sm:items-center sm:p-5">
                  <div className="w-full max-w-[560px] rounded-t-[28px] bg-white p-5 shadow-2xl sm:rounded-[28px]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
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
                          className="flex size-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                          aria-label="안내 닫기"
                      >
                        <X
                            size={19}
                        />
                      </button>
                    </div>

                    <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
                      먼저 처리할 예매가 있어요
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      현재 이 공연에 결제 대기 중인 예매가
                      있습니다. 확보 중인 좌석을 결제하거나
                      취소한 다음 새로운 좌석을 선택할 수 있습니다.
                    </p>

                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between gap-4 px-4 py-3">
                        <span className="text-xs text-slate-500">
                          예약번호
                        </span>

                        <strong className="truncate text-sm font-semibold text-slate-900">
                          {
                            pendingReservation
                                .reservationNumber
                          }
                        </strong>
                      </div>

                      <div className="border-t border-slate-100"/>

                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-slate-500">
                          좌석
                        </span>

                        <strong className="text-sm text-slate-900">
                          {
                            pendingReservation
                                .ticketCount
                          }
                          매
                        </strong>
                      </div>

                      <div className="border-t border-slate-100"/>

                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-slate-500">
                          결제 예정
                        </span>

                        <strong className="text-sm text-slate-950">
                          {pendingReservation
                          .totalAmount
                          .toLocaleString(
                              'ko-KR',
                          )}
                          원
                        </strong>
                      </div>

                      {pendingReservation
                          .expiresAt && (
                          <>
                            <div className="border-t border-slate-100"/>

                            <div className="flex items-center justify-between px-4 py-3">
                              <span className="text-xs text-slate-500">
                                결제 만료
                              </span>

                              <strong className="text-xs font-semibold text-amber-700">
                                {formatDateTime(
                                    pendingReservation
                                        .expiresAt,
                                )}
                              </strong>
                            </div>
                          </>
                      )}
                    </div>

                    <div className="mt-4 flex gap-3 rounded-2xl bg-amber-50 p-4">
                      <AlertTriangle
                          size={19}
                          className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <p className="text-xs leading-5 text-amber-800">
                        다른 좌석을 선택하려면 현재 예매를
                        취소해주세요. 취소하면 확보 중인 좌석이
                        다시 선택 가능한 상태로 돌아갑니다.
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                          type="button"
                          onClick={() =>
                              navigate(
                                  `/reservations/${pendingReservation.reservationId}`,
                              )
                          }
                          className="h-12 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
                          className="h-12 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                      >
                        결제 계속하기
                      </button>
                    </div>
                  </div>
                </div>
            )}

        {/*
         * =====================================================
         * Header
         * =====================================================
         */}
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-slate-100 bg-white/95 px-4 backdrop-blur">
          <button
              type="button"
              onClick={() =>
                  navigate(-1)
              }
              className="flex size-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
              aria-label="뒤로가기"
          >
            <ArrowLeft
                size={22}
            />
          </button>

          <div className="ml-2 min-w-0">
            <h1 className="text-base font-semibold text-slate-900">
              좌석 선택
            </h1>

            <p className="mt-0.5 text-[10px] text-slate-400">
              원하는 좌석 번호를 눌러주세요
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div
                className={[
                  'rounded-full px-3 py-1.5 text-xs font-bold',
                  selectionCompleted
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-slate-100 text-slate-600',
                ].join(
                    ' ',
                )}
            >
              {selectedSeatIds.length}
              {' / '}
              {selectableTicketCount}
            </div>

            <button
                type="button"
                disabled={
                  refreshing
                }
                onClick={() => {
                  setErrorMessage('');
                  setInfoMessage('');

                  void refreshSeats(
                      true,
                  );
                }}
                className="flex size-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                aria-label="좌석 새로고침"
            >
              <RefreshCw
                  size={17}
                  className={
                    refreshing
                        ? 'animate-spin'
                        : ''
                  }
              />
            </button>
          </div>
        </header>

        {/*
         * =====================================================
         * Compact Status
         * =====================================================
         */}
        <section className="px-5 pt-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-medium text-slate-400">
                예약 가능
              </p>

              <p className="mt-1 text-lg font-bold text-slate-950">
                {availableSeatCount}
                <span className="ml-0.5 text-sm font-medium text-slate-500">
                  석
                </span>
              </p>
            </div>

            <div className="rounded-2xl bg-indigo-50/70 px-4 py-3">
              <p className="text-[11px] font-medium text-indigo-400">
                {accessToken &&
                reservationContext
                    ? '내 추가 예매'
                    : '1인 최대'}
              </p>

              <p className="mt-1 text-lg font-bold text-indigo-700">
                {selectableTicketCount}
                <span className="ml-0.5 text-sm font-medium text-indigo-500">
                  매
                </span>
              </p>
            </div>
          </div>

          {accessToken &&
              reservationContext && (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-xs">
                    <span className="text-slate-500">
                      기존 예매
                      {' '}
                      <strong className="font-semibold text-slate-700">
                        {
                          reservationContext
                              .reservedTicketCount
                        }
                        매
                      </strong>
                    </span>

                    <span
                        className={
                          reservationContext
                              .remainingTicketCount >
                          0
                              ? 'font-semibold text-indigo-600'
                              : 'font-semibold text-red-600'
                        }
                    >
                      추가 가능
                      {' '}
                      {
                        reservationContext
                            .remainingTicketCount
                      }
                      매
                    </span>
                  </div>
              )}
        </section>

        {/*
         * =====================================================
         * Pending / Limit Notices
         * =====================================================
         */}
        {hasPendingReservation &&
            pendingReservation && (
                <section className="mt-4 px-5">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex gap-3">
                      <CreditCard
                          size={19}
                          className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-amber-900">
                          결제 대기 중인 예매가 있습니다.
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700">
                          기존 예매를 처리하기 전에는
                          새 좌석을 선택할 수 없습니다.
                        </p>

                        <div className="mt-3 flex gap-2">
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

        {reservationLimitReached && (
            <section className="mt-4 px-5">
              <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle
                    size={19}
                    className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    추가 예매가 불가능합니다.
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    이 공연의 최대 예매 가능 매수인
                    {' '}
                    {
                      performance
                          .maxTicketsPerMember
                    }
                    매까지 이미 예매했습니다.
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
                    내 예매 확인
                  </button>
                </div>
              </div>
            </section>
        )}

        {/*
         * =====================================================
         * Stage
         * =====================================================
         */}
        <section className="px-5 pt-8">
          <div className="mx-auto w-[82%] max-w-[430px]">
            <div className="h-3 rounded-t-[100%] bg-slate-300"/>

            <div className="border-x border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white py-2.5 text-center">
              <span className="text-[10px] font-bold tracking-[0.38em] text-slate-500">
                STAGE
              </span>
            </div>
          </div>

          <div className="mx-auto mt-3 h-px w-[92%] bg-gradient-to-r from-transparent via-slate-200 to-transparent"/>

          <p className="mt-2 text-center text-[10px] font-medium text-slate-400">
            무대 방향
          </p>
        </section>

        {/*
         * =====================================================
         * Grade / State Legend
         * =====================================================
         */}
        <section className="mt-6 px-5">
          {gradeSummaries.length >
              0 && (
                  <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                    {gradeSummaries.map(
                        (
                            summary,
                        ) => (
                            <div
                                key={
                                  summary.grade
                                }
                                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2"
                            >
                              <p className="text-[10px] font-bold text-indigo-600">
                                {
                                  summary.grade
                                }
                              </p>

                              <p className="mt-0.5 whitespace-nowrap text-[11px] font-semibold text-slate-700">
                                {formatGradePrice(
                                    summary,
                                )}
                              </p>
                            </div>
                        ),
                    )}
                  </div>
              )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
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

        {/*
         * =====================================================
         * Messages
         * =====================================================
         */}
        {infoMessage && (
            <section className="mt-4 px-5">
              <p
                  role="status"
                  className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700"
              >
                {infoMessage}
              </p>
            </section>
        )}

        {errorMessage && (
            <section className="mt-4 px-5">
              <p
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
              >
                {errorMessage}
              </p>
            </section>
        )}

        {/*
         * =====================================================
         * Seat Map
         * =====================================================
         */}
        <section className="mt-7">
          {seats.length ===
          0 ? (
              <div className="mx-5 rounded-2xl bg-slate-50 p-8 text-center">
                <Armchair
                    size={28}
                    className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm text-slate-500">
                  등록된 좌석이 없습니다.
                </p>
              </div>
          ) : (
              <div className="space-y-8">
                {seatSections.map(
                    (
                        section,
                    ) => (
                        <section
                            key={
                              section.sectionName
                            }
                        >
                          <div className="mb-3 flex items-center gap-3 px-5">
                            <h2 className="text-sm font-bold text-slate-900">
                              {
                                section.sectionName
                              }
                            </h2>

                            <div className="h-px flex-1 bg-slate-100"/>

                            <span className="text-[10px] font-medium text-slate-400">
                              {
                                section.rows.reduce(
                                    (
                                        count,
                                        row,
                                    ) =>
                                        count +
                                        row.seats.length,
                                    0,
                                )
                              }
                              석
                            </span>
                          </div>

                          {/*
                           * 페이지 전체가 아니라
                           * 좌석 배치도만 가로 스크롤.
                           */}
                          <div className="overflow-x-auto px-5 pb-2">
                            <div className="mx-auto min-w-max rounded-2xl border border-slate-100 bg-slate-50/50 px-3 py-4">
                              <div className="space-y-2.5">
                                {section.rows.map(
                                    (
                                        row,
                                    ) => (
                                        <div
                                            key={
                                              `${section.sectionName}-${row.rowName}`
                                            }
                                            className="flex min-h-9 items-center"
                                        >
                                          {/*
                                           * 행 이름
                                           */}
                                          <div className="mr-3 flex w-9 shrink-0 items-center justify-center">
                                            <span className="text-[10px] font-bold text-slate-400">
                                              {
                                                row.rowName
                                              }
                                              열
                                            </span>
                                          </div>

                                          <div className="flex gap-1.5">
                                            {row.seats.map(
                                                (
                                                    seat,
                                                ) => {
                                                  const selected =
                                                      selectedSeatIds.includes(
                                                          seat.performanceSeatId,
                                                      );

                                                  const available =
                                                      seat.status ===
                                                      'AVAILABLE';

                                                  const selectable =
                                                      available &&
                                                      !hasPendingReservation &&
                                                      !reservationLimitReached;

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
                                                          title={
                                                            `${seat.sectionName} ${seat.rowName}열 ${seat.seatNumber}번 · ${seat.grade} · ${seat.price.toLocaleString('ko-KR')}원`
                                                          }
                                                          aria-label={
                                                            `${seat.sectionName} ${seat.rowName}열 ${seat.seatNumber}번`
                                                          }
                                                          aria-pressed={
                                                            selected
                                                          }
                                                          className={[
                                                            'relative flex size-9 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold transition-all duration-150',
                                                            selected
                                                                ? 'z-10 scale-105 border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                                                : selectable
                                                                    ? 'border-slate-300 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700'
                                                                    : 'cursor-not-allowed border-slate-200 bg-slate-200/80 text-slate-400',
                                                          ].join(
                                                              ' ',
                                                          )}
                                                      >
                                                        {
                                                          seat.seatNumber
                                                        }

                                                        {selected && (
                                                            <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-white"/>
                                                        )}
                                                      </button>
                                                  );
                                                },
                                            )}
                                          </div>
                                        </div>
                                    ),
                                )}
                              </div>
                            </div>
                          </div>
                        </section>
                    ),
                )}
              </div>
          )}
        </section>

        {/*
         * =====================================================
         * Selection Detail
         * =====================================================
         */}
        <section className="mt-8 px-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                선택한 좌석
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                선택한 좌석을 다시 누르면 해제할 수 있습니다.
              </p>
            </div>

            {selectedSeats.length >
                0 && (
                    <strong className="text-xs text-indigo-600">
                      {
                        selectedSeats.length
                      }
                      매
                    </strong>
                )}
          </div>

          {selectedSeats.length ===
          0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-5 py-6 text-center">
                <Armchair
                    size={23}
                    className="mx-auto text-slate-300"
                />

                <p className="mt-2 text-sm font-medium text-slate-500">
                  {hasPendingReservation
                      ? '기존 예매를 먼저 처리해주세요.'
                      : reservationLimitReached
                          ? '추가로 선택할 수 있는 좌석이 없습니다.'
                          : '좌석 번호를 눌러 선택해주세요.'}
                </p>
              </div>
          ) : (
              <div className="mt-4 space-y-2">
                {selectedSeats.map(
                    (
                        seat,
                    ) => (
                        <button
                            key={
                              seat.performanceSeatId
                            }
                            type="button"
                            onClick={() =>
                                handleSeatClick(
                                    seat,
                                )
                            }
                            className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left transition hover:border-slate-200"
                        >
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                            {
                              seat.seatNumber
                            }
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {
                                seat.sectionName
                              }
                              {' · '}
                              {
                                seat.rowName
                              }
                              열
                              {' '}
                              {
                                seat.seatNumber
                              }
                              번
                            </p>

                            <p className="mt-0.5 text-[11px] font-medium text-indigo-500">
                              {
                                seat.grade
                              }
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-slate-900">
                              {seat.price
                              .toLocaleString(
                                  'ko-KR',
                              )}
                              원
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              눌러서 해제
                            </p>
                          </div>
                        </button>
                    ),
                )}
              </div>
          )}
        </section>

        {/*
         * =====================================================
         * Bottom Reservation Bar
         * =====================================================
         */}
        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[640px] -translate-x-1/2 border-t border-slate-200 bg-white/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-400">
                총 결제 예정 금액
              </p>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                {selectedSeats.length >
                0
                    ? getSelectedSeatSummary(
                        selectedSeats,
                    )
                    : '좌석을 선택해주세요'}
              </p>
            </div>

            <strong className="shrink-0 text-xl font-black tracking-tight text-slate-950">
              {totalAmount
              .toLocaleString(
                  'ko-KR',
              )}
              <span className="ml-0.5 text-sm font-semibold">
                원
              </span>
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
              className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm shadow-indigo-100 transition hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {submitting
                ? '좌석을 확인하고 있습니다...'
                : hasPendingReservation
                    ? '기존 예매를 먼저 처리해주세요'
                    : reservationLimitReached
                        ? '추가 예매가 불가능합니다'
                        : selectedSeatIds.length >
                        0
                            ? `${selectedSeatIds.length}매 · 이 좌석으로 예매하기`
                            : '좌석을 선택해주세요'}
          </button>
        </div>
      </div>
  );
}

/*
 * ============================================================
 * UI Helpers
 * ============================================================
 */

interface LegendProps {
  label: string;
  className: string;
}

function Legend({
                  label,
                  className,
                }: LegendProps) {
  return (
      <div className="flex items-center gap-1.5">
        <span
            className={[
              'size-3.5 rounded border',
              className,
            ].join(
                ' ',
            )}
        />

        <span>
          {label}
        </span>
      </div>
  );
}

function formatGradePrice(
    summary: SeatGradeSummary,
): string {
  if (
      summary.minPrice ===
      summary.maxPrice
  ) {
    return `${summary.minPrice.toLocaleString(
        'ko-KR',
    )}원`;
  }

  return (
      `${summary.minPrice.toLocaleString('ko-KR')}원` +
      ` ~ ${summary.maxPrice.toLocaleString('ko-KR')}원`
  );
}

function getSelectedSeatSummary(
    selectedSeats: PerformanceSeat[],
): string {
  if (
      selectedSeats.length ===
      0
  ) {
    return '';
  }

  if (
      selectedSeats.length ===
      1
  ) {
    const seat =
        selectedSeats[0];

    return (
        `${seat.sectionName} · ` +
        `${seat.rowName}열 ` +
        `${seat.seatNumber}번`
    );
  }

  const first =
      selectedSeats[0];

  return (
      `${first.sectionName} · ` +
      `${first.rowName}열 ` +
      `${first.seatNumber}번 외 ` +
      `${selectedSeats.length - 1}석`
  );
}

function formatDateTime(
    value: string,
): string {
  const date =
      new Date(
          value,
      );

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
        month:
            'numeric',

        day:
            'numeric',

        hour:
            '2-digit',

        minute:
            '2-digit',

        hour12:
            false,
      },
  ).format(
      date,
  );
}
