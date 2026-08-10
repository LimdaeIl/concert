import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
} from 'lucide-react';

import {
  type KeyboardEvent,
  useEffect,
  useState,
} from 'react';

import type {
  SeatType,
} from '@/features/admin/seat/types/adminSeat';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  bulkCreatePerformanceSeats,
  getAdminPerformanceSeatCandidates,
} from '../api/adminPerformanceSeatApi';

import type {
  AdminPerformanceSeatCandidate,
  GetAdminPerformanceSeatCandidatesResponse,
  SeatGrade,
} from '../types/adminPerformanceSeat';

interface BulkCreatePerformanceSeatModalProps {
  performanceId: number;

  onClose: () => void;
  onCreated: () => void;
}

const PAGE_SIZE = 50;

export default function BulkCreatePerformanceSeatModal({
                                                         performanceId,
                                                         onClose,
                                                         onCreated,
                                                       }: BulkCreatePerformanceSeatModalProps) {
  const [
    data,
    setData,
  ] =
      useState<GetAdminPerformanceSeatCandidatesResponse | null>(
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

  /*
   * 페이지가 변경되어도
   * 선택을 유지하기 위해 Map으로 관리한다.
   */
  const [
    selectedSeats,
    setSelectedSeats,
  ] =
      useState<
          Map<
              number,
              AdminPerformanceSeatCandidate
          >
      >(
          new Map(),
      );

  const [
    grade,
    setGrade,
  ] =
      useState<SeatGrade>(
          'VIP',
      );

  const [
    price,
    setPrice,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  async function loadCandidates(
      targetPage = page,
  ) {
    setLoading(true);
    setErrorMessage('');

    try {
      const response =
          await getAdminPerformanceSeatCandidates(
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

                seatType:
                    seatType ||
                    undefined,
              },
          );

      setData(response);
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '등록 가능한 좌석을 불러오지 못했습니다.',
          ),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCandidates(
        page,
    );
  }, [
    page,
    keyword,
    floor,
    seatType,
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

  function toggleSeat(
      seat:
      AdminPerformanceSeatCandidate,
  ) {
    setSelectedSeats(
        (current) => {
          const next =
              new Map(
                  current,
              );

          if (
              next.has(
                  seat.seatId,
              )
          ) {
            next.delete(
                seat.seatId,
            );
          } else {
            next.set(
                seat.seatId,
                seat,
            );
          }

          return next;
        },
    );
  }

  function toggleCurrentPage() {
    const seats =
        data?.seats ??
        [];

    if (
        seats.length === 0
    ) {
      return;
    }

    const allSelected =
        seats.every(
            (seat) =>
                selectedSeats.has(
                    seat.seatId,
                ),
        );

    setSelectedSeats(
        (current) => {
          const next =
              new Map(
                  current,
              );

          for (
              const seat of seats
              ) {
            if (allSelected) {
              next.delete(
                  seat.seatId,
              );
            } else {
              next.set(
                  seat.seatId,
                  seat,
              );
            }
          }

          return next;
        },
    );
  }

  async function handleSubmit() {
    if (
        selectedSeats.size ===
        0
    ) {
      setErrorMessage(
          '등록할 좌석을 선택해주세요.',
      );

      return;
    }

    const priceNumber =
        Number(price);

    if (
        !Number.isInteger(
            priceNumber,
        ) ||
        priceNumber < 0
    ) {
      setErrorMessage(
          '판매 가격은 0 이상의 정수여야 합니다.',
      );

      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await bulkCreatePerformanceSeats(
          performanceId,
          {
            seats:
                Array.from(
                    selectedSeats.values(),
                ).map(
                    (seat) => ({
                      seatId:
                      seat.seatId,

                      grade,

                      price:
                      priceNumber,
                    }),
                ),
          },
      );

      onCreated();
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '판매 좌석 등록에 실패했습니다.',
          ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const seats =
      data?.seats ??
      [];

  const allCurrentPageSelected =
      seats.length > 0 &&
      seats.every(
          (seat) =>
              selectedSeats.has(
                  seat.seatId,
              ),
      );

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-6">
        <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <Plus
                    size={20}
                    className="text-indigo-600"
                />

                <h2 className="text-lg font-bold text-slate-950">
                  판매 좌석 추가
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                아직 이 회차에 등록되지 않은
                물리 좌석을 선택합니다.
              </p>
            </div>

            <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="닫기"
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </header>

          <div className="overflow-y-auto">
            <section className="border-b border-slate-200 p-5">
              <div className="flex flex-wrap items-end gap-3">
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
                        handleKeyDown
                      }
                      placeholder="전체"
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
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

                <button
                    type="button"
                    onClick={
                      handleSearch
                    }
                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  검색
                </button>
              </div>
            </section>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="w-14 px-5 py-3">
                    <input
                        type="checkbox"
                        checked={
                          allCurrentPageSelected
                        }
                        onChange={
                          toggleCurrentPage
                        }
                        aria-label="현재 페이지 전체 선택"
                    />
                  </th>

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
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    <tr>
                      <td
                          colSpan={7}
                          className="px-5 py-14 text-center text-sm text-slate-400"
                      >
                        후보 좌석을 불러오고 있습니다.
                      </td>
                    </tr>
                ) : seats.length ===
                0 ? (
                    <tr>
                      <td
                          colSpan={7}
                          className="px-5 py-14 text-center text-sm text-slate-400"
                      >
                        등록 가능한 좌석이 없습니다.
                      </td>
                    </tr>
                ) : (
                    seats.map(
                        (seat) => (
                            <tr
                                key={
                                  seat.seatId
                                }
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            >
                              <td className="px-5 py-4">
                                <input
                                    type="checkbox"
                                    checked={
                                      selectedSeats.has(
                                          seat.seatId,
                                      )
                                    }
                                    onChange={() =>
                                        toggleSeat(
                                            seat,
                                        )
                                    }
                                />
                              </td>

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

                              <td className="px-5 py-4 text-xs text-slate-600">
                                {
                                  seat.seatType
                                }
                              </td>
                            </tr>
                        ),
                    )
                )}
                </tbody>
              </table>
            </div>

            {data && (
                <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                  <p className="text-sm text-slate-500">
                    등록 가능{' '}
                    <strong className="text-slate-800">
                      {data.totalElements.toLocaleString()}
                    </strong>
                    개
                  </p>

                  <div className="flex items-center gap-2">
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

                    <span className="min-w-24 text-center text-sm text-slate-600">
                  {data.totalPages ===
                  0
                      ? '0 / 0'
                      : `${data.page + 1} / ${data.totalPages}`}
                </span>

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
                </div>
            )}

            <section className="border-t border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    선택
                  </p>

                  <p className="mt-2 text-xl font-bold text-slate-950">
                    {selectedSeats.size.toLocaleString()}
                    개
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">
                    등급
                  </label>

                  <select
                      value={grade}
                      disabled={submitting}
                      onChange={(event) =>
                          setGrade(
                              event.target
                                  .value as SeatGrade,
                          )
                      }
                      className="mt-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm"
                  >
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
                    판매 가격
                  </label>

                  <input
                      type="number"
                      min={0}
                      step={1000}
                      value={price}
                      disabled={submitting}
                      onChange={(event) =>
                          setPrice(
                              event.target.value,
                          )
                      }
                      placeholder="150000"
                      className="mt-2 w-44 rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                  />
                </div>

                <button
                    type="button"
                    disabled={
                        submitting ||
                        selectedSeats.size ===
                        0
                    }
                    onClick={() =>
                        void handleSubmit()
                    }
                    className="ml-auto rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-slate-300"
                >
                  {submitting
                      ? '등록 중...'
                      : `${selectedSeats.size}개 등록`}
                </button>
              </div>

              {errorMessage && (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </p>
              )}
            </section>
          </div>
        </div>
      </div>
  );
}
