import type {
  KeyboardEvent,
} from 'react';

import {
  CalendarDays,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { getConcerts } from '@/features/concert/api/concertApi';
import ConcertCard from '@/features/concert/components/ConcertCard';
import type { Concert } from '@/features/concert/types/concert';
import { getPerformances } from '@/features/performance/api/performanceApi';
import type { Performance } from '@/features/performance/types/performance';
import {
  formatDate,
  formatTime,
} from '@/lib/date/formatDateTime';

interface UpcomingPerformance {
  concert: Concert;
  performance: Performance;
}

export default function HomePage() {
  const navigate = useNavigate();

  const [keyword, setKeyword] =
      useState('');

  const [concerts, setConcerts] =
      useState<Concert[]>([]);

  const [
    upcomingPerformances,
    setUpcomingPerformances,
  ] =
      useState<
          UpcomingPerformance[]
      >([]);

  const [loading, setLoading] =
      useState(true);

  const [errorMessage, setErrorMessage] =
      useState('');

  useEffect(() => {
    let active = true;

    async function loadHome() {
      try {
        const concertResponse =
            await getConcerts();

        if (!active) {
          return;
        }

        const concertList =
            concertResponse.concerts ??
            [];

        setConcerts(
            concertList,
        );

        const results =
            await Promise.all(
                concertList
                .slice(0, 8)
                .map(
                    async (
                        concert,
                    ) => {
                      try {
                        const response =
                            await getPerformances(
                                concert.concertId,
                            );

                        return response.performances.map(
                            (
                                performance,
                            ) => ({
                              concert,
                              performance,
                            }),
                        );
                      } catch {
                        return [];
                      }
                    },
                ),
            );

        if (!active) {
          return;
        }

        const now =
            Date.now();

        const upcoming =
            results
            .flat()
            .filter(
                ({
                   performance,
                 }) =>
                    new Date(
                        performance.startsAt,
                    ).getTime() >
                    now,
            )
            .sort(
                (a, b) =>
                    new Date(
                        a.performance
                            .startsAt,
                    ).getTime() -
                    new Date(
                        b.performance
                            .startsAt,
                    ).getTime(),
            )
            .slice(0, 5);

        setUpcomingPerformances(
            upcoming,
        );
      } catch {
        if (!active) {
          return;
        }

        setErrorMessage(
            '홈 정보를 불러오지 못했습니다.',
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadHome();

    return () => {
      active = false;
    };
  }, []);

  const popularConcerts =
      useMemo(
          () =>
              concerts.slice(0, 6),
          [concerts],
      );

  function handleSearch() {
    const normalized =
        keyword.trim();

    if (!normalized) {
      navigate('/concerts');
      return;
    }

    navigate(
        `/concerts?q=${encodeURIComponent(
            normalized,
        )}`,
    );
  }

  function handleKeyDown(
      event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
      <div className="pb-8">
        <section className="px-5 pt-6">
          <p className="text-sm font-medium text-slate-500">
            오늘 어떤 공연을 볼까요?
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            공연을 찾아보세요
          </h2>
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
                    setKeyword(
                        event.target.value,
                    )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="공연, 아티스트를 검색해보세요"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />

            {keyword && (
                <button
                    type="button"
                    onClick={() =>
                        setKeyword('')
                    }
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200"
                    aria-label="검색어 지우기"
                >
                  <X size={17} />
                </button>
            )}
          </div>
        </section>

        {errorMessage && (
            <section className="mt-6 px-5">
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            </section>
        )}

        <section className="mt-9">
          <div className="flex items-center justify-between px-5">
            <h3 className="text-lg font-bold text-slate-950">
              인기 공연
            </h3>

            <button
                type="button"
                onClick={() =>
                    navigate('/concerts')
                }
                className="flex items-center gap-0.5 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              전체보기

              <ChevronRight
                  size={16}
              />
            </button>
          </div>

          {popularConcerts.length ===
          0 ? (
              <div className="px-5 py-8">
                <p className="text-sm text-slate-400">
                  현재 공개된 공연이 없습니다.
                </p>
              </div>
          ) : (
              <div className="mt-4 flex gap-4 overflow-x-auto px-5 pb-2">
                {popularConcerts.map(
                    (concert) => (
                        <div
                            key={
                              concert.concertId
                            }
                            className="w-40 shrink-0"
                        >
                          <ConcertCard
                              concert={
                                concert
                              }
                              onClick={() =>
                                  navigate(
                                      `/concerts/${concert.concertId}`,
                                  )
                              }
                          />
                        </div>
                    ),
                )}
              </div>
          )}
        </section>

        <section className="mt-9 px-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-950">
              곧 시작하는 공연
            </h3>

            <button
                type="button"
                onClick={() =>
                    navigate('/concerts')
                }
                className="flex items-center gap-0.5 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              전체보기

              <ChevronRight
                  size={16}
              />
            </button>
          </div>

          {upcomingPerformances.length ===
          0 ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-center">
                <CalendarDays
                    size={26}
                    className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm text-slate-500">
                  예정된 공연이 없습니다.
                </p>
              </div>
          ) : (
              <div className="mt-4 space-y-3">
                {upcomingPerformances.map(
                    ({
                       concert,
                       performance,
                     }) => (
                        <button
                            key={
                              performance.performanceId
                            }
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/concerts/${concert.concertId}`,
                                )
                            }
                            className="flex w-full gap-4 rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {concert.posterUrl ? (
                                <img
                                    src={
                                      concert.posterUrl
                                    }
                                    alt={`${concert.title} 포스터`}
                                    className="h-full w-full object-cover"
                                />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1 py-1">
                            <p className="text-xs font-semibold text-indigo-600">
                              {
                                concert.category
                              }
                            </p>

                            <h4 className="mt-1 line-clamp-2 text-base font-semibold text-slate-900">
                              {concert.title}
                            </h4>

                            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                              <CalendarDays
                                  size={15}
                              />

                              <span>
                        {formatDate(
                            performance.startsAt,
                        )}
                      </span>
                            </div>

                            <p className="mt-1 pl-[23px] text-sm text-slate-500">
                              {formatTime(
                                  performance.startsAt,
                              )}
                            </p>
                          </div>

                          <div className="flex items-center">
                            <ChevronRight
                                size={19}
                                className="text-slate-300"
                            />
                          </div>
                        </button>
                    ),
                )}
              </div>
          )}
        </section>
      </div>
  );
}

function HomeSkeleton() {
  return (
      <div className="animate-pulse pb-8">
        <section className="px-5 pt-6">
          <div className="h-4 w-36 rounded bg-slate-200" />

          <div className="mt-3 h-7 w-48 rounded bg-slate-200" />

          <div className="mt-6 h-12 rounded-xl bg-slate-200" />
        </section>

        <section className="mt-9 px-5">
          <div className="h-5 w-24 rounded bg-slate-200" />

          <div className="mt-4 flex gap-4 overflow-hidden">
            {Array.from({
              length: 3,
            }).map((_, index) => (
                <div
                    key={index}
                    className="w-40 shrink-0"
                >
                  <div className="aspect-[3/4] rounded-xl bg-slate-200" />

                  <div className="mt-3 h-4 rounded bg-slate-200" />
                </div>
            ))}
          </div>
        </section>
      </div>
  );
}
