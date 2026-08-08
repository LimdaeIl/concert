import {
  CalendarDays,
  ChevronRight,
  CreditCard,
  MapPin,
  Search,
  Ticket,
} from 'lucide-react';
import type {
  KeyboardEvent,
} from 'react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import ConcertPoster from '@/features/concert/components/ConcertPoster';
import {
  formatDate,
  formatTime,
} from '@/lib/date/formatDateTime';
import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  getMyBookingReservations,
} from '../api/reservationApi';
import type {
  MyReservationItem,
} from '../types/reservation';

type ReservationFilter =
    | 'ALL'
    | 'PENDING_PAYMENT'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'EXPIRED';

type ProgressFilter =
    | 'ALL'
    | 'UPCOMING'
    | 'ONGOING'
    | 'ENDED';

const RESERVATION_FILTERS: {
  value: ReservationFilter;
  label: string;
}[] = [
  {
    value: 'ALL',
    label: '전체',
  },
  {
    value: 'PENDING_PAYMENT',
    label: '결제 대기',
  },
  {
    value: 'COMPLETED',
    label: '예매 완료',
  },
  {
    value: 'CANCELLED',
    label: '취소',
  },
  {
    value: 'EXPIRED',
    label: '만료',
  },
];

const PROGRESS_FILTERS: {
  value: ProgressFilter;
  label: string;
}[] = [
  {
    value: 'ALL',
    label: '전체 공연',
  },
  {
    value: 'UPCOMING',
    label: '공연 예정',
  },
  {
    value: 'ONGOING',
    label: '공연 중',
  },
  {
    value: 'ENDED',
    label: '공연 종료',
  },
];

