import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  Ticket,
} from 'lucide-react';
import {
  useEffect,
  useState,
} from 'react';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import { getPerformances } from '@/features/performance/api/performanceApi';
import type { Performance } from '@/features/performance/types/performance';
import {
  formatDate,
  formatTime,
} from '@/lib/date/formatDateTime';

import { getConcert } from '../api/concertApi';
import type { Concert } from '../types/concert';

export default function ConcertDetailPage() {
  const navigate = useNavigate();
  const { concertId } = useParams();

  const numericConcertId =
      Number(concertId);

  const [concert, setConcert] =
      useState<Concert | null>(null);

  const [performances, setPerformances] =
      useState<Performance[]>([]);

  const [loading, setLoading] =
      useState(true);

  const [errorMessage, setErrorMessage] =
      useState('');

  useEffect(() => {
    let active = true;

    async function loadPage() {
      if (
          !Number.isInteger(numericConcertId) ||
          numericConcertId <= 0
      ) {
        setErrorMessage(
            '잘못된 공연 정보입니다.',
        );
        setLoading(false);
        return;
      }

      try {
        const [
          concertResponse,
          performanceResponse,
        ] = await Promise.all([
          getConcert(numericConcertId),
          getPerformances(
              numericConcertId,
          ),
        ]);

        if (!active) {
          return;
        }

        setConcert(concertResponse);
        setPerformances(
            performanceResponse.performances,
        );
      } catch {
        if (!active) {
          return;
        }

        setErrorMessage(
            '공연 정보를 불러오지 못했습니다.',
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
  }, [numericConcertId]);

  if (loading) {
    return (
        <div className="flex min-h-dvh items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
        </div>
    );
  }

  if (errorMessage || !concert) {
    return (
        <div className="px-5 py-8">
          <button
              type="button"
              onClick={() => navigate(-1)}
          >
            <ArrowLeft size={22} />
          </button>

          <p className="mt-8 text-sm text-red-600">
            {errorMessage ||
                '공연 정보가 없습니다.'}
          </p>
        </div>
    );
  }

  return (
      <div className="min-h-dvh pb-10">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-slate-100 bg-white/95 px-4 backdrop-blur">
          <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100"
              aria-label="뒤로가기"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="ml-2 truncate text-base font-semibold text-slate-900">
            공연 상세
          </h1>
        </header>

        <section className="px-5 pt-6">
          <div className="mx-auto aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
            {concert.posterUrl ? (
                <img
                    src={concert.posterUrl}
                    alt={`${concert.title} 포스터`}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  포스터 없음
                </div>
            )}
          </div>

          <div className="mt-7">
            <p className="text-sm font-semibold text-indigo-600">
              {concert.category}
            </p>

            <h2 className="mt-2 text-2xl font-bold leading-8 text-slate-950">
              {concert.title}
            </h2>

            {concert.subtitle && (
                <p className="mt-2 text-sm text-slate-500">
                  {concert.subtitle}
                </p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock3 size={17} />

                <span className="text-xs">
                관람 시간
              </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {concert.runningTime}분
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Ticket size={17} />

                <span className="text-xs">
                관람 등급
              </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {concert.ageRating}
              </p>
            </div>
          </div>
        </section>

        {concert.description && (
            <section className="mt-8 border-t border-slate-100 px-5 pt-7">
              <h3 className="text-lg font-bold text-slate-950">
                공연 소개
              </h3>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {concert.description}
              </p>
            </section>
        )}

        <section className="mt-8 border-t border-slate-100 px-5 pt-7">
          <div className="flex items-center gap-2">
            <CalendarDays
                size={20}
                className="text-indigo-600"
            />

            <h3 className="text-lg font-bold text-slate-950">
              공연 회차
            </h3>
          </div>

          {performances.length === 0 ? (
              <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-500">
                  현재 예매 가능한 회차가 없습니다.
                </p>
              </div>
          ) : (
              <div className="mt-5 space-y-3">
                {performances.map(
                    (performance) => {
                      const disabled =
                          performance.status !==
                          'OPEN';

                      return (
                          <button
                              key={
                                performance.performanceId
                              }
                              type="button"
                              disabled={disabled}
                              onClick={() =>
                                  navigate(
                                      `/performances/${performance.performanceId}/seats`,
                                  )
                              }
                              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition-colors enabled:hover:border-indigo-200 enabled:hover:bg-indigo-50/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-900">
                                  {formatDate(
                                      performance.startsAt,
                                  )}
                                </p>

                                <PerformanceStatusBadge
                                    status={
                                      performance.status
                                    }
                                />
                              </div>

                              <p className="mt-2 text-sm text-slate-500">
                                {formatTime(
                                    performance.startsAt,
                                )}{' '}
                                ~{' '}
                                {formatTime(
                                    performance.endsAt,
                                )}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                1인 최대{' '}
                                {
                                  performance.maxTicketsPerMember
                                }
                                매
                              </p>
                            </div>

                            {!disabled && (
                                <ChevronRight
                                    size={19}
                                    className="shrink-0 text-slate-300"
                                />
                            )}
                          </button>
                      );
                    },
                )}
              </div>
          )}
        </section>
      </div>
  );
}

interface PerformanceStatusBadgeProps {
  status: string;
}

function PerformanceStatusBadge({
                                  status,
                                }: PerformanceStatusBadgeProps) {
  const label =
      status === 'OPEN'
          ? '예매 가능'
          : status === 'SOLD_OUT'
              ? '매진'
              : status === 'SCHEDULED'
                  ? '예매 예정'
                  : status;

  return (
      <span
          className={[
            'rounded-full px-2 py-1 text-[10px] font-semibold',
            status === 'OPEN'
                ? 'bg-emerald-50 text-emerald-600'
                : status === 'SOLD_OUT'
                    ? 'bg-red-50 text-red-500'
                    : 'bg-slate-100 text-slate-500',
          ].join(' ')}
      >
      {label}
    </span>
  );
}