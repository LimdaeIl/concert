import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileMusic,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  getAdminConcerts,
  updateConcertStatus,
} from '../api/adminConcertApi';

import CreateConcertModal
  from '../components/CreateConcertModal';

import UpdateConcertModal
  from '../components/UpdateConcertModal';

import type {
  AdminConcert,
  ConcertCategory,
  ConcertStatus,
  GetAdminConcertsResponse,
} from '../types/adminConcert';

const PAGE_SIZE = 20;
const PAGE_WINDOW_SIZE = 5;

const CATEGORY_LABELS:
    Record<
        ConcertCategory,
        string
    > = {
  CONCERT: '콘서트',
  MUSICAL: '뮤지컬',
  PLAY: '연극',
  CLASSIC: '클래식',
  DANCE: '무용',
  ETC: '기타',
};

const STATUS_LABELS:
    Record<
        ConcertStatus,
        string
    > = {
  DRAFT: '작성중',
  PUBLISHED: '공개',
  CLOSED: '종료',
  CANCELLED: '취소',
};

const STATUS_STYLES:
    Record<
        ConcertStatus,
        string
    > = {
  DRAFT:
      'border-amber-200 bg-amber-50 text-amber-700',

  PUBLISHED:
      'border-emerald-200 bg-emerald-50 text-emerald-700',

  CLOSED:
      'border-slate-200 bg-slate-100 text-slate-600',

  CANCELLED:
      'border-red-200 bg-red-50 text-red-600',
};

function getAvailableStatuses(
    status: ConcertStatus,
): ConcertStatus[] {
  switch (status) {
    case 'DRAFT':
      return [
        'PUBLISHED',
        'CANCELLED',
      ];

    case 'PUBLISHED':
      return [
        'CLOSED',
        'CANCELLED',
      ];

    case 'CLOSED':
    case 'CANCELLED':
      return [];
  }
}

function getStatusActionLabel(
    status: ConcertStatus,
) {
  switch (status) {
    case 'PUBLISHED':
      return '공개';

    case 'CLOSED':
      return '종료';

    case 'CANCELLED':
      return '취소';

    case 'DRAFT':
      return '작성중';
  }
}

function getStatusActionClass(
    status: ConcertStatus,
) {
  if (
      status ===
      'CANCELLED'
  ) {
    return [
      'border-red-200',
      'bg-red-50',
      'text-red-600',
      'hover:bg-red-100',
    ].join(' ');
  }

  return [
    'border-emerald-200',
    'bg-emerald-50',
    'text-emerald-700',
    'hover:bg-emerald-100',
  ].join(' ');
}