export default function ReservationListPage() {
  const navigate =
      useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [
    reservations,
    setReservations,
  ] = useState<
      MyReservationItem[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    keyword,
    setKeyword,
  ] = useState(
      searchParams.get('keyword') ??
      '',
  );

  const status =
      normalizeReservationFilter(
          searchParams.get('status'),
      );

  const concertProgress =
      normalizeProgressFilter(
          searchParams.get(
              'concertProgress',
          ),
      );

  const sort =
      searchParams.get('sort') ??
      'RESERVED_AT_DESC';

  const [totalElements, setTotalElements] =
      useState(0);

  useEffect(() => {
    let active = true;

    async function loadReservations() {
      setLoading(true);
      setErrorMessage('');

      try {
        const response =
            await getMyBookingReservations(
                {
                  status:
                      status === 'ALL'
                          ? undefined
                          : status,

                  concertProgress:
                      concertProgress ===
                      'ALL'
                          ? undefined
                          : concertProgress,

                  keyword:
                      searchParams.get(
                          'keyword',
                      ) ||
                      undefined,

                  sort,

                  page: 0,
                  size: 50,
                },
            );

        if (!active) {
          return;
        }

        setReservations(
            response.content ?? [],
        );

        setTotalElements(
            response.totalElements ??
            0,
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(
            getApiErrorMessage(
                error,
                '예매 내역을 불러오지 못했습니다.',
            ),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadReservations();

    return () => {
      active = false;
    };
  }, [
    status,
    concertProgress,
    sort,
    searchParams,
  ]);

  const hasFilters =
      status !== 'ALL' ||
      concertProgress !==
      'ALL' ||
      Boolean(
          searchParams.get(
              'keyword',
          ),
      );

  const pendingPaymentCount =
      useMemo(
          () =>
              reservations.filter(
                  (reservation) =>
                      reservation.requiresPayment,
              ).length,
          [reservations],
      );

  function updateParam(
      key: string,
      value?: string,
  ) {
    const next =
        new URLSearchParams(
            searchParams,
        );

    if (!value) {
      next.delete(key);
    } else {
      next.set(
          key,
          value,
      );
    }

    setSearchParams(
        next,
        {
          replace: true,
        },
    );
  }

  function handleSearch() {
    const normalized =
        keyword.trim();

    updateParam(
        'keyword',
        normalized ||
        undefined,
    );
  }

  function handleKeyDown(
      event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (
        event.key === 'Enter'
    ) {
      handleSearch();
    }
  }

  function resetFilters() {
    setKeyword('');

    setSearchParams(
        {},
        {
          replace: true,
        },
    );
  }

  return (
      <div className="pb-8">
        {/* 제목 */}
        <section className="px-5 pt-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                예매
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                공연 예매 및 결제
                내역을 확인하세요.
              </p>
            </div>

            {!loading && (
                <span className="text-xs text-slate-400">
              총{' '}
                  {totalElements.toLocaleString(
                      'ko-KR',
                  )}
                  건
            </span>
            )}
          </div>
        </section>

        {/* 결제 대기 안내 */}
        {!loading &&
            pendingPaymentCount > 0 && (
                <section className="mt-5 px-5">
                  <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <CreditCard
                          size={19}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-amber-800">
                        결제가 필요한 예매가{' '}
                        {
                          pendingPaymentCount
                        }
                        건 있습니다.
                      </p>

                      <p className="mt-1 text-xs text-amber-600">
                        결제 시간이 지나면
                        예약이 만료될 수
                        있습니다.
                      </p>
                    </div>
                  </div>
                </section>
            )}

        {/* 검색 */}
        <section className="mt-6 px-5">
          <div className="flex h-12 items-center gap-3 rounded-xl bg-slate-100 px-4">
            <Search
                size={18}
                className="shrink-0 text-slate-400"
            />

            <input
                type="search"
                value={keyword}
                onChange={(event) =>
                    setKeyword(
                        event.target.value,
                    )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="공연명 검색"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />

            <button
                type="button"
                onClick={
                  handleSearch
                }
                className="shrink-0 text-xs font-semibold text-indigo-600"
            >
              검색
            </button>
          </div>
        </section>

        {/* 예약 상태 필터 */}
        <section className="mt-5">
          <div className="flex gap-2 overflow-x-auto px-5 pb-1">
            {RESERVATION_FILTERS.map(
                (filter) => {
                  const active =
                      status ===
                      filter.value;

                  return (
                      <button
                          key={
                            filter.value
                          }
                          type="button"
                          onClick={() =>
                              updateParam(
                                  'status',
                                  filter.value ===
                                  'ALL'
                                      ? undefined
                                      : filter.value,
                              )
                          }
                          className={[
                            'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                            active
                                ? 'bg-slate-950 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                          ].join(
                              ' ',
                          )}
                      >
                        {
                          filter.label
                        }
                      </button>
                  );
                },
            )}
          </div>
        </section>

        {/* 공연 진행상태 */}
        <section className="mt-3">
          <div className="flex gap-2 overflow-x-auto px-5 pb-1">
            {PROGRESS_FILTERS.map(
                (filter) => {
                  const active =
                      concertProgress ===
                      filter.value;

                  return (
                      <button
                          key={
                            filter.value
                          }
                          type="button"
                          onClick={() =>
                              updateParam(
                                  'concertProgress',
                                  filter.value ===
                                  'ALL'
                                      ? undefined
                                      : filter.value,
                              )
                          }
                          className={[
                            'shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                            active
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-slate-500 hover:bg-slate-100',
                          ].join(
                              ' ',
                          )}
                      >
                        {
                          filter.label
                        }
                      </button>
                  );
                },
            )}
          </div>
        </section>

        {/* 필터 초기화 */}
        {hasFilters && (
            <section className="mt-4 px-5">
              <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="text-xs font-medium text-slate-400 underline underline-offset-4"
              >
                검색 조건 초기화
              </button>
            </section>
        )}

        {/* 로딩 */}
        {loading && (
            <ReservationListSkeleton />
        )}

        {/* 오류 */}
        {!loading &&
            errorMessage && (
                <section className="px-5 py-8">
                  <div className="rounded-2xl bg-red-50 p-5">
                    <p className="text-sm text-red-700">
                      {
                        errorMessage
                      }
                    </p>
                  </div>
                </section>
            )}

        {/* 빈 목록 */}
        {!loading &&
            !errorMessage &&
            reservations.length ===
            0 && (
                <section className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-slate-100">
                    <Ticket
                        size={28}
                        className="text-slate-400"
                    />
                  </div>

                  <h2 className="mt-5 text-base font-semibold text-slate-700">
                    예매 내역이 없습니다.
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    원하는 공연을 찾아
                    예매해보세요.
                  </p>

                  <button
                      type="button"
                      onClick={() =>
                          navigate(
                              '/concerts',
                          )
                      }
                      className="mt-6 h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white"
                  >
                    공연 찾아보기
                  </button>
                </section>
            )}

        {/* 예약 목록 */}
        {!loading &&
            !errorMessage &&
            reservations.length >
            0 && (
                <section className="mt-5 space-y-4 px-5">
                  {reservations.map(
                      (reservation) => (
                          <ReservationCard
                              key={
                                reservation.reservationId
                              }
                              reservation={
                                reservation
                              }
                              onDetail={() =>
                                  navigate(
                                      `/reservations/${reservation.reservationId}`,
                                  )
                              }
                              onPayment={() =>
                                  navigate(
                                      `/reservations/${reservation.reservationId}/payment`,
                                  )
                              }
                          />
                      ),
                  )}
                </section>
            )}
      </div>
  );
}

interface ReservationCardProps {
  reservation: MyReservationItem;
  onDetail: () => void;
  onPayment: () => void;
}

function ReservationCard({
                           reservation,
                           onDetail,
                           onPayment,
                         }: ReservationCardProps) {
  const displayState =
      getReservationDisplayState(
          reservation,
      );

  return (
      <article
          className={[
            'overflow-hidden rounded-2xl border bg-white transition-colors',
            displayState.muted
                ? 'border-slate-200 opacity-80'
                : 'border-slate-200',
          ].join(' ')}
      >
        <button
            type="button"
            onClick={
              onDetail
            }
            className="w-full text-left"
        >
          <div className="flex gap-4 p-4">
            {/* 기본 이미지 fallback */}
            <div className="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              <ConcertPoster
                  src={
                    reservation.posterUrl
                  }
                  alt={`${reservation.concertTitle} 포스터`}
                  className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <ReservationStateBadge
                    reservation={
                      reservation
                    }
                />

                <ChevronRight
                    size={18}
                    className="shrink-0 text-slate-300"
                />
              </div>

              <h2 className="mt-3 line-clamp-2 text-base font-bold leading-6 text-slate-950">
                {
                  reservation.concertTitle
                }
              </h2>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays
                      size={14}
                      className="shrink-0 text-slate-400"
                  />

                  <span>
                  {formatDate(
                      reservation.startsAt,
                  )}{' '}
                    {formatTime(
                        reservation.startsAt,
                    )}
                </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin
                      size={14}
                      className="shrink-0 text-slate-400"
                  />

                  <span className="truncate">
                  {
                    reservation.venueName
                  }
                    {' · '}
                    {
                      reservation.venueHallName
                    }
                </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Ticket
                      size={14}
                      className="shrink-0 text-slate-400"
                  />

                  <span>
                  {
                    reservation.ticketCount
                  }
                    매
                </span>

                  <span className="text-slate-300">
                  ·
                </span>

                  <span>
                  {reservation.totalAmount.toLocaleString(
                      'ko-KR',
                  )}
                    원
                </span>
                </div>
              </div>
            </div>
          </div>
        </button>

        <div className="border-t border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400">
                예약번호
              </p>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                {
                  reservation.reservationNumber
                }
              </p>
            </div>

            <ReservationAction
                reservation={
                  reservation
                }
                onDetail={
                  onDetail
                }
                onPayment={
                  onPayment
                }
            />
          </div>
        </div>

        {displayState.description && (
            <div
                className={[
                  'border-t px-4 py-3 text-xs leading-5',
                  displayState.descriptionClassName,
                ].join(' ')}
            >
              {
                displayState.description
              }
            </div>
        )}
      </article>
  );
}

interface ReservationActionProps {
  reservation: MyReservationItem;
  onDetail: () => void;
  onPayment: () => void;
}

function ReservationAction({
                             reservation,
                             onDetail,
                             onPayment,
                           }: ReservationActionProps) {
  /*
   * 가장 중요한 분기:
   * reservationStatus만 보지 않고
   * 백엔드 requiresPayment를 사용한다.
   */
  if (
      reservation.requiresPayment
  ) {
    return (
        <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPayment();
            }}
            className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <CreditCard
              size={14}
          />

          결제하기
        </button>
    );
  }

  if (
      reservation.refundStatus ===
      'REQUESTED'
  ) {
    return (
        <span className="shrink-0 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-600">
        환불 처리 중
      </span>
    );
  }

  return (
      <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDetail();
          }}
          className="h-9 shrink-0 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
      >
        상세보기
      </button>
  );
}

interface ReservationStateBadgeProps {
  reservation: MyReservationItem;
}

function ReservationStateBadge({
                                 reservation,
                               }: ReservationStateBadgeProps) {
  const state =
      getReservationDisplayState(
          reservation,
      );

  return (
      <span
          className={[
            'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold',
            state.className,
          ].join(' ')}
      >
      {state.label}
    </span>
  );
}

function getReservationDisplayState(
    reservation: MyReservationItem,
) {
  /*
   * 환불/취소 진행 상태를 가장 먼저 본다.
   */
  if (
      reservation.refundStatus ===
      'REQUESTED'
  ) {
    return {
      label: '환불 처리 중',
      className:
          'bg-amber-50 text-amber-600',
      muted: false,
      description:
          '결제 취소 요청이 처리되고 있습니다.',
      descriptionClassName:
          'border-amber-100 bg-amber-50/50 text-amber-700',
    };
  }

  if (
      reservation.refundStatus ===
      'COMPLETED'
  ) {
    return {
      label: '환불 완료',
      className:
          'bg-slate-100 text-slate-600',
      muted: true,
      description:
          '결제 취소 및 환불 처리가 완료되었습니다.',
      descriptionClassName:
          'border-slate-100 bg-slate-50 text-slate-500',
    };
  }

  if (
      reservation.refundStatus ===
      'FAILED'
  ) {
    return {
      label: '환불 실패',
      className:
          'bg-red-50 text-red-600',
      muted: false,
      description:
          '환불 처리에 실패했습니다. 예매 상세에서 상태를 확인해주세요.',
      descriptionClassName:
          'border-red-100 bg-red-50/50 text-red-600',
    };
  }

  /*
   * PENDING_PAYMENT라 해도
   * 실제 결제가 가능한지는 requiresPayment가 기준.
   */
  if (
      reservation.reservationStatus ===
      'PENDING_PAYMENT'
  ) {
    if (
        reservation.requiresPayment
    ) {
      return {
        label: '결제 대기',
        className:
            'bg-amber-50 text-amber-600',
        muted: false,
        description:
            '결제를 완료해야 예매가 확정됩니다.',
        descriptionClassName:
            'border-amber-100 bg-amber-50/50 text-amber-700',
      };
    }

    return {
      label: '결제 만료',
      className:
          'bg-slate-100 text-slate-500',
      muted: true,
      description:
          '결제 가능 시간이 지나 더 이상 결제할 수 없습니다.',
      descriptionClassName:
          'border-slate-100 bg-slate-50 text-slate-500',
    };
  }

  if (
      reservation.reservationStatus ===
      'COMPLETED'
  ) {
    return {
      label: '예매 완료',
      className:
          'bg-emerald-50 text-emerald-600',
      muted: false,
      description:
          reservation.canCancel
              ? '공연 시작 전까지 예매 취소가 가능합니다.'
              : undefined,
      descriptionClassName:
          'border-emerald-100 bg-emerald-50/40 text-emerald-700',
    };
  }

  if (
      reservation.reservationStatus ===
      'CANCELLED'
  ) {
    return {
      label: '예매 취소',
      className:
          'bg-slate-100 text-slate-500',
      muted: true,
      description:
          '취소된 예매입니다.',
      descriptionClassName:
          'border-slate-100 bg-slate-50 text-slate-500',
    };
  }

  if (
      reservation.reservationStatus ===
      'EXPIRED'
  ) {
    return {
      label: '예약 만료',
      className:
          'bg-slate-100 text-slate-500',
      muted: true,
      description:
          '결제 시간이 만료되어 예약이 종료되었습니다.',
      descriptionClassName:
          'border-slate-100 bg-slate-50 text-slate-500',
    };
  }

  return {
    label:
    reservation.reservationStatus,
    className:
        'bg-slate-100 text-slate-500',
    muted: false,
    description: undefined,
    descriptionClassName: '',
  };
}

function normalizeReservationFilter(
    value: string | null,
): ReservationFilter {
  switch (value) {
    case 'PENDING_PAYMENT':
    case 'COMPLETED':
    case 'CANCELLED':
    case 'EXPIRED':
      return value;

    default:
      return 'ALL';
  }
}

function normalizeProgressFilter(
    value: string | null,
): ProgressFilter {
  switch (value) {
    case 'UPCOMING':
    case 'ONGOING':
    case 'ENDED':
      return value;

    default:
      return 'ALL';
  }
}

function ReservationListSkeleton() {
  return (
      <section className="mt-6 space-y-4 px-5">
        {Array.from({
          length: 4,
        }).map((_, index) => (
            <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="flex gap-4 p-4">
                <div className="h-32 w-24 shrink-0 rounded-xl bg-slate-200" />

                <div className="flex-1 py-1">
                  <div className="h-5 w-16 rounded-full bg-slate-200" />

                  <div className="mt-4 h-5 w-full rounded bg-slate-200" />

                  <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />

                  <div className="mt-4 h-3 w-32 rounded bg-slate-200" />

                  <div className="mt-2 h-3 w-40 rounded bg-slate-200" />
                </div>
              </div>

              <div className="border-t border-slate-100 px-4 py-3">
                <div className="h-9 rounded-lg bg-slate-100" />
              </div>
            </div>
        ))}
      </section>
  );
}
