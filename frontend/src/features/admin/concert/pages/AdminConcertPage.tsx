import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';

import {
  type KeyboardEvent,
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
      useState<ConcertCategory | ''>(
          '',
      );

  const [
    status,
    setStatus,
  ] =
      useState<ConcertStatus | ''>(
          '',
      );

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

  async function loadConcerts(
      targetPage = page,
  ) {
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
  }

  useEffect(() => {
    void loadConcerts(
        page,
    );
  }, [
    page,
    keyword,
    category,
    status,
  ]);

  function handleSearch() {
    setPage(0);

    setKeyword(
        keywordInput.trim(),
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

    await loadConcerts(page);
  }

  async function handleStatusChange(
      concert: AdminConcert,
      nextStatus: ConcertStatus,
  ) {
    const confirmed =
        window.confirm(
            `${concert.title} 공연의 상태를 ${nextStatus}(으)로 변경하시겠습니까?`,
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
          '공연 상태가 변경되었습니다.',
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

  function getAvailableStatuses(
      concertStatus:
      ConcertStatus,
  ): ConcertStatus[] {
    switch (
        concertStatus
        ) {
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

  function getStatusLabel(
      value: ConcertStatus,
  ) {
    switch (value) {
      case 'DRAFT':
        return '작성중';

      case 'PUBLISHED':
        return '공개';

      case 'CLOSED':
        return '종료';

      case 'CANCELLED':
        return '취소';
    }
  }

  function getCategoryLabel(
      value: ConcertCategory,
  ) {
    switch (value) {
      case 'CONCERT':
        return '콘서트';
      case 'MUSICAL':
        return '뮤지컬';
      case 'PLAY':
        return '연극';
      case 'CLASSIC':
        return '클래식';
      case 'DANCE':
        return '무용';
      case 'ETC':
        return '기타';
    }
  }

  const pageNumbers =
      useMemo(() => {
        const totalPages =
            data?.totalPages ??
            0;

        if (!totalPages) {
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

  const concerts =
      data?.concerts ??
      [];

  return (
      <>
        <div className="mx-auto max-w-[1600px]">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                공연 관리
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                공연 기본 정보와 공개 상태를 관리합니다.
              </p>
            </div>

            <button
                type="button"
                onClick={() => {
                  setSuccessMessage(
                      '',
                  );

                  setCreateOpen(
                      true,
                  );
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <Plus size={18} />

              공연 등록
            </button>
          </header>

          {successMessage && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
          )}

          {errorMessage && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
          )}

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 p-5">
              <div className="w-full max-w-sm">
                <label className="text-xs font-semibold text-slate-500">
                  검색
                </label>

                <div className="relative mt-2">
                  <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
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
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <select
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
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm"
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

              <select
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
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm"
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

              <button
                  type="button"
                  onClick={
                    handleSearch
                  }
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
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
                  className="ml-auto flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                <RefreshCw
                    size={17}
                    className={
                      loading
                          ? 'animate-spin'
                          : ''
                    }
                />

                새로고침
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    공연
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    카테고리
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    공연시간
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    상태
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">
                    관리
                  </th>
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    <tr>
                      <td
                          colSpan={5}
                          className="px-5 py-16 text-center text-sm text-slate-400"
                      >
                        공연 정보를 불러오고 있습니다.
                      </td>
                    </tr>
                ) : concerts.length ===
                0 ? (
                    <tr>
                      <td
                          colSpan={5}
                          className="px-5 py-16 text-center text-sm text-slate-400"
                      >
                        조회된 공연이 없습니다.
                      </td>
                    </tr>
                ) : (
                    concerts.map(
                        (concert) => {
                          const availableStatuses =
                              getAvailableStatuses(
                                  concert.status,
                              );

                          return (
                              <tr
                                  key={
                                    concert.concertId
                                  }
                                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                              >
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-4">
                                    {concert.posterUrl ? (
                                        <img
                                            src={
                                              concert.posterUrl
                                            }
                                            alt=""
                                            className="h-16 w-12 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="h-16 w-12 rounded-lg bg-slate-100" />
                                    )}

                                    <div>
                                      <p className="font-semibold text-slate-900">
                                        {
                                          concert.title
                                        }
                                      </p>

                                      {concert.subtitle && (
                                          <p className="mt-1 text-xs text-slate-400">
                                            {
                                              concert.subtitle
                                            }
                                          </p>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {getCategoryLabel(
                                      concert.category,
                                  )}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {concert.runningTime
                                      ? `${concert.runningTime}분`
                                      : '-'}
                                </td>

                                <td className="px-5 py-4">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {getStatusLabel(
                                  concert.status,
                              )}
                            </span>
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/admin/concerts/${concert.concertId}/performances`,
                                            )
                                        }
                                        className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
                                    >
                                      <CalendarDays
                                          size={14}
                                      />

                                      회차
                                    </button>

                                    {concert.status !==
                                        'CLOSED' &&
                                        concert.status !==
                                        'CANCELLED' && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingConcert(
                                                        concert,
                                                    )
                                                }
                                                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
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
                                                    changingStatusId ===
                                                    concert.concertId
                                                }
                                                onClick={() =>
                                                    void handleStatusChange(
                                                        concert,
                                                        nextStatus,
                                                    )
                                                }
                                                className={[
                                                  'rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50',
                                                  nextStatus ===
                                                  'CANCELLED'
                                                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                                                ].join(
                                                    ' ',
                                                )}
                                            >
                                              {nextStatus ===
                                              'PUBLISHED'
                                                  ? '공개'
                                                  : nextStatus ===
                                                  'CLOSED'
                                                      ? '종료'
                                                      : '취소'}
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

            {data && (
                <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                  <p className="text-sm text-slate-500">
                    총{' '}
                    <strong className="text-slate-800">
                      {data.totalElements.toLocaleString()}
                    </strong>
                    개
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                        type="button"
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
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-300 disabled:opacity-40"
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
                                onClick={() =>
                                    setPage(
                                        pageNumber,
                                    )
                                }
                                className={[
                                  'size-9 rounded-lg text-sm font-semibold',
                                  page ===
                                  pageNumber
                                      ? 'bg-indigo-600 text-white'
                                      : 'border border-slate-300 bg-white text-slate-600',
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
                        disabled={
                            data.last ||
                            loading
                        }
                        onClick={() =>
                            setPage(
                                page + 1,
                            )
                        }
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-300 disabled:opacity-40"
                    >
                      <ChevronRight
                          size={17}
                      />
                    </button>
                  </div>
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
