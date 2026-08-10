// frontend/src/features/admin/seat/pages/AdminSeatPage.tsx

import {
  ArrowLeft,
  Armchair,
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

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  getAdminSeats,
  updateSeatStatus,
} from '../api/adminSeatApi';

import BulkCreateSeatModal
  from '../components/BulkCreateSeatModal';

import UpdateSeatModal
  from '../components/UpdateSeatModal';

import type {
  AdminSeat,
  GetAdminSeatsResponse,
  SeatStatus,
  SeatType,
} from '../types/adminSeat';

const PAGE_SIZE = 20;
const PAGE_WINDOW_SIZE = 5;

export default function AdminSeatPage() {
  const navigate =
      useNavigate();

  const {
    venueHallId:
        venueHallIdParam,
  } = useParams();

  const venueHallId =
      Number(
          venueHallIdParam,
      );

  const [
    data,
    setData,
  ] =
      useState<GetAdminSeatsResponse | null>(
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
      useState<SeatStatus | ''>(
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
    bulkCreateOpen,
    setBulkCreateOpen,
  ] = useState(false);

  const [
    editingSeat,
    setEditingSeat,
  ] =
      useState<AdminSeat | null>(
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
            venueHallId,
        ) ||
        venueHallId <= 0
    ) {
      setErrorMessage(
          '올바르지 않은 공연홀입니다.',
      );

      setLoading(false);

      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response =
          await getAdminSeats(
              venueHallId,
              {
                page:
                targetPage,

                size:
                PAGE_SIZE,

                keyword:
                    keyword ||
                    undefined,

                floor,

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
              '좌석 목록을 불러오지 못했습니다.',
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
    seatType,
    status,
  ]);

  function handleSearch() {
    const normalizedKeyword =
        keywordInput.trim();

    const normalizedFloor =
        floorInput.trim();

    let nextFloor:
        | number
        | undefined;

    if (!normalizedFloor) {
      nextFloor = undefined;
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

      nextFloor = value;
    }

    setErrorMessage('');
    setPage(0);

    setKeyword(
        normalizedKeyword,
    );

    setFloor(
        nextFloor,
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
    setBulkCreateOpen(
        false,
    );

    setSuccessMessage(
        '좌석이 생성되었습니다.',
    );

    setPage(0);

    if (page === 0) {
      await loadSeats(0);
    }
  }

  async function handleUpdated() {
    setEditingSeat(null);

    setSuccessMessage(
        '좌석 정보가 수정되었습니다.',
    );

    await loadSeats(
        page,
    );
  }

  async function handleStatusChange(
      seat: AdminSeat,
      nextStatus: SeatStatus,
  ) {
    if (
        seat.status ===
        nextStatus
    ) {
      return;
    }

    const confirmed =
        window.confirm(
            `${seat.sectionName} ${seat.rowName}열 ${seat.seatNumber}번 좌석의 상태를 ${nextStatus}(으)로 변경하시겠습니까?`,
        );

    if (!confirmed) {
      return;
    }

    setChangingStatusId(
        seat.seatId,
    );

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await updateSeatStatus(
          seat.seatId,
          {
            status:
            nextStatus,
          },
      );

      setSuccessMessage(
          '좌석 상태가 변경되었습니다.',
      );

      await loadSeats(
          page,
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '좌석 상태 변경에 실패했습니다.',
          ),
      );
    } finally {
      setChangingStatusId(
          null,
      );
    }
  }

  const pageNumbers =
      useMemo(() => {
        const totalPages =
            data?.totalPages ??
            0;

        if (
            totalPages <= 0
        ) {
          return [];
        }

        const groupIndex =
            Math.floor(
                page /
                PAGE_WINDOW_SIZE,
            );

        const start =
            groupIndex *
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
        <div className="mx-auto max-w-[1600px]">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <button
                  type="button"
                  onClick={() =>
                      navigate(-1)
                  }
                  className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft
                    size={17}
                />

                공연홀 목록
              </button>

              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                좌석 관리
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                공연홀 #{venueHallId}의
                물리 좌석을 관리합니다.
              </p>
            </div>

            <button
                type="button"
                onClick={() => {
                  setSuccessMessage(
                      '',
                  );

                  setBulkCreateOpen(
                      true,
                  );
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <Plus size={18} />

              좌석 일괄 생성
            </button>
          </header>

          {successMessage && (
              <div
                  role="status"
                  className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {successMessage}
              </div>
          )}

          {errorMessage && (
              <div
                  role="alert"
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </div>
          )}

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="flex flex-wrap items-end gap-3">
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
                        placeholder="구역, 열, 좌석번호"
                        className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div className="w-28">
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
                        handleSearchKeyDown
                      }
                      placeholder="전체"
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  />
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
                      className="mt-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="">
                      전체 유형
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
                    상태
                  </label>

                  <select
                      value={status}
                      onChange={(event) => {
                        setPage(0);

                        setStatus(
                            event.target
                                .value as
                                | SeatStatus
                                | '',
                        );
                      }}
                      className="mt-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="">
                      전체 상태
                    </option>

                    <option value="ACTIVE">
                      활성
                    </option>

                    <option value="INACTIVE">
                      비활성
                    </option>

                    <option value="MAINTENANCE">
                      유지보수
                    </option>
                  </select>
                </div>

                <button
                    type="button"
                    onClick={
                      handleSearch
                    }
                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
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
                    className="ml-auto flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    ID
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    구역
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    층
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    열
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    번호
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    유형
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
                          colSpan={8}
                          className="px-5 py-16 text-center text-sm text-slate-400"
                      >
                        좌석 정보를 불러오고 있습니다.
                      </td>
                    </tr>
                ) : seats.length ===
                0 ? (
                    <tr>
                      <td
                          colSpan={8}
                          className="px-5 py-16 text-center"
                      >
                        <Armchair
                            size={28}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm text-slate-500">
                          조회된 좌석이 없습니다.
                        </p>
                      </td>
                    </tr>
                ) : (
                    seats.map(
                        (seat) => (
                            <tr
                                key={
                                  seat.seatId
                                }
                                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4 text-sm text-slate-500">
                                {
                                  seat.seatId
                                }
                              </td>

                              <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                {
                                  seat.sectionName
                                }
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {seat.floor}층
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {
                                  seat.rowName
                                }
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {
                                  seat.seatNumber
                                }
                              </td>

                              <td className="px-5 py-4 text-xs font-medium text-slate-600">
                                {
                                  seat.seatType
                                }
                              </td>

                              <td className="px-5 py-4">
                                <select
                                    value={
                                      seat.status
                                    }
                                    disabled={
                                        changingStatusId ===
                                        seat.seatId
                                    }
                                    onChange={(event) =>
                                        void handleStatusChange(
                                            seat,
                                            event.target
                                                .value as SeatStatus,
                                        )
                                    }
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none disabled:opacity-50"
                                >
                                  <option value="ACTIVE">
                                    활성
                                  </option>

                                  <option value="INACTIVE">
                                    비활성
                                  </option>

                                  <option value="MAINTENANCE">
                                    유지보수
                                  </option>
                                </select>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex justify-end">
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
                                </div>
                              </td>
                            </tr>
                        ),
                    )
                )}
                </tbody>
              </table>
            </div>

            {data && (
                <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/50 px-5 py-4">
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
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
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
                                onClick={() =>
                                    setPage(
                                        pageNumber,
                                    )
                                }
                                className={[
                                  'size-9 rounded-lg text-sm font-semibold transition',
                                  pageNumber ===
                                  page
                                      ? 'bg-indigo-600 text-white'
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
                        disabled={
                            data.last ||
                            loading
                        }
                        onClick={() =>
                            setPage(
                                page + 1,
                            )
                        }
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
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

        {bulkCreateOpen && (
            <BulkCreateSeatModal
                venueHallId={
                  venueHallId
                }
                onClose={() =>
                    setBulkCreateOpen(
                        false,
                    )
                }
                onCreated={() =>
                    void handleCreated()
                }
            />
        )}

        {editingSeat && (
            <UpdateSeatModal
                seat={editingSeat}
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
