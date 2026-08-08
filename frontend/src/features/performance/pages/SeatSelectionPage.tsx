import {
  ArrowLeft,
  Armchair,
  RefreshCw,
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
import { createReservation } from '@/features/reservation/api/reservationApi';
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

  const { performanceId } =
      useParams();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const numericPerformanceId =
      Number(performanceId);

  const accessToken = useAuthStore(
      (state) => state.accessToken,
  );

  const [performance, setPerformance] =
      useState<Performance | null>(null);

  const [seats, setSeats] =
      useState<PerformanceSeat[]>([]);

  const [
    selectedSeatIds,
    setSelectedSeatIds,
  ] = useState<number[]>([]);

  const [loading, setLoading] =
      useState(true);

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
              const response =
                  await getPerformanceSeats(
                      numericPerformanceId,
                  );

              setSeats(response.seats);

              const availableIds =
                  new Set(
                      response.seats
                      .filter(
                          (seat) =>
                              seat.status ===
                              'AVAILABLE',
                      )
                      .map(
                          (seat) =>
                              seat.performanceSeatId,
                      ),
                  );

              setSelectedSeatIds(
                  (current) => {
                    const next =
                        current.filter(
                            (seatId) =>
                                availableIds.has(
                                    seatId,
                                ),
                        );

                    if (
                        next.length !==
                        current.length
                    ) {
                      setInfoMessage(
                          '선택한 좌석 중 일부가 더 이상 예약 가능하지 않아 선택에서 제외되었습니다.',
                      );
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
          [numericPerformanceId],
      );

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
        ] = await Promise.all([
          getPerformance(
              numericPerformanceId,
          ),

          getPerformanceSeats(
              numericPerformanceId,
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

        const seatIdsFromQuery =
            searchParams
            .get('seatIds')
            ?.split(',')
            .map((value) =>
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
                    (seat) =>
                        seat.status ===
                        'AVAILABLE',
                )
                .map(
                    (seat) =>
                        seat.performanceSeatId,
                ),
            );

        const restoredSeatIds =
            seatIdsFromQuery
            .filter((seatId) =>
                availableIds.has(
                    seatId,
                ),
            )
            .slice(
                0,
                performanceResponse
                    .maxTicketsPerMember,
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
  }, [numericPerformanceId]);

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
              selectedSeatIds.join(','),
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

  useEffect(() => {
    if (
        loading ||
        !performance
    ) {
      return;
    }

    const intervalId =
        window.setInterval(() => {
          void refreshSeats();
        }, 10_000);

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

  const selectedSeats =
      useMemo(
          () =>
              seats.filter((seat) =>
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
                  (total, seat) =>
                      total + seat.price,
                  0,
              ),
          [selectedSeats],
      );

  function handleSeatClick(
      seat: PerformanceSeat,
  ) {
    if (
        seat.status !== 'AVAILABLE' ||
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
        selectedSeatIds.length >=
        performance.maxTicketsPerMember
    ) {
      setErrorMessage(
          `한 번에 최대 ${performance.maxTicketsPerMember}매까지 예매할 수 있습니다.`,
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
      navigate('/login', {
        state: {
          from: returnPath,
        },
      });

      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      /*
       * 예약 요청 직전에 좌석 상태를 한 번 더 조회한다.
       * 최종 동시성 검증은 백엔드가 수행하지만,
       * 불필요한 실패 요청을 줄일 수 있다.
       */
      const latestSeatsResponse =
          await getPerformanceSeats(
              performance.performanceId,
          );

      const availableIds =
          new Set(
              latestSeatsResponse.seats
              .filter(
                  (seat) =>
                      seat.status ===
                      'AVAILABLE',
              )
              .map(
                  (seat) =>
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
        setSeats(
            latestSeatsResponse.seats,
        );

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
      setErrorMessage(
          getApiErrorMessage(
              error,
              '예약 생성에 실패했습니다. 좌석 상태를 다시 확인해주세요.',
          ),
      );

      await refreshSeats();
    } finally {
      setSubmitting(false);
    }
  }

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

  if (
      errorMessage &&
      !performance
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

  const availableSeatCount =
      seats.filter(
          (seat) =>
              seat.status === 'AVAILABLE',
      ).length;

  return (
      <div className="min-h-dvh pb-40">
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
            좌석 선택
          </h1>

          <div className="ml-auto flex items-center gap-3">
            <p className="text-xs font-medium text-slate-500">
              {selectedSeatIds.length}/
              {
                performance.maxTicketsPerMember
              }
            </p>

            <button
                type="button"
                disabled={refreshing}
                onClick={() => {
                  setErrorMessage('');
                  setInfoMessage('');

                  void refreshSeats(true);
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

        <section className="px-5 pt-7">
          <div className="rounded-t-[50%] bg-slate-900 py-3 text-center text-xs font-semibold tracking-[0.3em] text-white">
            STAGE
          </div>

          <p className="mt-3 text-center text-xs text-slate-400">
            무대
          </p>
        </section>

        <section className="mt-6 px-5">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <span className="text-xs text-slate-500">
            예약 가능 좌석
          </span>

            <strong className="text-sm text-slate-900">
              {availableSeatCount}석
            </strong>
          </div>
        </section>

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
                {seats.map((seat) => {
                  const selected =
                      selectedSeatIds.includes(
                          seat.performanceSeatId,
                      );

                  const available =
                      seat.status ===
                      'AVAILABLE';

                  return (
                      <button
                          key={
                            seat.performanceSeatId
                          }
                          type="button"
                          disabled={!available}
                          onClick={() =>
                              handleSeatClick(seat)
                          }
                          className={[
                            'flex min-h-24 flex-col items-center justify-center rounded-xl border px-2 py-3 transition',
                            selected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : available
                                    ? 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30'
                                    : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300',
                          ].join(' ')}
                      >
                  <span className="text-[10px] font-medium">
                    {seat.sectionName}
                  </span>

                        <span className="mt-1 text-sm font-bold">
                    {seat.rowName}-
                          {seat.seatNumber}
                  </span>

                        <span className="mt-1 text-[10px]">
                    {seat.grade}
                  </span>

                        <span className="mt-1 text-[10px]">
                    {seat.price.toLocaleString(
                        'ko-KR',
                    )}
                          원
                  </span>
                      </button>
                  );
                })}
              </div>
          )}
        </section>

        <section className="mt-8 px-5">
          <h2 className="text-sm font-semibold text-slate-900">
            선택 좌석
          </h2>

          {selectedSeats.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                좌석을 선택해주세요.
              </p>
          ) : (
              <div className="mt-3 space-y-2">
                {selectedSeats.map((seat) => (
                    <div
                        key={
                          seat.performanceSeatId
                        }
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {seat.sectionName}{' '}
                          {seat.rowName}열{' '}
                          {seat.seatNumber}번
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {seat.grade}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-slate-900">
                        {seat.price.toLocaleString(
                            'ko-KR',
                        )}
                        원
                      </p>
                    </div>
                ))}
              </div>
          )}
        </section>

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
              {totalAmount.toLocaleString(
                  'ko-KR',
              )}
              원
            </strong>
          </div>

          <button
              type="button"
              disabled={
                  selectedSeatIds.length === 0 ||
                  submitting
              }
              onClick={() =>
                  void handleReservation()
              }
              className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting
                ? '예약 처리 중...'
                : selectedSeatIds.length >
                0
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

        <span>{label}</span>
      </div>
  );
}