export default function AdminConcertPage() {
  const navigate =
      useNavigate();

  const [
    data,
    setData,
  ] =
      useState<GetAdminConcertsResponse | null>(
          null,
      );

  const [
    page,
    setPage,
  ] = useState(0);

  /*
   * 실제 입력값과
   * 서버에 적용된 검색어를 분리한다.
   */
  const [
    keywordInput,
    setKeywordInput,
  ] = useState('');

  const [
    keyword,
    setKeyword,
  ] = useState('');

  const [
    category,
    setCategory,
  ] =
      useState<
          ConcertCategory | ''
      >('');

  const [
    status,
    setStatus,
  ] =
      useState<
          ConcertStatus | ''
      >('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    editingConcert,
    setEditingConcert,
  ] =
      useState<AdminConcert | null>(
          null,
      );

  const [
    changingStatusId,
    setChangingStatusId,
  ] =
      useState<number | null>(
          null,
      );

  const loadConcerts =
      useCallback(
          async (
              targetPage: number,
          ) => {
            setLoading(true);
            setErrorMessage('');

            try {
              const response =
                  await getAdminConcerts({
                    page:
                    targetPage,

                    size:
                    PAGE_SIZE,

                    keyword:
                        keyword ||
                        undefined,

                    category:
                        category ||
                        undefined,

                    status:
                        status ||
                        undefined,
                  });

              setData(response);
            } catch (error) {
              setErrorMessage(
                  getApiErrorMessage(
                      error,
                      '공연 목록을 불러오지 못했습니다.',
                  ),
              );
            } finally {
              setLoading(false);
            }
          },
          [
            keyword,
            category,
            status,
          ],
      );

  useEffect(() => {
    void loadConcerts(
        page,
    );
  }, [
    loadConcerts,
    page,
  ]);

  function handleSearch() {
    const normalized =
        keywordInput.trim();

    setSuccessMessage('');

    if (
        page === 0 &&
        keyword === normalized
    ) {
      /*
       * 동일한 조건을 다시 검색했을 경우에도
       * 명시적으로 재조회한다.
       */
      void loadConcerts(0);

      return;
    }

    setPage(0);
    setKeyword(
        normalized,
    );
  }

  function handleSearchKeyDown(
      event:
      KeyboardEvent<HTMLInputElement>,
  ) {
    if (
        event.key === 'Enter'
    ) {
      handleSearch();
    }
  }

  function handleResetFilters() {
    setKeywordInput('');
    setKeyword('');
    setCategory('');
    setStatus('');
    setPage(0);
    setErrorMessage('');
    setSuccessMessage('');
  }

  async function handleCreated() {
    setCreateOpen(false);

    setSuccessMessage(
        '공연이 등록되었습니다.',
    );

    if (page !== 0) {
      setPage(0);

      return;
    }

    await loadConcerts(0);
  }

  async function handleUpdated() {
    setEditingConcert(null);

    setSuccessMessage(
        '공연 정보가 수정되었습니다.',
    );

    await loadConcerts(
        page,
    );
  }

  async function handleStatusChange(
      concert: AdminConcert,
      nextStatus: ConcertStatus,
  ) {
    const nextLabel =
        STATUS_LABELS[
            nextStatus
            ];

    const confirmed =
        window.confirm(
            `"${concert.title}" 공연을 '${nextLabel}' 상태로 변경하시겠습니까?`,
        );

    if (!confirmed) {
      return;
    }

    setChangingStatusId(
        concert.concertId,
    );

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await updateConcertStatus(
          concert.concertId,
          {
            status:
            nextStatus,
          },
      );

      setSuccessMessage(
          `공연 상태가 '${nextLabel}'(으)로 변경되었습니다.`,
      );

      await loadConcerts(
          page,
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '공연 상태 변경에 실패했습니다.',
          ),
      );
    } finally {
      setChangingStatusId(
          null,
      );
    }
  }

  const concerts =
      data?.concerts ??
      [];

  const activeFilterCount =
      [
        keyword,
        category,
        status,
      ].filter(Boolean).length;

  const pageNumbers =
      useMemo(() => {
        const totalPages =
            data?.totalPages ??
            0;

        if (
            totalPages === 0
        ) {
          return [];
        }

        const start =
            Math.floor(
                page /
                PAGE_WINDOW_SIZE,
            ) *
            PAGE_WINDOW_SIZE;

        const end =
            Math.min(
                start +
                PAGE_WINDOW_SIZE,
                totalPages,
            );

        return Array.from(
            {
              length:
                  end -
                  start,
            },
            (_, index) =>
                start +
                index,
        );
      }, [
        data?.totalPages,
        page,
      ]);

  return (
      <>
        <div className="mx-auto w-full min-w-0 max-w-[1600px]">
          {/*
         * =====================================================
         * Page Header
         * =====================================================
         */}
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                Concert Management
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                공연 관리
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                공연의 기본 정보와 공개 상태를
                관리하고, 공연별 회차를 구성합니다.
              </p>
            </div>

            <button
                type="button"
                onClick={() => {
                  setSuccessMessage('');
                  setCreateOpen(true);
                }}
                className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 sm:w-auto"
            >
              <Plus size={18} />

              공연 등록
            </button>
          </header>

          {/*
         * =====================================================
         * Feedback
         * =====================================================
         */}
          {successMessage && (
              <div
                  role="status"
                  className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700"
              >
                <span className="mt-0.5 size-2 shrink-0 rounded-full bg-emerald-500" />

                <span className="min-w-0">
              {successMessage}
            </span>
              </div>
          )}

          {errorMessage && (
              <div
                  role="alert"
                  className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
              >
                <CircleAlert
                    size={17}
                    className="mt-0.5 shrink-0"
                />

                <span className="min-w-0">
              {errorMessage}
            </span>
              </div>
          )}

          {/*
         * =====================================================
         * Search / Filter
         * =====================================================
         */}
          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal
                      size={17}
                      className="text-slate-400"
                  />

                  <h2 className="text-sm font-bold text-slate-800">
                    검색 및 필터
                  </h2>

                  {activeFilterCount >
                      0 && (
                          <span className="flex size-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                    {
                      activeFilterCount
                    }
                  </span>
                      )}
                </div>

                {activeFilterCount >
                    0 && (
                        <button
                            type="button"
                            onClick={
                              handleResetFilters
                            }
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                        >
                          <RotateCcw
                              size={14}
                          />

                          초기화
                        </button>
                    )}
              </div>

              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_180px_160px_auto_auto] xl:items-end">
                <div className="min-w-0 sm:col-span-2 xl:col-span-1">
                  <label
                      htmlFor="admin-concert-search"
                      className="text-xs font-semibold text-slate-500"
                  >
                    검색어
                  </label>

                  <div className="relative mt-2">
                    <Search
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        id="admin-concert-search"
                        type="search"
                        value={
                          keywordInput
                        }
                        onChange={(event) =>
                            setKeywordInput(
                                event.target.value,
                            )
                        }
                        onKeyDown={
                          handleSearchKeyDown
                        }
                        placeholder="공연 제목 또는 부제"
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <label
                      htmlFor="admin-concert-category"
                      className="text-xs font-semibold text-slate-500"
                  >
                    카테고리
                  </label>

                  <select
                      id="admin-concert-category"
                      value={category}
                      onChange={(event) => {
                        setPage(0);

                        setCategory(
                            event.target
                                .value as
                                | ConcertCategory
                                | '',
                        );
                      }}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="">
                      전체 카테고리
                    </option>

                    <option value="CONCERT">
                      콘서트
                    </option>

                    <option value="MUSICAL">
                      뮤지컬
                    </option>

                    <option value="PLAY">
                      연극
                    </option>

                    <option value="CLASSIC">
                      클래식
                    </option>

                    <option value="DANCE">
                      무용
                    </option>

                    <option value="ETC">
                      기타
                    </option>
                  </select>
                </div>

                <div className="min-w-0">
                  <label
                      htmlFor="admin-concert-status"
                      className="text-xs font-semibold text-slate-500"
                  >
                    공연 상태
                  </label>

                  <select
                      id="admin-concert-status"
                      value={status}
                      onChange={(event) => {
                        setPage(0);

                        setStatus(
                            event.target
                                .value as
                                | ConcertStatus
                                | '',
                        );
                      }}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="">
                      전체 상태
                    </option>

                    <option value="DRAFT">
                      작성중
                    </option>

                    <option value="PUBLISHED">
                      공개
                    </option>

                    <option value="CLOSED">
                      종료
                    </option>

                    <option value="CANCELLED">
                      취소
                    </option>
                  </select>
                </div>

                <button
                    type="button"
                    onClick={
                      handleSearch
                    }
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                >
                  <Search size={16} />

                  검색
                </button>

                <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                        void loadConcerts(
                            page,
                        )
                    }
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <RefreshCw
                      size={16}
                      className={
                        loading
                            ? 'animate-spin'
                            : ''
                      }
                  />

                  새로고침
                </button>
              </div>
            </div>

            {/*
           * =====================================================
           * Result Header
           * =====================================================
           */}
            <div className="flex min-h-14 items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/60 px-4 sm:px-5">
              <p className="text-sm text-slate-500">
                {loading ? (
                    '공연 정보를 조회하고 있습니다.'
                ) : (
                    <>
                      총{' '}
                      <strong className="font-bold text-slate-900">
                        {(
                            data?.totalElements ??
                            0
                        ).toLocaleString()}
                      </strong>
                      개의 공연
                    </>
                )}
              </p>

              {data &&
                  data.totalPages >
                  0 && (
                      <p className="shrink-0 text-xs text-slate-400">
                        {data.page + 1} /{' '}
                        {data.totalPages}
                        페이지
                      </p>
                  )}
            </div>

            {/*
           * =====================================================
           * Mobile / Narrow Layout
           *
           * md 미만에서는 테이블을 억지로 압축하지 않고
           * 관리 카드로 전환한다.
           * =====================================================
           */}
            <div className="md:hidden">
              {loading ? (
                  <LoadingState />
              ) : concerts.length ===
              0 ? (
                  <EmptyState
                      filtered={
                          activeFilterCount >
                          0
                      }
                      onReset={
                        handleResetFilters
                      }
                  />
              ) : (
                  <div className="divide-y divide-slate-100">
                    {concerts.map(
                        (concert) => (
                            <ConcertMobileCard
                                key={
                                  concert.concertId
                                }
                                concert={concert}
                                changingStatus={
                                    changingStatusId ===
                                    concert.concertId
                                }
                                onPerformances={() =>
                                    navigate(
                                        `/admin/concerts/${concert.concertId}/performances`,
                                    )
                                }
                                onEdit={() =>
                                    setEditingConcert(
                                        concert,
                                    )
                                }
                                onStatusChange={(
                                    nextStatus,
                                ) =>
                                    void handleStatusChange(
                                        concert,
                                        nextStatus,
                                    )
                                }
                            />
                        ),
                    )}
                  </div>
              )}
            </div>

            {/*
           * =====================================================
           * Desktop Table
           * =====================================================
           */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">
                    공연
                  </th>

                  <th className="w-36 px-5 py-3.5 text-xs font-semibold text-slate-500">
                    카테고리
                  </th>

                  <th className="w-32 px-5 py-3.5 text-xs font-semibold text-slate-500">
                    공연시간
                  </th>

                  <th className="w-28 px-5 py-3.5 text-xs font-semibold text-slate-500">
                    상태
                  </th>

                  <th className="w-[390px] px-5 py-3.5 text-right text-xs font-semibold text-slate-500">
                    관리
                  </th>
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    <tr>
                      <td
                          colSpan={5}
                          className="p-0"
                      >
                        <LoadingState />
                      </td>
                    </tr>
                ) : concerts.length ===
                0 ? (
                    <tr>
                      <td
                          colSpan={5}
                          className="p-0"
                      >
                        <EmptyState
                            filtered={
                                activeFilterCount >
                                0
                            }
                            onReset={
                              handleResetFilters
                            }
                        />
                      </td>
                    </tr>
                ) : (
                    concerts.map(
                        (concert) => {
                          const availableStatuses =
                              getAvailableStatuses(
                                  concert.status,
                              );

                          const editable =
                              concert.status !==
                              'CLOSED' &&
                              concert.status !==
                              'CANCELLED';

                          const changing =
                              changingStatusId ===
                              concert.concertId;

                          return (
                              <tr
                                  key={
                                    concert.concertId
                                  }
                                  className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70"
                              >
                                <td className="px-5 py-4">
                                  <ConcertIdentity
                                      concert={
                                        concert
                                      }
                                  />
                                </td>

                                <td className="px-5 py-4">
                            <span className="text-sm font-medium text-slate-600">
                              {
                                CATEGORY_LABELS[
                                    concert
                                        .category
                                    ]
                              }
                            </span>
                                </td>

                                <td className="px-5 py-4">
                            <span className="text-sm text-slate-600">
                              {concert.runningTime
                                  ? `${concert.runningTime}분`
                                  : '-'}
                            </span>
                                </td>

                                <td className="px-5 py-4">
                                  <StatusBadge
                                      status={
                                        concert.status
                                      }
                                  />
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex flex-wrap justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/admin/concerts/${concert.concertId}/performances`,
                                            )
                                        }
                                        className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-indigo-100 bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-100"
                                    >
                                      <CalendarDays
                                          size={14}
                                      />

                                      회차 관리
                                    </button>

                                    {editable && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingConcert(
                                                    concert,
                                                )
                                            }
                                            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                        >
                                          <Pencil
                                              size={14}
                                          />

                                          수정
                                        </button>
                                    )}

                                    {availableStatuses.map(
                                        (
                                            nextStatus,
                                        ) => (
                                            <button
                                                key={
                                                  nextStatus
                                                }
                                                type="button"
                                                disabled={
                                                  changing
                                                }
                                                onClick={() =>
                                                    void handleStatusChange(
                                                        concert,
                                                        nextStatus,
                                                    )
                                                }
                                                className={[
                                                  'h-9 whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
                                                  getStatusActionClass(
                                                      nextStatus,
                                                  ),
                                                ].join(
                                                    ' ',
                                                )}
                                            >
                                              {changing
                                                  ? '처리 중'
                                                  : getStatusActionLabel(
                                                      nextStatus,
                                                  )}
                                            </button>
                                        ),
                                    )}
                                  </div>
                                </td>
                              </tr>
                          );
                        },
                    )
                )}
                </tbody>
              </table>
            </div>

            {/*
           * =====================================================
           * Pagination
           * =====================================================
           */}
            {data && (
                <footer className="flex flex-col gap-4 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="text-sm text-slate-500">
                    <strong className="font-semibold text-slate-800">
                      {data.totalElements.toLocaleString()}
                    </strong>
                    개 중{' '}
                    {data.totalElements >
                    0
                        ? `${
                            data.page *
                            data.size +
                            1
                        }-${Math.min(
                            (data.page +
                                1) *
                            data.size,
                            data.totalElements,
                        )}`
                        : '0'}
                    개 표시
                  </p>

                  {data.totalPages >
                      0 && (
                          <div className="flex max-w-full items-center justify-center gap-1 overflow-x-auto pb-1 sm:justify-end">
                            <button
                                type="button"
                                aria-label="이전 페이지"
                                disabled={
                                    data.first ||
                                    loading
                                }
                                onClick={() =>
                                    setPage(
                                        Math.max(
                                            0,
                                            page - 1,
                                        ),
                                    )
                                }
                                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ChevronLeft
                                  size={17}
                              />
                            </button>

                            {pageNumbers.map(
                                (
                                    pageNumber,
                                ) => (
                                    <button
                                        key={
                                          pageNumber
                                        }
                                        type="button"
                                        disabled={
                                          loading
                                        }
                                        aria-current={
                                          page ===
                                          pageNumber
                                              ? 'page'
                                              : undefined
                                        }
                                        onClick={() =>
                                            setPage(
                                                pageNumber,
                                            )
                                        }
                                        className={[
                                          'size-9 shrink-0 rounded-lg text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
                                          page ===
                                          pageNumber
                                              ? 'bg-indigo-600 text-white shadow-sm'
                                              : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
                                        ].join(
                                            ' ',
                                        )}
                                    >
                                      {pageNumber +
                                          1}
                                    </button>
                                ),
                            )}

                            <button
                                type="button"
                                aria-label="다음 페이지"
                                disabled={
                                    data.last ||
                                    loading
                                }
                                onClick={() =>
                                    setPage(
                                        page + 1,
                                    )
                                }
                                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ChevronRight
                                  size={17}
                              />
                            </button>
                          </div>
                      )}
                </footer>
            )}
          </section>
        </div>

        {createOpen && (
            <CreateConcertModal
                onClose={() =>
                    setCreateOpen(
                        false,
                    )
                }
                onCreated={() =>
                    void handleCreated()
                }
            />
        )}

        {editingConcert && (
            <UpdateConcertModal
                concert={
                  editingConcert
                }
                onClose={() =>
                    setEditingConcert(
                        null,
                    )
                }
                onUpdated={() =>
                    void handleUpdated()
                }
            />
        )}
      </>
  );
}

interface ConcertIdentityProps {
  concert: AdminConcert;
}

function ConcertIdentity({
                           concert,
                         }: ConcertIdentityProps) {
  return (
      <div className="flex min-w-0 items-center gap-4">
        {concert.posterUrl ? (
            <img
                src={
                  concert.posterUrl
                }
                alt={`${concert.title} 포스터`}
                className="h-16 w-12 shrink-0 rounded-lg border border-slate-200 object-cover bg-slate-100"
            />
        ) : (
            <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-400">
              <FileMusic
                  size={19}
              />
            </div>
        )}

        <div className="min-w-0">
          <p className="max-w-80 truncate text-sm font-bold text-slate-900">
            {concert.title}
          </p>

          {concert.subtitle ? (
              <p className="mt-1 max-w-80 truncate text-xs text-slate-500">
                {concert.subtitle}
              </p>
          ) : (
              <p className="mt-1 text-xs text-slate-400">
                부제 없음
              </p>
          )}

          <p className="mt-1 text-[11px] text-slate-400">
            ID #{concert.concertId}
          </p>
        </div>
      </div>
  );
}

interface StatusBadgeProps {
  status: ConcertStatus;
}

function StatusBadge({
                       status,
                     }: StatusBadgeProps) {
  return (
      <span
          className={[
            'inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold',
            STATUS_STYLES[
                status
                ],
          ].join(' ')}
      >
      {
        STATUS_LABELS[
            status
            ]
      }
    </span>
  );
}

interface ConcertMobileCardProps {
  concert: AdminConcert;
  changingStatus: boolean;

  onPerformances: () => void;
  onEdit: () => void;

  onStatusChange: (
      status: ConcertStatus,
  ) => void;
}

function ConcertMobileCard({
                             concert,
                             changingStatus,
                             onPerformances,
                             onEdit,
                             onStatusChange,
                           }: ConcertMobileCardProps) {
  const availableStatuses =
      getAvailableStatuses(
          concert.status,
      );

  const editable =
      concert.status !==
      'CLOSED' &&
      concert.status !==
      'CANCELLED';

  return (
      <article className="p-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-4">
          <ConcertIdentity
              concert={concert}
          />

          <div className="ml-auto shrink-0">
            <StatusBadge
                status={
                  concert.status
                }
            />
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4">
          <div>
            <dt className="text-[11px] font-semibold text-slate-400">
              카테고리
            </dt>

            <dd className="mt-1 text-sm font-semibold text-slate-700">
              {
                CATEGORY_LABELS[
                    concert.category
                    ]
              }
            </dd>
          </div>

          <div>
            <dt className="text-[11px] font-semibold text-slate-400">
              공연 시간
            </dt>

            <dd className="mt-1 text-sm font-semibold text-slate-700">
              {concert.runningTime
                  ? `${concert.runningTime}분`
                  : '-'}
            </dd>
          </div>
        </dl>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
              type="button"
              onClick={
                onPerformances
              }
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            <CalendarDays
                size={14}
            />

            회차 관리
          </button>

          {editable ? (
              <button
                  type="button"
                  onClick={onEdit}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil
                    size={14}
                />

                정보 수정
              </button>
          ) : (
              <div className="flex h-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-medium text-slate-400">
                수정 불가
              </div>
          )}
        </div>

        {availableStatuses.length >
            0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableStatuses.map(
                      (
                          nextStatus,
                      ) => (
                          <button
                              key={
                                nextStatus
                              }
                              type="button"
                              disabled={
                                changingStatus
                              }
                              onClick={() =>
                                  onStatusChange(
                                      nextStatus,
                                  )
                              }
                              className={[
                                'h-9 flex-1 whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition disabled:opacity-50',
                                getStatusActionClass(
                                    nextStatus,
                                ),
                              ].join(
                                  ' ',
                              )}
                          >
                            {changingStatus
                                ? '처리 중...'
                                : getStatusActionLabel(
                                    nextStatus,
                                )}
                          </button>
                      ),
                  )}
                </div>
            )}
      </article>
  );
}

function LoadingState() {
  return (
      <div className="flex min-h-56 flex-col items-center justify-center px-5 py-12 text-center">
        <RefreshCw
            size={24}
            className="animate-spin text-indigo-500"
        />

        <p className="mt-4 text-sm font-medium text-slate-600">
          공연 정보를 불러오고 있습니다.
        </p>

        <p className="mt-1 text-xs text-slate-400">
          잠시만 기다려주세요.
        </p>
      </div>
  );
}

interface EmptyStateProps {
  filtered: boolean;
  onReset: () => void;
}

function EmptyState({
                      filtered,
                      onReset,
                    }: EmptyStateProps) {
  return (
      <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <FileMusic
              size={22}
          />
        </div>

        <p className="mt-4 text-sm font-bold text-slate-800">
          {filtered
              ? '조건에 맞는 공연이 없습니다.'
              : '등록된 공연이 없습니다.'}
        </p>

        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
          {filtered
              ? '검색어나 필터 조건을 변경해서 다시 조회해보세요.'
              : '상단의 공연 등록 버튼으로 첫 공연을 등록할 수 있습니다.'}
        </p>

        {filtered && (
            <button
                type="button"
                onClick={onReset}
                className="mt-4 flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw
                  size={14}
              />

              필터 초기화
            </button>
        )}
      </div>
  );
}
