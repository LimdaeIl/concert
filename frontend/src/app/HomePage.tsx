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
import {
  useNavigate,
} from 'react-router-dom';

import {
  getConcerts,
} from '@/features/concert/api/concertApi';
import ConcertCard from '@/features/concert/components/ConcertCard';
import ConcertPoster from '@/features/concert/components/ConcertPoster';
import type {
  Concert,
} from '@/features/concert/types/concert';

import {
  getPerformances,
} from '@/features/performance/api/performanceApi';
import type {
  Performance,
} from '@/features/performance/types/performance';

import {
  formatDate,
  formatTime,
} from '@/lib/date/formatDateTime';

interface UpcomingPerformance {
  concert: Concert;
  performance: Performance;
}

export default function HomePage() {
  const navigate =
      useNavigate();

  const [
    keyword,
    setKeyword,
  ] = useState('');

  const [
    concerts,
    setConcerts,
  ] = useState<Concert[]>([]);

  const [
    upcomingPerformances,
    setUpcomingPerformances,
  ] = useState<
      UpcomingPerformance[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

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

        /*
         * 현재 별도의 홈/다가오는 공연 API가 없으므로
         * 앞쪽 공연들의 회차를 조회해서 조합한다.
         */
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
                        /*
                         * 특정 공연의 회차 조회만 실패하면
                         * 홈 전체를 실패시키지 않는다.
                         */
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
                 }) => {
                  const startsAt =
                      new Date(
                          performance.startsAt,
                      ).getTime();

                  return (
                      Number.isFinite(
                          startsAt,
                      ) &&
                      startsAt > now
                  );
                },
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

  /*
   * 아직 실제 인기순 API가 없으므로
   * 공개 공연 목록 앞 6개를 노출한다.
   */
  const popularConcerts =
      useMemo(
          () =>
              concerts.slice(
                  0,
                  6,
              ),
          [concerts],
      );

  function handleSearch() {
    const normalized =
        keyword.trim();

    if (!normalized) {
      navigate(
          '/concerts',
      );

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
    if (
        event.key ===
        'Enter'
    ) {
      handleSearch();
    }
  }

  if (loading) {
    return (
        <HomeSkeleton />
    );
  }

  return (
      <div className="pb-8">
        {/* 상단 인트로 */}
        <section className="px-5 pt-6">
          <p className="text-sm font-medium text-slate-500">
            오늘 어떤 공연을 볼까요?
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            공연을 찾아보세요
          </h2>
        </section>

        {/* 검색 */}
        <section className="mt-6 px-5">
          <div className="flex h-12 items-center gap-3 rounded-xl bg-slate-100 px-4">
            <Search
                size={19}
                className="shrink-0 text-slate-400"
            />

            <input
                type="search"
                value={keyword}
                onChange={(
                    event,
                ) =>
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
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                    aria-label="검색어 지우기"
                >
                  <X
                      size={17}
                  />
                </button>
            )}
          </div>
        </section>

        {/* 에러 */}
        {errorMessage && (
            <section className="mt-6 px-5">
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            </section>
        )}

        {/* 인기 공연 */}
        <section className="mt-9">
          <div className="flex items-center justify-between px-5">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                인기 공연
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                지금 만나볼 수 있는 공연
              </p>
            </div>

            <button
                type="button"
                onClick={() =>
                    navigate(
                        '/concerts',
                    )
                }
                className="flex items-center gap-0.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
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

        {/* 곧 시작하는 공연 */}
        <section className="mt-9 px-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                곧 시작하는 공연
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                가까운 일정부터 확인해보세요
              </p>
            </div>

            <button
                type="button"
                onClick={() =>
                    navigate(
                        '/concerts',
                    )
                }
                className="flex items-center gap-0.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
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

                <p className="mt-3 text-sm font-medium text-slate-600">
                  예정된 공연이 없습니다.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  새로운 공연 일정이 등록되면 이곳에 표시됩니다.
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
                            className="group flex w-full gap-4 rounded-2xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/30"
                        >
                          {/* 포스터 */}
                          <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            <ConcertPoster
                                src={
                                  concert.posterUrl
                                }
                                alt={`${concert.title} 포스터`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                          </div>

                          {/* 공연 정보 */}
                          <div className="min-w-0 flex-1 py-1">
                            <div className="flex items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600">
                        {
                          concert.category
                        }
                      </span>

                              <span className="text-[11px] font-medium text-emerald-600">
                        {
                          getPerformanceStatusLabel(
                              performance.status,
                          )
                        }
                      </span>
                            </div>

                            <h4 className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-slate-900">
                              {
                                concert.title
                              }
                            </h4>

                            {concert.subtitle && (
                                <p className="mt-1 truncate text-xs text-slate-400">
                                  {
                                    concert.subtitle
                                  }
                                </p>
                            )}

                            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-600">
                              <CalendarDays
                                  size={15}
                                  className="shrink-0 text-slate-400"
                              />

                              <span>
                        {formatDate(
                            performance.startsAt,
                        )}
                      </span>
                            </div>

                            <div className="mt-1 flex items-center gap-2 pl-[23px]">
                      <span className="text-sm text-slate-500">
                        {formatTime(
                            performance.startsAt,
                        )}
                      </span>

                              <span className="text-xs text-slate-300">
                        ·
                      </span>

                              <span className="text-xs text-slate-400">
                        최대{' '}
                                {
                                  performance.maxTicketsPerMember
                                }
                                매
                      </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center">
                            <ChevronRight
                                size={19}
                                className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-400"
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

        {/* 인기 공연 */}
        <section className="mt-9 px-5">
          <div className="h-5 w-24 rounded bg-slate-200" />

          <div className="mt-4 flex gap-4 overflow-hidden">
            {Array.from({
              length: 3,
            }).map(
                (_, index) => (
                    <div
                        key={index}
                        className="w-40 shrink-0"
                    >
                      <div className="aspect-[3/4] rounded-xl bg-slate-200" />

                      <div className="mt-3 h-3 w-14 rounded bg-slate-200" />

                      <div className="mt-2 h-4 rounded bg-slate-200" />

                      <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
                    </div>
                ),
            )}
          </div>
        </section>

        {/* 곧 시작하는 공연 */}
        <section className="mt-9 px-5">
          <div className="h-5 w-32 rounded bg-slate-200" />

          <div className="mt-4 space-y-3">
            {Array.from({
              length: 3,
            }).map(
                (_, index) => (
                    <div
                        key={index}
                        className="flex gap-4 rounded-2xl border border-slate-100 p-3"
                    >
                      <div className="h-28 w-24 shrink-0 rounded-xl bg-slate-200" />

                      <div className="flex-1 py-2">
                        <div className="h-3 w-16 rounded bg-slate-200" />

                        <div className="mt-3 h-4 w-full rounded bg-slate-200" />

                        <div className="mt-2 h-4 w-3/4 rounded bg-slate-200" />

                        <div className="mt-4 h-3 w-28 rounded bg-slate-200" />

                        <div className="mt-2 h-3 w-20 rounded bg-slate-200" />
                      </div>
                    </div>
                ),
            )}
          </div>
        </section>
      </div>
  );
}

function getPerformanceStatusLabel(
    status: string,
): string {
  switch (status) {
    case 'OPEN':
      return '예매 가능';

    case 'SCHEDULED':
      return '예매 예정';

    case 'SOLD_OUT':
      return '매진';

    case 'COMPLETED':
      return '종료';

    case 'CANCELLED':
      return '취소';

    default:
      return status;
  }
}
