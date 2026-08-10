import {
  ArrowLeft,
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
  useParams,
} from 'react-router-dom';

import type {
  SeatType,
} from '@/features/admin/seat/types/adminSeat';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  getAdminPerformanceSeats,
  updatePerformanceSeatStatus,
} from '../api/adminPerformanceSeatApi';

import BulkCreatePerformanceSeatModal
  from '../components/BulkCreatePerformanceSeatModal';

import UpdatePerformanceSeatModal
  from '../components/UpdatePerformanceSeatModal';

import type {
  AdminPerformanceSeat,
  GetAdminPerformanceSeatsResponse,
  PerformanceSeatStatus,
  SeatGrade,
} from '../types/adminPerformanceSeat';

const PAGE_SIZE = 20;
const PAGE_WINDOW_SIZE = 5;

export default function AdminPerformanceSeatPage() {
  const navigate =
      useNavigate();

  const {
    performanceId:
        performanceIdParam,
  } = useParams();

  const performanceId =
      Number(
          performanceIdParam,
      );

  const [
    data,
    setData,
  ] =
      useState<GetAdminPerformanceSeatsResponse | null>(
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
    floorInput,
    setFloorInput,
  ] = useState('');

  const [
    floor,
    setFloor,
  ] =
      useState<number | undefined>(
          undefined,
      );

  const [
    grade,
    setGrade,
  ] =
      useState<SeatGrade | ''>(
          '',
      );

  const [
    seatType,
    setSeatType,
  ] =
      useState<SeatType | ''>(
          '',
      );

  const [
    status,
    setStatus,
  ] =
      useState<
          PerformanceSeatStatus | ''
      >(
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
    editingSeat,
    setEditingSeat,
  ] =
      useState<AdminPerformanceSeat | null>(
          null,
      );

  const [
    changingStatusId,
    setChangingStatusId,
  ] =
      useState<number | null>(
          null,
      );

  async function loadSeats(
      targetPage = page,
  ) {
    if (
        !Number.isInteger(
            performanceId,
        ) ||
        performanceId <= 0
    ) {
      setErrorMessage(
          '올바르지 않은 공연 회차입니다.',
      );

      setLoading(false);

      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response =
          await getAdminPerformanceSeats(
              performanceId,
              {
                page:
                targetPage,

                size:
                PAGE_SIZE,

                keyword:
                    keyword ||
                    undefined,

                floor,

                grade:
                    grade ||
                    undefined,

                seatType:
                    seatType ||
                    undefined,

                status:
                    status ||
                    undefined,
              },
          );

      setData(response);
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '판매 좌석 목록을 불러오지 못했습니다.',
          ),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSeats(
        page,
    );
  }, [
    page,
    keyword,
    floor,
    grade,
    seatType,
    status,
  ]);

  function handleSearch() {
    let nextFloor:
        | number
        | undefined;

    const normalizedFloor =
        floorInput.trim();

    if (!normalizedFloor) {
      nextFloor =
          undefined;
    } else {
      const value =
          Number(
              normalizedFloor,
          );

      if (
          !Number.isInteger(
              value,
          ) ||
          value <= 0
      ) {
        setErrorMessage(
            '층은 1 이상의 정수여야 합니다.',
        );

        return;
      }

      nextFloor =
          value;
    }

    setErrorMessage('');

    setPage(0);

    setKeyword(
        keywordInput.trim(),
    );

    setFloor(
        nextFloor,
    );
  }

  function handleKeyDown(
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
        '판매 좌석이 등록되었습니다.',
    );

    setPage(0);

    if (page === 0) {
      await loadSeats(0);
    }
  }

  async function handleUpdated() {
    setEditingSeat(null);

    setSuccessMessage(
        '판매 좌석 정보가 수정되었습니다.',
    );

    await loadSeats(
        page,
    );
  }

  async function handleAdministrativeStatusChange(
      seat:
      AdminPerformanceSeat,
  ) {
    /*
     * 관리자 상태 변경은
     * AVAILABLE ↔ BLOCKED만 가능하다.
     */
    if (
        seat.status !==
        'AVAILABLE' &&
        seat.status !==
        'BLOCKED'
    ) {
      return;
    }

    const nextStatus =
        seat.status ===
        'AVAILABLE'
            ? 'BLOCKED'
            : 'AVAILABLE';

    const confirmed =
        window.confirm(
            `${seat.sectionName} ${seat.rowName}열 ${seat.seatNumber}번 좌석을 ${
                nextStatus ===
                'BLOCKED'
                    ? '판매 차단'
                    : '판매 가능'
            } 상태로 변경하시겠습니까?`,
        );

    if (!confirmed) {
      return;
    }

    setChangingStatusId(
        seat.performanceSeatId,
    );

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await updatePerformanceSeatStatus(
          seat.performanceSeatId,
          {
            status:
            nextStatus,
          },
      );

      setSuccessMessage(
          nextStatus ===
          'BLOCKED'
              ? '판매 좌석을 차단했습니다.'
              : '판매 좌석 차단을 해제했습니다.',
      );

      await loadSeats(
          page,
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '판매 좌석 상태 변경에 실패했습니다.',
          ),
      );
    } finally {
      setChangingStatusId(
          null,
      );
    }
  }

  function getStatusLabel(
      value:
      PerformanceSeatStatus,
  ) {
    switch (value) {
      case 'AVAILABLE':
        return '판매 가능';

      case 'HELD':
        return '선점';

      case 'RESERVED':
        return '예약 완료';

      case 'BLOCKED':
        return '판매 차단';
    }
  }

  function formatPrice(
      price: number,
  ) {
    return `${price.toLocaleString()}원`;
  }

  function formatHeldUntil(
      value: string | null,
  ) {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat(
        'ko-KR',
        {
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

  const seats =
      data?.seats ??
      [];

  return (
      <>
        <div className="mx-auto max-w-[1700px]">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <button
                  type="button"
                  onClick={() =>
                      navigate(-1)
                  }
                  className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft
                    size={17}
                />

                공연 회차
              </button>

              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                판매 좌석 관리
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                공연 회차 #{performanceId}의
                좌석 등급, 가격 및 판매 상태를 관리합니다.
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

              판매 좌석 추가
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
              <div className="w-full max-w-xs">
                <label className="text-xs font-semibold text-slate-500">
                  검색
                </label>

                <div className="relative mt-2">
                  <Search
                      size={17}
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
                        handleKeyDown
                      }
                      placeholder="구역, 열, 좌석번호"
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="w-24">
                <label className="text-xs font-semibold text-slate-500">
                  층
                </label>

                <input
                    type="number"
                    min={1}
                    value={
                      floorInput
                    }
                    onChange={(event) =>
                        setFloorInput(
                            event.target.value,
                        )
                    }
                    onKeyDown={
                      handleKeyDown
                    }
                    placeholder="전체"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  등급
                </label>

                <select
                    value={grade}
                    onChange={(event) => {
                      setPage(0);

                      setGrade(
                          event.target
                              .value as
                              | SeatGrade
                              | '',
                      );
                    }}
                    className="mt-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm"
                >
                  <option value="">
                    전체
                  </option>

                  <option value="VIP">
                    VIP
                  </option>
                  <option value="R">
                    R
                  </option>
                  <option value="S">
                    S
                  </option>
                  <option value="A">
                    A
                  </option>
                  <option value="B">
                    B
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  좌석 유형
                </label>

                <select
                    value={
                      seatType
                    }
                    onChange={(event) => {
                      setPage(0);

                      setSeatType(
                          event.target
                              .value as
                              | SeatType
                              | '',
                      );
                    }}
                    className="mt-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm"
                >
                  <option value="">
                    전체
                  </option>

                  <option value="STANDARD">
                    일반석
                  </option>
                  <option value="WHEELCHAIR">
                    휠체어석
                  </option>
                  <option value="COMPANION">
                    동반자석
                  </option>
                  <option value="OBSTRUCTED_VIEW">
                    시야제한석
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  판매 상태
                </label>

                <select
                    value={status}
                    onChange={(event) => {
                      setPage(0);

                      setStatus(
                          event.target
                              .value as
                              | PerformanceSeatStatus
                              | '',
                      );
                    }}
                    className="mt-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm"
                >
                  <option value="">
                    전체
                  </option>

                  <option value="AVAILABLE">
                    판매 가능
                  </option>

                  <option value="HELD">
                    선점
                  </option>

                  <option value="RESERVED">
                    예약 완료
                  </option>

                  <option value="BLOCKED">
                    판매 차단
                  </option>
                </select>
              </div>

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
                      void loadSeats(
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
                    위치
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    유형
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    등급
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    가격
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    상태
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    선점 정보
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
                        판매 좌석을 불러오고 있습니다.
                      </td>
                    </tr>
                ) : seats.length ===
                0 ? (
                    <tr>
                      <td
                          colSpan={7}
                          className="px-5 py-16 text-center text-sm text-slate-400"
                      >
                        조회된 판매 좌석이 없습니다.
                      </td>
                    </tr>
                ) : (
                    seats.map(
                        (seat) => {
                          const administrativelyEditable =
                              seat.status ===
                              'AVAILABLE' ||
                              seat.status ===
                              'BLOCKED';

                          return (
                              <tr
                                  key={
                                    seat.performanceSeatId
                                  }
                                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                              >
                                <td className="px-5 py-4">
                                  <p className="text-sm font-semibold text-slate-900">
                                    {seat.sectionName}{' '}
                                    {seat.rowName}열{' '}
                                    {seat.seatNumber}번
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {seat.floor}층 · Seat #{seat.seatId}
                                  </p>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {
                                    seat.seatType
                                  }
                                </td>

                                <td className="px-5 py-4">
                            <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                              {
                                seat.grade
                              }
                            </span>
                                </td>

                                <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                                  {formatPrice(
                                      seat.price,
                                  )}
                                </td>

                                <td className="px-5 py-4">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {getStatusLabel(
                                  seat.status,
                              )}
                            </span>
                                </td>

                                <td className="px-5 py-4 text-xs text-slate-500">
                                  {seat.status ===
                                  'HELD' ? (
                                      <>
                                        <p>
                                          회원 #{seat.heldBy}
                                        </p>

                                        <p className="mt-1 text-slate-400">
                                          ~{' '}
                                          {formatHeldUntil(
                                              seat.heldUntil,
                                          )}
                                        </p>
                                      </>
                                  ) : (
                                      '-'
                                  )}
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex justify-end gap-2">
                                    {administrativelyEditable && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingSeat(
                                                    seat,
                                                )
                                            }
                                            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                          <Pencil
                                              size={14}
                                          />

                                          수정
                                        </button>
                                    )}

                                    {administrativelyEditable && (
                                        <button
                                            type="button"
                                            disabled={
                                                changingStatusId ===
                                                seat.performanceSeatId
                                            }
                                            onClick={() =>
                                                void handleAdministrativeStatusChange(
                                                    seat,
                                                )
                                            }
                                            className={[
                                              'rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50',
                                              seat.status ===
                                              'AVAILABLE'
                                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                                            ].join(
                                                ' ',
                                            )}
                                        >
                                          {seat.status ===
                                          'AVAILABLE'
                                              ? '판매 차단'
                                              : '차단 해제'}
                                        </button>
                                    )}

                                    {!administrativelyEditable && (
                                        <span className="px-3 py-2 text-xs text-slate-400">
                                  예약 시스템 관리
                                </span>
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
                                disabled={loading}
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
            <BulkCreatePerformanceSeatModal
                performanceId={
                  performanceId
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

        {editingSeat && (
            <UpdatePerformanceSeatModal
                seat={
                  editingSeat
                }
                onClose={() =>
                    setEditingSeat(
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
