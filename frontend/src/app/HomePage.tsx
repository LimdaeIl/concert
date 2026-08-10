import type {
  KeyboardEvent,
} from 'react';

import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Search,
  Sparkles,
  Ticket,
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

import ConcertCard
  from '@/features/concert/components/ConcertCard';

import ConcertPoster
  from '@/features/concert/components/ConcertPoster';

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

const CATEGORY_LABELS:
    Record<string, string> = {
  CONCERT: '콘서트',
  MUSICAL: '뮤지컬',
  PLAY: '연극',
  CLASSIC: '클래식',
  DANCE: '무용',
  ETC: '기타',
};

export default function HomePage() {
  const navigate =
      useNavigate();

  const [
    keyword,
    setKeyword,
  ] =
      useState('');

  const [
    concerts,
    setConcerts,
  ] =
      useState<Concert[]>(
          [],
      );

  const [
    upcomingPerformances,
    setUpcomingPerformances,
  ] =
      useState<
          UpcomingPerformance[]
      >([]);

  const [
    loading,
    setLoading,
  ] =
      useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
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

        /*
         * 현재 홈 전용 공연 일정 API가 없으므로
         * 공개 공연 일부의 회차를 조회해서
         * 가까운 일정을 구성한다.
         */
        const results =
            await Promise.all(
                concertList
                .slice(
                    0,
                    8,
                )
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
                         * 개별 공연의 회차 조회 실패는
                         * 홈 전체 실패로 처리하지 않는다.
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
                      startsAt >
                      now
                  );
                },
            )
            .sort(
                (
                    a,
                    b,
                ) =>
                    new Date(
                        a.performance.startsAt,
                    ).getTime() -
                    new Date(
                        b.performance.startsAt,
                    ).getTime(),
            )
            .slice(
                0,
                5,
            );

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
          setLoading(
              false,
          );
        }
      }
    }

    void loadHome();

    return () => {
      active = false;
    };
  }, []);

  /*
   * 현재 추천/인기 랭킹 API는 없기 때문에
   * 공개 공연 순서를 그대로 이용한다.
   */
  const featuredConcert =
      concerts[0] ??
      null;

  const displayConcerts =
      useMemo(
          () =>
              concerts
              .filter(
                  (
                      concert,
                  ) =>
                      concert.concertId !==
                      featuredConcert
                          ?.concertId,
              )
              .slice(
                  0,
                  6,
              ),
          [
            concerts,
            featuredConcert,
          ],
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
      event:
      KeyboardEvent<HTMLInputElement>,
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
        <HomeSkeleton/>
    );
  }

  return (
      <div className="pb-10">
        {/*
         * =====================================================
         * Intro
         * =====================================================
         */}
        <section className="px-5 pt-6">
          <p className="text-sm font-medium text-slate-500">
            오늘 어떤 공연을 볼까요?
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            당신의 다음 공연을
            <br/>
            찾아보세요
          </h1>
        </section>

        {/*
         * =====================================================
         * Search
         * =====================================================
         */}
        <section className="mt-6 px-5">
          <div className="flex h-13 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">
            <Search
                size={19}
                className="shrink-0 text-slate-400"
            />

            <input
                type="search"
                value={
                  keyword
                }
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
                placeholder="공연 제목을 검색해보세요"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />

            {keyword && (
                <button
                    type="button"
                    onClick={() =>
                        setKeyword('')
                    }
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                    aria-label="검색어 지우기"
                >
                  <X
                      size={16}
                  />
                </button>
            )}

            <button
                type="button"
                onClick={
                  handleSearch
                }
                className="hidden h-8 items-center justify-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white sm:flex"
            >
              검색
            </button>
          </div>
        </section>

        {/*
         * =====================================================
         * Error
         * =====================================================
         */}
        {errorMessage && (
            <section className="mt-5 px-5">
              <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            </section>
        )}

        {/*
         * =====================================================
         * Featured Concert
         * =====================================================
         */}
        {featuredConcert && (
            <section className="mt-7 px-5">
              <button
                  type="button"
                  onClick={() =>
                      navigate(
                          `/concerts/${featuredConcert.concertId}`,
                      )
                  }
                  className="group relative block aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-slate-900 text-left shadow-sm"
              >
                {featuredConcert.posterUrl ? (
                    <>
                      <ConcertPoster
                          src={
                            featuredConcert.posterUrl
                          }
                          alt={`${featuredConcert.title} 포스터`}
                          className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />

                      {/*
                       * 포스터 위 텍스트 가독성 확보.
                       */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-slate-900/5"/>
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-500"/>
                )}

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                      <Sparkles
                          size={11}
                      />

                      추천 공연
                    </span>

                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur">
                      {
                          CATEGORY_LABELS[
                              featuredConcert.category
                              ] ??
                          featuredConcert.category
                      }
                    </span>
                  </div>

                  <h2 className="mt-3 line-clamp-2 max-w-[90%] text-xl font-black leading-7 text-white sm:text-2xl">
                    {
                      featuredConcert.title
                    }
                  </h2>

                  {featuredConcert.subtitle && (
                      <p className="mt-1.5 line-clamp-1 text-sm text-white/75">
                        {
                          featuredConcert.subtitle
                        }
                      </p>
                  )}

                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                    공연 보기

                    <ChevronRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </button>
            </section>
        )}

        {/*
         * =====================================================
         * Concerts
         * =====================================================
         */}
        <section className="mt-10">
          <div className="flex items-end justify-between px-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                지금 만나볼 공연
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                현재 공개 중인 공연을 둘러보세요
              </p>
            </div>

            <button
                type="button"
                onClick={() =>
                    navigate(
                        '/concerts',
                    )
                }
                className="flex shrink-0 items-center gap-0.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              전체보기

              <ChevronRight
                  size={16}
              />
            </button>
          </div>

          {concerts.length ===
          0 ? (
              <div className="px-5 py-10">
                <div className="rounded-2xl bg-slate-50 p-7 text-center">
                  <Ticket
                      size={26}
                      className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    현재 공개된 공연이 없습니다.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    새로운 공연이 공개되면 이곳에 표시됩니다.
                  </p>
                </div>
              </div>
          ) : (
              <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/*
                 * featured 제외 목록이 비어 있으면
                 * featured 자체도 카드 목록에 표시한다.
                 */}
                {(displayConcerts.length >
                    0
                        ? displayConcerts
                        : concerts
                ).map(
                    (
                        concert,
                    ) => (
                        <div
                            key={
                              concert.concertId
                            }
                            className="w-[158px] shrink-0 snap-start sm:w-[174px]"
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

        {/*
         * =====================================================
         * Upcoming Performances
         * =====================================================
         */}
        <section className="mt-10 px-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                곧 시작하는 공연
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                가장 가까운 공연 일정부터 확인해보세요
              </p>
            </div>

            <button
                type="button"
                onClick={() =>
                    navigate(
                        '/concerts',
                    )
                }
                className="flex shrink-0 items-center gap-0.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              전체보기

              <ChevronRight
                  size={16}
              />
            </button>
          </div>

          {upcomingPerformances.length ===
          0 ? (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-7 text-center">
                <CalendarDays
                    size={27}
                    className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  예정된 공연이 없습니다.
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  새로운 공연 일정이 등록되면
                  <br/>
                  이곳에서 가장 먼저 확인할 수 있습니다.
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
                            className="group flex w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-200 hover:shadow-sm"
                        >
                          {/*
                           * Poster
                           */}
                          <div className="h-[118px] w-[86px] shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            <ConcertPoster
                                src={
                                  concert.posterUrl
                                }
                                alt={`${concert.title} 포스터`}
                                className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          </div>

                          {/*
                           * Information
                           */}
                          <div className="min-w-0 flex-1 py-0.5 pl-4">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">
                                {
                                    CATEGORY_LABELS[
                                        concert.category
                                        ] ??
                                    concert.category
                                }
                              </span>

                              <span
                                  className={[
                                    'truncate text-[10px] font-bold',
                                    getPerformanceStatusClass(
                                        performance.status,
                                    ),
                                  ].join(
                                      ' ',
                                  )}
                              >
                                {
                                  getPerformanceStatusLabel(
                                      performance.status,
                                  )
                                }
                              </span>
                            </div>

                            <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-5 text-slate-900">
                              {
                                concert.title
                              }
                            </h3>

                            {concert.subtitle && (
                                <p className="mt-1 truncate text-[11px] text-slate-400">
                                  {
                                    concert.subtitle
                                  }
                                </p>
                            )}

                            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
                              <CalendarDays
                                  size={14}
                                  className="shrink-0 text-slate-400"
                              />

                              <span>
                                {formatDate(
                                    performance.startsAt,
                                )}
                              </span>
                            </div>

                            <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                              <Clock3
                                  size={14}
                                  className="shrink-0 text-slate-400"
                              />

                              <span>
                                {formatTime(
                                    performance.startsAt,
                                )}
                              </span>

                              <span className="text-slate-300">
                                ·
                              </span>

                              <span className="truncate">
                                최대{' '}
                                {
                                  performance.maxTicketsPerMember
                                }
                                매
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center pl-1">
                            <ChevronRight
                                size={18}
                                className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-400"
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

/*
 * ============================================================
 * Loading Skeleton
 * ============================================================
 */

function HomeSkeleton() {
  return (
      <div className="animate-pulse pb-10">
        <section className="px-5 pt-6">
          <div className="h-4 w-36 rounded bg-slate-200"/>

          <div className="mt-3 h-7 w-52 rounded bg-slate-200"/>

          <div className="mt-2 h-7 w-40 rounded bg-slate-200"/>

          <div className="mt-6 h-13 rounded-2xl bg-slate-200"/>
        </section>

        <section className="mt-7 px-5">
          <div className="aspect-[16/10] rounded-[24px] bg-slate-200"/>
        </section>

        <section className="mt-10 px-5">
          <div className="h-5 w-32 rounded bg-slate-200"/>

          <div className="mt-2 h-3 w-44 rounded bg-slate-100"/>

          <div className="mt-4 flex gap-4 overflow-hidden">
            {Array.from({
              length: 3,
            }).map(
                (
                    _,
                    index,
                ) => (
                    <div
                        key={
                          index
                        }
                        className="w-[158px] shrink-0"
                    >
                      <div className="aspect-[3/4] rounded-xl bg-slate-200"/>

                      <div className="mt-3 h-3 w-14 rounded bg-slate-200"/>

                      <div className="mt-2 h-4 rounded bg-slate-200"/>

                      <div className="mt-2 h-3 w-2/3 rounded bg-slate-100"/>
                    </div>
                ),
            )}
          </div>
        </section>

        <section className="mt-10 px-5">
          <div className="h-5 w-32 rounded bg-slate-200"/>

          <div className="mt-2 h-3 w-48 rounded bg-slate-100"/>

          <div className="mt-4 space-y-3">
            {Array.from({
              length: 3,
            }).map(
                (
                    _,
                    index,
                ) => (
                    <div
                        key={
                          index
                        }
                        className="flex gap-4 rounded-2xl border border-slate-100 p-3"
                    >
                      <div className="h-[118px] w-[86px] shrink-0 rounded-xl bg-slate-200"/>

                      <div className="flex-1 py-2">
                        <div className="h-3 w-16 rounded bg-slate-200"/>

                        <div className="mt-3 h-4 w-full rounded bg-slate-200"/>

                        <div className="mt-2 h-4 w-3/4 rounded bg-slate-200"/>

                        <div className="mt-4 h-3 w-28 rounded bg-slate-100"/>

                        <div className="mt-2 h-3 w-20 rounded bg-slate-100"/>
                      </div>
                    </div>
                ),
            )}
          </div>
        </section>
      </div>
  );
}

/*
 * ============================================================
 * Helpers
 * ============================================================
 */

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

function getPerformanceStatusClass(
    status: string,
): string {
  switch (status) {
    case 'OPEN':
      return 'text-emerald-600';

    case 'SCHEDULED':
      return 'text-indigo-500';

    case 'SOLD_OUT':
      return 'text-red-500';

    case 'COMPLETED':
      return 'text-slate-400';

    case 'CANCELLED':
      return 'text-red-400';

    default:
      return 'text-slate-500';
  }
}
