import {
  ArrowLeft,
  Armchair,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RefreshCw,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  getAdminPerformances,
  updatePerformanceStatus,
} from '../api/adminPerformanceApi';

import CreatePerformanceModal
  from '../components/CreatePerformanceModal';

import UpdatePerformanceModal
  from '../components/UpdatePerformanceModal';

import type {
  AdminPerformance,
  GetAdminPerformancesResponse,
  PerformanceStatus,
} from '../types/adminPerformance';

const PAGE_SIZE = 20;
const PAGE_WINDOW_SIZE = 5;

export default function AdminPerformancePage() {
  const navigate =
      useNavigate();

  const {
    concertId:
        concertIdParam,
  } = useParams();

  const concertId =
      Number(
          concertIdParam,
      );

  const [
    data,
    setData,
  ] =
      useState<GetAdminPerformancesResponse | null>(
          null,
      );

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    status,
    setStatus,
  ] =
      useState<PerformanceStatus | ''>(
          '',
      );

  const [
    fromInput,
    setFromInput,
  ] = useState('');

  const [
    toInput,
    setToInput,
  ] = useState('');

  const [
    from,
    setFrom,
  ] = useState('');

  const [
    to,
    setTo,
  ] = useState('');

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
    editingPerformance,
    setEditingPerformance,
  ] =
      useState<AdminPerformance | null>(
          null,
      );

  const [
    changingStatusId,
    setChangingStatusId,
  ] =
      useState<number | null>(
          null,
      );

  async function loadPerformances(
      targetPage = page,
  ) {
    if (
        !Number.isInteger(
            concertId,
        ) ||
        concertId <= 0
    ) {
      setErrorMessage(
          '올바르지 않은 공연입니다.',
      );

      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response =
          await getAdminPerformances(
              concertId,
              {
                page:
                targetPage,

                size:
                PAGE_SIZE,

                status:
                    status ||
                    undefined,

                from:
                    from ||
                    undefined,

                to:
                    to ||
                    undefined,
              },
          );

      setData(response);
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '공연 회차 목록을 불러오지 못했습니다.',
          ),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPerformances(
        page,
    );
  }, [
    page,
    status,
    from,
    to,
  ]);

  function handleDateSearch() {
    if (
        fromInput &&
        toInput &&
        new Date(toInput) <
        new Date(fromInput)
    ) {
      setErrorMessage(
          '검색 종료일시는 시작일시보다 빠를 수 없습니다.',
      );

      return;
    }

    setPage(0);
    setFrom(fromInput);
    setTo(toInput);
  }

  async function handleCreated() {
    setCreateOpen(false);

    setSuccessMessage(
        '공연 회차가 등록되었습니다.',
    );

    if (page !== 0) {
      setPage(0);
      return;
    }

    await loadPerformances(0);
  }

  async function handleUpdated() {
    setEditingPerformance(
        null,
    );

    setSuccessMessage(
        '공연 회차가 수정되었습니다.',
    );

    await loadPerformances(
        page,
    );
  }

  function getAvailableStatuses(
      current:
      PerformanceStatus,
  ): PerformanceStatus[] {
    switch (current) {
      case 'SCHEDULED':
        return [
          'OPEN',
          'CANCELLED',
        ];

      case 'OPEN':
        return [
          'SOLD_OUT',
          'COMPLETED',
          'CANCELLED',
        ];

      case 'SOLD_OUT':
        return [
          'OPEN',
          'COMPLETED',
          'CANCELLED',
        ];

      case 'COMPLETED':
      case 'CANCELLED':
        return [];
    }
  }

  function getStatusLabel(
      value:
      PerformanceStatus,
  ) {
    switch (value) {
      case 'SCHEDULED':
        return '예정';

      case 'OPEN':
        return '예매중';

      case 'SOLD_OUT':
        return '매진';

      case 'COMPLETED':
        return '종료';

      case 'CANCELLED':
        return '취소';
    }
  }

  async function handleStatusChange(
      performance:
      AdminPerformance,

      nextStatus:
      PerformanceStatus,
  ) {
    const confirmed =
        window.confirm(
            `${performance.venueName} ${performance.venueHallName} 회차를 ${getStatusLabel(nextStatus)} 상태로 변경하시겠습니까?`,
        );

    if (!confirmed) {
      return;
    }

    setChangingStatusId(
        performance.performanceId,
    );

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await updatePerformanceStatus(
          performance.performanceId,
          {
            status:
            nextStatus,
          },
      );

      setSuccessMessage(
          '공연 회차 상태가 변경되었습니다.',
      );

      await loadPerformances(
          page,
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '공연 회차 상태 변경에 실패했습니다.',
          ),
      );
    } finally {
      setChangingStatusId(
          null,
      );
    }
  }

  function formatDateTime(
      value: string,
  ) {
    return new Intl.DateTimeFormat(
        'ko-KR',
        {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        },
    ).format(
        new Date(value),
    );
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

  const performances =
      data?.performances ??
      [];

  return (
      <>
        <div className="mx-auto max-w-[1600px]">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <button
                  type="button"
                  onClick={() =>
                      navigate(
                          '/admin/concerts',
                      )
                  }
                  className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft
                    size={17}
                />

                공연 목록
              </button>

              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                공연 회차 관리
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                공연 #{concertId}의
                공연 회차와 예매 일정을 관리합니다.
              </p>
            </div>

            <button
                type="button"
                onClick={() => {
                  setSuccessMessage('');
                  setCreateOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <Plus size={18} />

              회차 등록
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
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  상태
                </label>

                <select
                    value={status}
                    onChange={(event) => {
                      setPage(0);

                      setStatus(
                          event.target
                              .value as
                              | PerformanceStatus
                              | '',
                      );
                    }}
                    className="mt-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm"
                >
                  <option value="">
                    전체 상태
                  </option>

                  <option value="SCHEDULED">
                    예정
                  </option>

                  <option value="OPEN">
                    예매중
                  </option>

                  <option value="SOLD_OUT">
                    매진
                  </option>

                  <option value="COMPLETED">
                    종료
                  </option>

                  <option value="CANCELLED">
                    취소
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  공연 시작
                </label>

                <input
                    type="datetime-local"
                    value={fromInput}
                    onChange={(event) =>
                        setFromInput(
                            event.target.value,
                        )
                    }
                    className="mt-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  공연 종료 검색값
                </label>

                <input
                    type="datetime-local"
                    value={toInput}
                    onChange={(event) =>
                        setToInput(
                            event.target.value,
                        )
                    }
                    className="mt-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <button
                  type="button"
                  onClick={
                    handleDateSearch
                  }
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                기간 검색
              </button>

              <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                      void loadPerformances(
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
                    회차
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    공연장 / 공연홀
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    공연 일시
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    예매 기간
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    최대 매수
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
                          colSpan={7}
                          className="px-5 py-16 text-center text-sm text-slate-400"
                      >
                        공연 회차를 불러오고 있습니다.
                      </td>
                    </tr>
                ) : performances.length ===
                0 ? (
                    <tr>
                      <td
                          colSpan={7}
                          className="px-5 py-16 text-center"
                      >
                        <CalendarClock
                            size={28}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm text-slate-500">
                          조회된 공연 회차가 없습니다.
                        </p>
                      </td>
                    </tr>
                ) : (
                    performances.map(
                        (performance) => {
                          const availableStatuses =
                              getAvailableStatuses(
                                  performance.status,
                              );

                          return (
                              <tr
                                  key={
                                    performance.performanceId
                                  }
                                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                              >
                                <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                  #
                                  {
                                    performance.performanceId
                                  }
                                </td>

                                <td className="px-5 py-4">
                                  <p className="text-sm font-semibold text-slate-900">
                                    {
                                      performance.venueName
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {
                                      performance.venueHallName
                                    }
                                  </p>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                  <p>
                                    {formatDateTime(
                                        performance.startsAt,
                                    )}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    ~{' '}
                                    {formatDateTime(
                                        performance.endsAt,
                                    )}
                                  </p>
                                </td>

                                <td className="px-5 py-4 text-xs text-slate-600">
                                  <p>
                                    {formatDateTime(
                                        performance.reservationOpensAt,
                                    )}
                                  </p>

                                  <p className="mt-1 text-slate-400">
                                    ~{' '}
                                    {formatDateTime(
                                        performance.reservationClosesAt,
                                    )}
                                  </p>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {
                                    performance.maxTicketsPerMember
                                  }
                                  매
                                </td>

                                <td className="px-5 py-4">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {getStatusLabel(
                                  performance.status,
                              )}
                            </span>
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/admin/performances/${performance.performanceId}/seats`,
                                            )
                                        }
                                        className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                                    >
                                      <Armchair
                                          size={14}
                                      />

                                      판매 좌석
                                    </button>

                                    {performance.status !==
                                        'COMPLETED' &&
                                        performance.status !==
                                        'CANCELLED' && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingPerformance(
                                                        performance,
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
                                                    performance.performanceId
                                                }
                                                onClick={() =>
                                                    void handleStatusChange(
                                                        performance,
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
                                              {getStatusLabel(
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
            <CreatePerformanceModal
                concertId={
                  concertId
                }
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

        {editingPerformance && (
            <UpdatePerformanceModal
                performance={
                  editingPerformance
                }
                onClose={() =>
                    setEditingPerformance(
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
