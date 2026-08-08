import {
  CalendarDays,
  ChevronRight,
  CreditCard,
  MapPin,
  Search,
  Ticket,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import {
  formatDate,
  formatTime,
} from '@/lib/date/formatDateTime';
import { getApiErrorMessage } from '@/lib/api/getApiErrorMessage';

import { getMyBookingReservations } from '../api/reservationApi';
import type { MyReservationItem } from '../types/reservation';

type ReservationFilter =
    | 'ALL'
    | 'PENDING_PAYMENT'
    | 'COMPLETED'
    | 'CANCELLED';

const filters: {
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
];

export default function ReservationListPage() {
  const navigate = useNavigate();

  const [reservations, setReservations] =
      useState<MyReservationItem[]>([]);

  const [filter, setFilter] =
      useState<ReservationFilter>('ALL');

  const [keyword, setKeyword] =
      useState('');

  const [loading, setLoading] =
      useState(true);

  const [errorMessage, setErrorMessage] =
      useState('');

  useEffect(() => {
    let active = true;

    async function loadReservations() {
      setLoading(true);
      setErrorMessage('');

      try {
        const response =
            await getMyBookingReservations({
              status:
                  filter === 'ALL'
                      ? undefined
                      : filter,

              sort: 'RESERVED_AT_DESC',

              page: 0,
              size: 50,
            });

        if (!active) {
          return;
        }

        setReservations(
            response.content ?? [],
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
  }, [filter]);

  const filteredReservations =
      useMemo(() => {
        const normalized =
            keyword
            .trim()
            .toLowerCase();

        if (!normalized) {
          return reservations;
        }

        return reservations.filter(
            (reservation) =>
                [
                  reservation.concertTitle,
                  reservation.venueName,
                  reservation.venueHallName,
                  reservation.reservationNumber,
                ].some((value) =>
                    value
                    ?.toLowerCase()
                    .includes(normalized),
                ),
        );
      }, [
        reservations,
        keyword,
      ]);

  return (
      <div className="pb-8">
        <section className="px-5 pt-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            예매
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            예매한 공연과 결제 상태를 확인할 수 있습니다.
          </p>
        </section>

        <section className="mt-6 px-5">
          <div className="flex h-12 items-center gap-3 rounded-xl bg-slate-100 px-4">
            <Search
                size={19}
                className="shrink-0 text-slate-400"
            />

            <input
                type="search"
                value={keyword}
                onChange={(event) =>
                    setKeyword(event.target.value)
                }
                placeholder="공연명, 공연장, 예약번호 검색"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </section>

        <section className="mt-5 overflow-x-auto px-5">
          <div className="flex min-w-max gap-2">
            {filters.map((item) => {
              const active =
                  filter === item.value;

              return (
                  <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                          setFilter(item.value)
                      }
                      className={[
                        'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                        active
                            ? 'bg-slate-950 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      ].join(' ')}
                  >
                    {item.label}
                  </button>
              );
            })}
          </div>
        </section>

        {loading && (
            <section className="flex min-h-[420px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                <p className="text-sm text-slate-500">
                  예매 내역을 불러오고 있습니다.
                </p>
              </div>
            </section>
        )}

        {!loading &&
            errorMessage && (
                <section className="px-5 py-8">
                  <p className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
                    {errorMessage}
                  </p>
                </section>
            )}

        {!loading &&
            !errorMessage &&
            filteredReservations.length ===
            0 && (
                <EmptyReservation
                    onConcertClick={() =>
                        navigate('/concerts')
                    }
                />
            )}

        {!loading &&
            !errorMessage &&
            filteredReservations.length >
            0 && (
                <section className="mt-6 px-5">
                  <div className="space-y-4">
                    {filteredReservations.map(
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
                  </div>
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
  return (
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <button
            type="button"
            onClick={onDetail}
            className="flex w-full gap-4 p-4 text-left transition-colors hover:bg-slate-50"
        >
          <div className="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            {reservation.posterUrl ? (
                <img
                    src={reservation.posterUrl}
                    alt={`${reservation.concertTitle} 포스터`}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full items-center justify-center">
                  <Ticket
                      size={24}
                      className="text-slate-300"
                  />
                </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <StatusBadge
                  status={
                    reservation.reservationStatus
                  }
              />

              <ChevronRight
                  size={18}
                  className="shrink-0 text-slate-300"
              />
            </div>

            <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-slate-900">
              {reservation.concertTitle}
            </h3>

            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays
                    size={15}
                    className="shrink-0"
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

              <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
                <MapPin
                    size={15}
                    className="shrink-0"
                />

                <span className="truncate">
                {reservation.venueName}
                  {reservation.venueHallName
                      ? ` · ${reservation.venueHallName}`
                      : ''}
              </span>
              </div>
            </div>
          </div>
        </button>

        <div className="border-t border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">
                예약번호
              </p>

              <p className="mt-0.5 text-xs font-medium text-slate-600">
                {
                  reservation.reservationNumber
                }
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">
                {reservation.ticketCount}매
              </p>

              <p className="mt-0.5 text-sm font-bold text-slate-900">
                {reservation.totalAmount.toLocaleString(
                    'ko-KR',
                )}
                원
              </p>
            </div>
          </div>

          {reservation.requiresPayment && (
              <button
                  type="button"
                  onClick={onPayment}
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                <CreditCard size={17} />

                결제하기
              </button>
          )}

          {!reservation.requiresPayment &&
              reservation.payment && (
                  <PaymentStatus
                      status={
                        reservation.payment.status
                      }
                      method={
                        reservation.payment.method
                      }
                  />
              )}
        </div>
      </article>
  );
}

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({
                       status,
                     }: StatusBadgeProps) {
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
            'rounded-full px-2.5 py-1 text-[11px] font-semibold',
            className,
          ].join(' ')}
      >
      {label}
    </span>
  );
}

interface PaymentStatusProps {
  status: string;
  method: string | null;
}

function PaymentStatus({
                         status,
                         method,
                       }: PaymentStatusProps) {
  return (
      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-xs text-slate-500">
        결제 상태
      </span>

        <span className="text-xs font-semibold text-slate-700">
        {method
            ? `${method} · ${status}`
            : status}
      </span>
      </div>
  );
}

interface EmptyReservationProps {
  onConcertClick: () => void;
}

function EmptyReservation({
                            onConcertClick,
                          }: EmptyReservationProps) {
  return (
      <section className="flex min-h-[420px] flex-col items-center justify-center px-5">
        <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Ticket
              size={28}
              strokeWidth={1.8}
          />
        </div>

        <p className="mt-5 text-base font-semibold text-slate-700">
          예매 내역이 없습니다.
        </p>

        <p className="mt-2 text-sm text-slate-400">
          보고 싶은 공연을 찾아보세요.
        </p>

        <button
            type="button"
            onClick={onConcertClick}
            className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white"
        >
          <Search size={17} />

          공연 찾아보기
        </button>
      </section>
  );
}
