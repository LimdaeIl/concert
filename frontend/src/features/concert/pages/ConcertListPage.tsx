import {Search, SlidersHorizontal, X,} from 'lucide-react';
import type {KeyboardEvent} from 'react';
import {useEffect, useMemo, useState,} from 'react';
import {useNavigate, useSearchParams,} from 'react-router-dom';

import {getApiErrorMessage} from '@/lib/api/getApiErrorMessage';

import {getConcerts} from '../api/concertApi';
import ConcertCard from '../components/ConcertCard';
import type {Concert} from '../types/concert';

const CATEGORY_ALL = 'ALL';

export default function ConcertListPage() {
  const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const queryFromUrl =
      searchParams.get('q') ?? '';

  const categoryFromUrl =
      searchParams.get('category') ??
      CATEGORY_ALL;

  const [concerts, setConcerts] =
      useState<Concert[]>([]);

  const [keyword, setKeyword] =
      useState(queryFromUrl);

  const [loading, setLoading] =
      useState(true);

  const [errorMessage, setErrorMessage] =
      useState('');

  useEffect(() => {
    let active = true;

    async function loadConcerts() {
      try {
        const response =
            await getConcerts();

        if (!active) {
          return;
        }

        setConcerts(
            response.concerts ?? [],
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(
            getApiErrorMessage(
                error,
                '공연 목록을 불러오지 못했습니다.',
            ),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadConcerts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setKeyword(queryFromUrl);
  }, [queryFromUrl]);

  const categories = useMemo(() => {
    const values =
        concerts
        .map(
            (concert) =>
                concert.category,
        )
        .filter(Boolean);

    return [
      CATEGORY_ALL,
      ...Array.from(
          new Set(values),
      ),
    ];
  }, [concerts]);

  const filteredConcerts =
      useMemo(() => {
        const normalizedKeyword =
            queryFromUrl
            .trim()
            .toLowerCase();

        return concerts.filter(
            (concert) => {
              const matchesKeyword =
                  !normalizedKeyword ||
                  [
                    concert.title,
                    concert.subtitle,
                    concert.description,
                    concert.category,
                  ].some((value) =>
                      value
                      ?.toLowerCase()
                      .includes(
                          normalizedKeyword,
                      ),
                  );

              const matchesCategory =
                  categoryFromUrl ===
                  CATEGORY_ALL ||
                  concert.category ===
                  categoryFromUrl;

              return (
                  matchesKeyword &&
                  matchesCategory
              );
            },
        );
      }, [
        concerts,
        queryFromUrl,
        categoryFromUrl,
      ]);

  function updateSearchParams(
      options: {
        q?: string;
        category?: string;
      },
  ) {
    const next =
        new URLSearchParams(
            searchParams,
        );

    if (
        options.q !== undefined
    ) {
      const q =
          options.q.trim();

      if (q) {
        next.set('q', q);
      } else {
        next.delete('q');
      }
    }

    if (
        options.category !==
        undefined
    ) {
      if (
          options.category ===
          CATEGORY_ALL
      ) {
        next.delete(
            'category',
        );
      } else {
        next.set(
            'category',
            options.category,
        );
      }
    }

    setSearchParams(
        next,
        {
          replace: true,
        },
    );
  }

  function handleSearchSubmit() {
    updateSearchParams({
      q: keyword,
    });
  }

  function handleKeyDown(
      event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  }

  function handleClearKeyword() {
    setKeyword('');

    updateSearchParams({
      q: '',
    });
  }

  return (
      <div className="pb-8">
        <section className="px-5 pt-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            공연
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            원하는 공연을 찾아보세요.
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
                    setKeyword(
                        event.target.value,
                    )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="공연명, 설명, 카테고리 검색"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />

            {keyword && (
                <button
                    type="button"
                    onClick={
                      handleClearKeyword
                    }
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    aria-label="검색어 지우기"
                >
                  <X size={17}/>
                </button>
            )}
          </div>
        </section>

        <section className="mt-5 px-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map(
                (category) => {
                  const active =
                      categoryFromUrl ===
                      category;

                  return (
                      <button
                          key={category}
                          type="button"
                          onClick={() =>
                              updateSearchParams({
                                category,
                              })
                          }
                          className={[
                            'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                            active
                                ? 'bg-slate-950 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                          ].join(' ')}
                      >
                        {category ===
                        CATEGORY_ALL
                            ? '전체'
                            : category}
                      </button>
                  );
                },
            )}
          </div>
        </section>

        {!loading &&
            !errorMessage && (
                <section className="mt-6 px-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      총{' '}
                      <strong className="text-slate-900">
                        {
                          filteredConcerts.length
                        }
                      </strong>
                      개의 공연
                    </p>

                    {(queryFromUrl ||
                        categoryFromUrl !==
                        CATEGORY_ALL) && (
                        <button
                            type="button"
                            onClick={() => {
                              setKeyword('');

                              setSearchParams(
                                  {},
                                  {
                                    replace: true,
                                  },
                              );
                            }}
                            className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700"
                        >
                          <SlidersHorizontal
                              size={14}
                          />

                          필터 초기화
                        </button>
                    )}
                  </div>
                </section>
            )}

        {loading && (
            <ConcertListSkeleton/>
        )}

        {!loading &&
            errorMessage && (
                <section className="px-5 py-8">
                  <div className="rounded-2xl bg-red-50 p-5">
                    <p className="text-sm text-red-700">
                      {errorMessage}
                    </p>
                  </div>
                </section>
            )}

        {!loading &&
            !errorMessage &&
            filteredConcerts.length ===
            0 && (
                <EmptySearchResult
                    keyword={
                      queryFromUrl
                    }
                    onReset={() => {
                      setKeyword('');

                      setSearchParams(
                          {},
                          {
                            replace: true,
                          },
                      );
                    }}
                />
            )}

        {!loading &&
            !errorMessage &&
            filteredConcerts.length >
            0 && (
                <section className="mt-4 px-5">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3">
                    {filteredConcerts.map(
                        (concert) => (
                            <ConcertCard
                                key={
                                  concert.concertId
                                }
                                concert={
                                  concert
                                }
                                onClick={() =>
                                    navigate(
                                        `/concerts/${concert.concertId}`,
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

function ConcertListSkeleton() {
  return (
      <section className="mt-6 px-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
              <div
                  key={index}
                  className="animate-pulse"
              >
                <div className="aspect-[3/4] rounded-xl bg-slate-200"/>

                <div className="mt-3 h-3 w-16 rounded bg-slate-200"/>

                <div className="mt-2 h-4 w-full rounded bg-slate-200"/>

                <div className="mt-2 h-3 w-2/3 rounded bg-slate-200"/>
              </div>
          ))}
        </div>
      </section>
  );
}

interface EmptySearchResultProps {
  keyword: string;
  onReset: () => void;
}

function EmptySearchResult({
                             keyword,
                             onReset,
                           }: EmptySearchResultProps) {
  return (
      <section className="flex min-h-[400px] flex-col items-center justify-center px-5 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-slate-100">
          <Search
              size={27}
              className="text-slate-400"
          />
        </div>

        <p className="mt-5 text-base font-semibold text-slate-700">
          검색 결과가 없습니다.
        </p>

        {keyword && (
            <p className="mt-2 text-sm text-slate-400">
              &ldquo;{keyword}&rdquo;에
              해당하는 공연을 찾지
              못했습니다.
            </p>
        )}

        <button
            type="button"
            onClick={onReset}
            className="mt-6 h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white"
        >
          전체 공연 보기
        </button>
      </section>
  );
}
