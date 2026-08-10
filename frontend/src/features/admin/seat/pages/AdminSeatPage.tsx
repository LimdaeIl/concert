import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  MousePointer2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';

import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
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
  bulkUpdateSeats,
  getAdminSeats,
  updateSeat,
  updateSeatStatus,
} from '../api/adminSeatApi';

import BulkCreateSeatModal
  from '../components/BulkCreateSeatModal';

import type {
  AdminSeat,
  GetAdminSeatsResponse,
  SeatStatus,
  SeatType,
} from '../types/adminSeat';

const PAGE_SIZE = 100;
const PAGE_WINDOW_SIZE = 5;

type PageMode =
    | 'VIEW'
    | 'EDIT';

type DragMode =
    | 'SELECT'
    | 'DESELECT'
    | null;

const STATUS_LABELS:
    Record<SeatStatus, string> = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  MAINTENANCE: '유지보수',
};

const STATUS_STYLES:
    Record<SeatStatus, string> = {
  ACTIVE:
      'border-emerald-300 bg-emerald-100 text-emerald-800',

  INACTIVE:
      'border-slate-300 bg-slate-100 text-slate-500',

  MAINTENANCE:
      'border-amber-300 bg-amber-100 text-amber-800',
};

const TYPE_LABELS:
    Record<SeatType, string> = {
  STANDARD: '일반석',
  WHEELCHAIR: '휠체어석',
  COMPANION: '동반자석',
  OBSTRUCTED_VIEW: '시야제한석',
};

interface SeatRowGroup {
  key: string;

  floor: number;
  sectionName: string;
  rowName: string;

  seats: AdminSeat[];
}

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
    mode,
    setMode,
  ] =
      useState<PageMode>(
          'VIEW',
      );

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
    selectedSeatIds,
    setSelectedSeatIds,
  ] =
      useState<Set<number>>(
          new Set(),
      );

  const [
    dragging,
    setDragging,
  ] = useState(false);

  const [
    dragMode,
    setDragMode,
  ] =
      useState<DragMode>(
          null,
      );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

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

  /*
   * ---------------------------------------------------------
   * 조회
   * ---------------------------------------------------------
   */
  const loadSeats =
      useCallback(
          async (
              targetPage: number,
          ) => {
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
          },
          [
            venueHallId,
            keyword,
            floor,
            seatType,
            status,
          ],
      );

  useEffect(() => {
    void loadSeats(
        page,
    );
  }, [
    loadSeats,
    page,
  ]);

  /*
   * 마우스를 좌석 밖에서 놓더라도
   * drag 상태가 종료되도록 처리한다.
   */
  useEffect(() => {
    function handlePointerUp() {
      setDragging(false);
      setDragMode(null);
    }

    window.addEventListener(
        'pointerup',
        handlePointerUp,
    );

    return () => {
      window.removeEventListener(
          'pointerup',
          handlePointerUp,
      );
    };
  }, []);

  const seats =
      data?.seats ??
      [];

  /*
   * ---------------------------------------------------------
   * 좌석 배치 그룹
   * ---------------------------------------------------------
   */
  const groupedSeats =
      useMemo<SeatRowGroup[]>(
          () => {
            const groups =
                new Map<
                    string,
                    SeatRowGroup
                >();

            for (
                const seat of seats
                ) {
              const key =
                  [
                    seat.floor,
                    seat.sectionName,
                    seat.rowName,
                  ].join('|');

              const existing =
                  groups.get(
                      key,
                  );

              if (existing) {
                existing.seats.push(
                    seat,
                );

                continue;
              }

              groups.set(
                  key,
                  {
                    key,

                    floor:
                    seat.floor,

                    sectionName:
                    seat.sectionName,

                    rowName:
                    seat.rowName,

                    seats: [
                      seat,
                    ],
                  },
              );
            }

            for (
                const group
                of groups.values()
                ) {
              group.seats.sort(
                  (
                      first,
                      second,
                  ) =>
                      String(
                          first.seatNumber,
                      ).localeCompare(
                          String(
                              second.seatNumber,
                          ),
                          undefined,
                          {
                            numeric: true,
                          },
                      ),
              );
            }

            return Array.from(
                groups.values(),
            );
          },
          [
            seats,
          ],
      );

  const selectedSeats =
      useMemo(
          () =>
              seats.filter(
                  (seat) =>
                      selectedSeatIds.has(
                          seat.seatId,
                      ),
              ),
          [
            seats,
            selectedSeatIds,
          ],
      );

  const singleSelectedSeat =
      selectedSeats.length === 1
          ? selectedSeats[0]
          : null;

  /*
   * ---------------------------------------------------------
   * 검색
   * ---------------------------------------------------------
   */
  function handleSearch() {
    const normalizedKeyword =
        keywordInput.trim();

    const normalizedFloor =
        floorInput.trim();

    let nextFloor:
        | number
        | undefined;

    if (!normalizedFloor) {
      nextFloor =
          undefined;
    } else {
      const parsed =
          Number(
              normalizedFloor,
          );

      if (
          !Number.isInteger(
              parsed,
          ) ||
          parsed <= 0
      ) {
        setErrorMessage(
            '층은 1 이상의 정수여야 합니다.',
        );

        return;
      }

      nextFloor =
          parsed;
    }

    setErrorMessage('');
    setSuccessMessage('');

    clearSelection();

    const sameCondition =
        page === 0 &&
        normalizedKeyword ===
        keyword &&
        nextFloor ===
        floor;

    setKeyword(
        normalizedKeyword,
    );

    setFloor(
        nextFloor,
    );

    setPage(0);

    if (sameCondition) {
      void loadSeats(0);
    }
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

    setFloorInput('');
    setFloor(undefined);

    setSeatType('');
    setStatus('');

    setPage(0);

    clearSelection();

    setErrorMessage('');
    setSuccessMessage('');
  }

  /*
   * ---------------------------------------------------------
   * 보기 / 편집 모드
   * ---------------------------------------------------------
   */
  function changeMode(
      nextMode: PageMode,
  ) {
    setMode(
        nextMode,
    );

    clearSelection();

    setErrorMessage('');
    setSuccessMessage('');
  }

  function clearSelection() {
    setSelectedSeatIds(
        new Set(),
    );

    setDragging(false);
    setDragMode(null);
  }

  /*
   * ---------------------------------------------------------
   * 좌석 선택
   * ---------------------------------------------------------
   */
  function selectOnly(
      seatId: number,
  ) {
    setSelectedSeatIds(
        new Set([
          seatId,
        ]),
    );
  }

  function handleSeatPointerDown(
      event:
      PointerEvent<HTMLButtonElement>,
      seatId: number,
  ) {
    /*
     * 보기 모드에서는
     * 단일 선택만 제공한다.
     */
    if (
        mode === 'VIEW'
    ) {
      selectOnly(
          seatId,
      );

      return;
    }

    event.preventDefault();

    const alreadySelected =
        selectedSeatIds.has(
            seatId,
        );

    const nextDragMode:
        DragMode =
        alreadySelected
            ? 'DESELECT'
            : 'SELECT';

    setDragging(true);

    setDragMode(
        nextDragMode,
    );

    applyDragSelection(
        seatId,
        nextDragMode,
    );
  }

  function handleSeatPointerEnter(
      seatId: number,
  ) {
    if (
        mode !== 'EDIT' ||
        !dragging ||
        !dragMode
    ) {
      return;
    }

    applyDragSelection(
        seatId,
        dragMode,
    );
  }

  function applyDragSelection(
      seatId: number,
      selectionMode:
      Exclude<
          DragMode,
          null
      >,
  ) {
    setSelectedSeatIds(
        (current) => {
          const next =
              new Set(
                  current,
              );

          if (
              selectionMode ===
              'SELECT'
          ) {
            next.add(
                seatId,
            );
          } else {
            next.delete(
                seatId,
            );
          }

          return next;
        },
    );
  }

  function selectCurrentPage() {
    setSelectedSeatIds(
        new Set(
            seats.map(
                (seat) =>
                    seat.seatId,
            ),
        ),
    );
  }

  /*
   * ---------------------------------------------------------
   * 생성 완료
   * ---------------------------------------------------------
   */
  async function handleCreated() {
    setBulkCreateOpen(
        false,
    );

    setSuccessMessage(
        '좌석이 생성되었습니다.',
    );

    clearSelection();

    if (page !== 0) {
      setPage(0);

      return;
    }

    await loadSeats(0);
  }

  /*
   * ---------------------------------------------------------
   * 단일 좌석 저장
   * ---------------------------------------------------------
   */
  async function saveSingleSeat(
      request: SingleSeatEditValue,
  ) {
    if (
        !singleSelectedSeat
    ) {
      return;
    }

    setSaving(true);

    setErrorMessage('');
    setSuccessMessage('');

    try {
      const original =
          singleSelectedSeat;

      const informationChanged =
          original.sectionName !==
          request.sectionName ||
          original.floor !==
          request.floor ||
          original.rowName !==
          request.rowName ||
          original.seatNumber !==
          request.seatNumber ||
          original.seatType !==
          request.seatType;

      const statusChanged =
          original.status !==
          request.status;

      if (
          !informationChanged &&
          !statusChanged
      ) {
        setSuccessMessage(
            '변경된 내용이 없습니다.',
        );

        return;
      }

      if (informationChanged) {
        await updateSeat(
            original.seatId,
            {
              sectionName:
              request.sectionName,

              floor:
              request.floor,

              rowName:
              request.rowName,

              seatNumber:
              request.seatNumber,

              seatType:
              request.seatType,
            },
        );
      }

      if (statusChanged) {
        await updateSeatStatus(
            original.seatId,
            {
              status:
              request.status,
            },
        );
      }

      setSuccessMessage(
          `${request.rowName}${request.seatNumber} 좌석이 수정되었습니다.`,
      );

      await loadSeats(
          page,
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '좌석 수정에 실패했습니다.',
          ),
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * 다중 좌석 저장
   * ---------------------------------------------------------
   */
  async function saveMultipleSeats(
      request:
      MultiSeatEditValue,
  ) {
    if (
        selectedSeats.length <
        2
    ) {
      return;
    }

    if (
        !request.seatType &&
        !request.status
    ) {
      setErrorMessage(
          '변경할 좌석 유형 또는 상태를 선택해주세요.',
      );

      return;
    }

    setSaving(true);

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await bulkUpdateSeats(
          venueHallId,
          {
            seatIds:
                selectedSeats.map(
                    (seat) =>
                        seat.seatId,
                ),

            seatType:
                request.seatType ||
                null,

            status:
                request.status ||
                null,
          },
      );

      const count =
          selectedSeats.length;

      setSuccessMessage(
          `${count}개 좌석이 수정되었습니다.`,
      );

      clearSelection();

      await loadSeats(
          page,
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '선택한 좌석을 수정하지 못했습니다.',
          ),
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * 페이징
   * ---------------------------------------------------------
   */
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

  function movePage(
      targetPage: number,
  ) {
    clearSelection();

    setPage(
        targetPage,
    );
  }

  return (
      <>
        <div className="mx-auto w-full min-w-0 max-w-[1800px]">
          {/*
         * =====================================================
         * Header
         * =====================================================
         */}
          <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
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

                공연홀 관리
              </button>

              <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-600">
                Venue Seat Editor
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                좌석 관리
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                공연홀 #{venueHallId}의
                좌석 배치와 운영 상태를 관리합니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex rounded-xl border border-slate-300 bg-white p-1">
                <button
                    type="button"
                    onClick={() =>
                        changeMode(
                            'VIEW',
                        )
                    }
                    className={[
                      'flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition',
                      mode ===
                      'VIEW'
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-50',
                    ].join(
                        ' ',
                    )}
                >
                  <MousePointer2
                      size={14}
                  />

                  보기
                </button>

                <button
                    type="button"
                    onClick={() =>
                        changeMode(
                            'EDIT',
                        )
                    }
                    className={[
                      'flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition',
                      mode ===
                      'EDIT'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:bg-slate-50',
                    ].join(
                        ' ',
                    )}
                >
                  <Edit3
                      size={14}
                  />

                  편집
                </button>
              </div>

              <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                      void loadSeats(
                          page,
                      )
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
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

              <button
                  type="button"
                  onClick={() =>
                      setBulkCreateOpen(
                          true,
                      )
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                <Plus
                    size={17}
                />

                좌석 추가
              </button>
            </div>
          </header>

          {successMessage && (
              <div
                  role="status"
                  className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                <Check
                    size={16}
                />

                {successMessage}
              </div>
          )}

          {errorMessage && (
              <div
                  role="alert"
                  className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <X
                    size={16}
                    className="mt-0.5 shrink-0"
                />

                {errorMessage}
              </div>
          )}

          {/*
         * =====================================================
         * Filter
         * =====================================================
         */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[110px_160px_170px_minmax(250px,1fr)_auto_auto] xl:items-end">
              <FilterField
                  label="층"
              >
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
                    className={INPUT_CLASS}
                />
              </FilterField>

              <FilterField
                  label="상태"
              >
                <select
                    value={status}
                    onChange={(event) => {
                      clearSelection();

                      setStatus(
                          event.target
                              .value as
                              | SeatStatus
                              | '',
                      );

                      setPage(0);
                    }}
                    className={INPUT_CLASS}
                >
                  <option value="">
                    전체
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
              </FilterField>

              <FilterField
                  label="좌석 유형"
              >
                <select
                    value={
                      seatType
                    }
                    onChange={(event) => {
                      clearSelection();

                      setSeatType(
                          event.target
                              .value as
                              | SeatType
                              | '',
                      );

                      setPage(0);
                    }}
                    className={INPUT_CLASS}
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
              </FilterField>

              <FilterField
                  label="좌석 검색"
              >
                <div className="relative">
                  <Search
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                      placeholder="구역, 행, 좌석번호"
                      className={`${INPUT_CLASS} pl-10`}
                  />
                </div>
              </FilterField>

              <button
                  type="button"
                  onClick={
                    handleSearch
                  }
                  className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                검색
              </button>

              <button
                  type="button"
                  onClick={
                    handleResetFilters
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw
                    size={15}
                />

                초기화
              </button>
            </div>
          </section>

          {/*
         * =====================================================
         * Edit Toolbar
         * =====================================================
         */}
          {mode ===
              'EDIT' && (
                  <section className="mt-4 flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-indigo-950">
                        좌석 편집 모드
                      </p>

                      <p className="mt-0.5 text-xs text-indigo-700">
                        좌석을 누른 상태로
                        다른 좌석 위를 드래그하면
                        여러 좌석을 빠르게 선택할 수 있습니다.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-indigo-700 shadow-sm">
                {selectedSeats.length}
                개 선택
              </span>

                      <button
                          type="button"
                          disabled={
                              seats.length ===
                              0
                          }
                          onClick={
                            selectCurrentPage
                          }
                          className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 disabled:opacity-40"
                      >
                        현재 페이지 전체
                      </button>

                      <button
                          type="button"
                          disabled={
                              selectedSeats.length ===
                              0
                          }
                          onClick={
                            clearSelection
                          }
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-indigo-700 disabled:opacity-40"
                      >
                        선택 해제
                      </button>
                    </div>
                  </section>
              )}

          {/*
         * =====================================================
         * Main Editor
         * =====================================================
         */}
          <section className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
            <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-4 py-4 sm:px-5">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    좌석 배치도
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    A1, A2, B1 형식으로
                    좌석 위치를 표시합니다.
                  </p>
                </div>

                <p className="text-xs text-slate-500">
                  총{' '}
                  <strong className="text-slate-800">
                    {(
                        data?.totalElements ??
                        0
                    ).toLocaleString()}
                  </strong>
                  석
                </p>
              </div>

              {loading ? (
                  <LoadingSeatMap />
              ) : groupedSeats.length ===
              0 ? (
                  <EmptySeatMap />
              ) : (
                  <div className="overflow-auto p-4 select-none sm:p-6">
                    <div className="mx-auto min-w-[650px] max-w-[1100px]">
                      <div className="mx-auto mb-8 w-[72%]">
                        <div className="rounded-t-[100%] border-t-[5px] border-slate-300 bg-gradient-to-b from-slate-100 to-white py-4 text-center">
                      <span className="text-xs font-bold tracking-[0.35em] text-slate-400">
                        STAGE
                      </span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {groupedSeats.map(
                            (group) => (
                                <SeatRow
                                    key={
                                      group.key
                                    }
                                    group={
                                      group
                                    }
                                    selectedSeatIds={
                                      selectedSeatIds
                                    }
                                    onPointerDown={
                                      handleSeatPointerDown
                                    }
                                    onPointerEnter={
                                      handleSeatPointerEnter
                                    }
                                />
                            ),
                        )}
                      </div>
                    </div>
                  </div>
              )}

              {data && (
                  <Pagination
                      data={data}
                      pageNumbers={
                        pageNumbers
                      }
                      loading={
                        loading
                      }
                      onPageChange={
                        movePage
                      }
                  />
              )}
            </div>

            {/*
           * ===================================================
           * Right Panel
           * ===================================================
           */}
            <aside>
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900">
                  {selectedSeats.length >
                  1
                      ? '선택 좌석 일괄 편집'
                      : '좌석 정보'}
                </h2>

                {selectedSeats.length ===
                0 ? (
                    <EmptySelection
                        editMode={
                            mode ===
                            'EDIT'
                        }
                    />
                ) : selectedSeats.length ===
                1 &&
                singleSelectedSeat ? (
                    <SingleSeatEditor
                        key={`${singleSelectedSeat.seatId}-${singleSelectedSeat.sectionName}-${singleSelectedSeat.rowName}-${singleSelectedSeat.seatNumber}-${singleSelectedSeat.status}`}
                        seat={
                          singleSelectedSeat
                        }
                        saving={
                          saving
                        }
                        editable={
                            mode ===
                            'EDIT'
                        }
                        onSave={
                          saveSingleSeat
                        }
                        onClear={
                          clearSelection
                        }
                    />
                ) : (
                    <MultiSeatEditor
                        count={
                          selectedSeats.length
                        }
                        saving={
                          saving
                        }
                        onSave={
                          saveMultipleSeats
                        }
                        onClear={
                          clearSelection
                        }
                    />
                )}
              </div>
            </aside>
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
      </>
  );
}

/*
 * =============================================================
 * 좌석 행
 * =============================================================
 */

interface SeatRowProps {
  group: SeatRowGroup;

  selectedSeatIds:
      Set<number>;

  onPointerDown: (
      event:
      PointerEvent<HTMLButtonElement>,
      seatId: number,
  ) => void;

  onPointerEnter: (
      seatId: number,
  ) => void;
}

function SeatRow({
                   group,
                   selectedSeatIds,
                   onPointerDown,
                   onPointerEnter,
                 }: SeatRowProps) {
  return (
      <section>
        <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-slate-900 px-2 py-1 text-[10px] font-bold text-white">
          {group.floor}F
        </span>

          <span className="text-xs font-bold text-slate-600">
          {group.sectionName}
        </span>
        </div>

        <div className="flex min-w-max items-center gap-3">
          <div className="w-8 shrink-0 text-right text-xs font-bold text-slate-400">
            {group.rowName}
          </div>

          <div className="flex flex-1 flex-wrap justify-center gap-1.5">
            {group.seats.map(
                (seat) => {
                  const selected =
                      selectedSeatIds.has(
                          seat.seatId,
                      );

                  const seatCode =
                      `${seat.rowName}${seat.seatNumber}`;

                  return (
                      <button
                          key={
                            seat.seatId
                          }
                          type="button"
                          title={`${seat.sectionName} ${seatCode} · ${TYPE_LABELS[seat.seatType]} · ${STATUS_LABELS[seat.status]}`}
                          onPointerDown={(
                              event,
                          ) =>
                              onPointerDown(
                                  event,
                                  seat.seatId,
                              )
                          }
                          onPointerEnter={() =>
                              onPointerEnter(
                                  seat.seatId,
                              )
                          }
                          className={[
                            'flex h-7 min-w-7 shrink-0 touch-none items-center justify-center rounded-[5px] border px-1',
                            'text-[9px] font-bold shadow-sm transition',
                            'hover:-translate-y-0.5 hover:shadow-md',
                            selected
                                ? 'z-10 border-indigo-700 bg-indigo-600 text-white ring-2 ring-indigo-200'
                                : STATUS_STYLES[
                                    seat.status
                                    ],
                          ].join(
                              ' ',
                          )}
                      >
                        {seatCode}
                      </button>
                  );
                },
            )}
          </div>

          <div className="w-8 shrink-0 text-xs font-bold text-slate-400">
            {group.rowName}
          </div>
        </div>
      </section>
  );
}

/*
 * =============================================================
 * 단일 좌석 Inline Editor
 * =============================================================
 */

interface SingleSeatEditValue {
  sectionName: string;
  floor: number;
  rowName: string;
  seatNumber: string;
  seatType: SeatType;
  status: SeatStatus;
}

interface SingleSeatEditorProps {
  seat: AdminSeat;
  saving: boolean;
  editable: boolean;

  onSave: (
      value:
      SingleSeatEditValue,
  ) => Promise<void>;

  onClear: () => void;
}

function SingleSeatEditor({
                            seat,
                            saving,
                            editable,
                            onSave,
                            onClear,
                          }: SingleSeatEditorProps) {
  const [
    sectionName,
    setSectionName,
  ] =
      useState(
          seat.sectionName,
      );

  const [
    floor,
    setFloor,
  ] =
      useState(
          String(
              seat.floor,
          ),
      );

  const [
    rowName,
    setRowName,
  ] =
      useState(
          seat.rowName,
      );

  const [
    seatNumber,
    setSeatNumber,
  ] =
      useState(
          seat.seatNumber,
      );

  const [
    seatType,
    setSeatType,
  ] =
      useState<SeatType>(
          seat.seatType,
      );

  const [
    status,
    setStatus,
  ] =
      useState<SeatStatus>(
          seat.status,
      );

  const seatCode =
      `${seat.rowName}${seat.seatNumber}`;

  async function handleSave() {
    const parsedFloor =
        Number(
            floor,
        );

    if (
        !sectionName.trim() ||
        !rowName.trim() ||
        !seatNumber.trim()
    ) {
      return;
    }

    if (
        !Number.isInteger(
            parsedFloor,
        ) ||
        parsedFloor <= 0
    ) {
      return;
    }

    await onSave({
      sectionName:
          sectionName.trim(),

      floor:
      parsedFloor,

      rowName:
          rowName.trim(),

      seatNumber:
          seatNumber.trim(),

      seatType,
      status,
    });
  }

  return (
      <div className="mt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-black text-slate-950">
              {seatCode}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Seat #{seat.seatId}
            </p>
          </div>

          <StatusBadge
              status={
                seat.status
              }
          />
        </div>

        {!editable ? (
            <dl className="mt-6 space-y-4">
              <InfoRow
                  label="층"
                  value={`${seat.floor}층`}
              />

              <InfoRow
                  label="구역"
                  value={
                    seat.sectionName
                  }
              />

              <InfoRow
                  label="행"
                  value={
                    seat.rowName
                  }
              />

              <InfoRow
                  label="번호"
                  value={
                    seat.seatNumber
                  }
              />

              <InfoRow
                  label="좌석 유형"
                  value={
                    TYPE_LABELS[
                        seat.seatType
                        ]
                  }
              />

              <button
                  type="button"
                  onClick={
                    onClear
                  }
                  className="mt-4 w-full rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-600"
              >
                선택 해제
              </button>
            </dl>
        ) : (
            <div className="mt-6 space-y-4">
              <EditorField
                  label="구역"
              >
                <input
                    value={
                      sectionName
                    }
                    disabled={
                      saving
                    }
                    onChange={(event) =>
                        setSectionName(
                            event.target.value,
                        )
                    }
                    className={INPUT_CLASS}
                />
              </EditorField>

              <div className="grid grid-cols-2 gap-3">
                <EditorField
                    label="층"
                >
                  <input
                      type="number"
                      min={1}
                      value={floor}
                      disabled={
                        saving
                      }
                      onChange={(event) =>
                          setFloor(
                              event.target.value,
                          )
                      }
                      className={INPUT_CLASS}
                  />
                </EditorField>

                <EditorField
                    label="행"
                >
                  <input
                      value={
                        rowName
                      }
                      disabled={
                        saving
                      }
                      onChange={(event) =>
                          setRowName(
                              event.target.value,
                          )
                      }
                      className={INPUT_CLASS}
                  />
                </EditorField>
              </div>

              <EditorField
                  label="좌석 번호"
              >
                <input
                    value={
                      seatNumber
                    }
                    disabled={
                      saving
                    }
                    onChange={(event) =>
                        setSeatNumber(
                            event.target.value,
                        )
                    }
                    className={INPUT_CLASS}
                />
              </EditorField>

              <EditorField
                  label="좌석 유형"
              >
                <select
                    value={
                      seatType
                    }
                    disabled={
                      saving
                    }
                    onChange={(event) =>
                        setSeatType(
                            event.target
                                .value as SeatType,
                        )
                    }
                    className={INPUT_CLASS}
                >
                  <SeatTypeOptions />
                </select>
              </EditorField>

              <EditorField
                  label="상태"
              >
                <select
                    value={status}
                    disabled={
                      saving
                    }
                    onChange={(event) =>
                        setStatus(
                            event.target
                                .value as SeatStatus,
                        )
                    }
                    className={INPUT_CLASS}
                >
                  <SeatStatusOptions />
                </select>
              </EditorField>

              <div className="flex gap-2 pt-2">
                <button
                    type="button"
                    disabled={
                      saving
                    }
                    onClick={
                      onClear
                    }
                    className="h-11 flex-1 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600"
                >
                  취소
                </button>

                <button
                    type="button"
                    disabled={
                      saving
                    }
                    onClick={() =>
                        void handleSave()
                    }
                    className="h-11 flex-[1.4] rounded-xl bg-indigo-600 text-sm font-semibold text-white disabled:bg-slate-300"
                >
                  {saving
                      ? '저장 중...'
                      : '변경사항 저장'}
                </button>
              </div>
            </div>
        )}
      </div>
  );
}

/*
 * =============================================================
 * 다중 좌석 Editor
 * =============================================================
 */

interface MultiSeatEditValue {
  seatType:
      | SeatType
      | '';

  status:
      | SeatStatus
      | '';
}

interface MultiSeatEditorProps {
  count: number;
  saving: boolean;

  onSave: (
      value:
      MultiSeatEditValue,
  ) => Promise<void>;

  onClear: () => void;
}

function MultiSeatEditor({
                           count,
                           saving,
                           onSave,
                           onClear,
                         }: MultiSeatEditorProps) {
  const [
    seatType,
    setSeatType,
  ] =
      useState<
          SeatType | ''
      >('');

  const [
    status,
    setStatus,
  ] =
      useState<
          SeatStatus | ''
      >('');

  return (
      <div className="mt-5">
        <div className="rounded-xl bg-indigo-50 p-4">
          <p className="text-xs font-semibold text-indigo-600">
            선택된 좌석
          </p>

          <p className="mt-1 text-3xl font-black text-indigo-950">
            {count}
            <span className="ml-1 text-sm font-semibold">
            석
          </span>
          </p>

          <p className="mt-2 text-xs leading-5 text-indigo-700">
            선택한 모든 좌석에
            같은 변경사항을 적용합니다.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <EditorField
              label="좌석 유형"
          >
            <select
                value={
                  seatType
                }
                disabled={
                  saving
                }
                onChange={(event) =>
                    setSeatType(
                        event.target
                            .value as
                            | SeatType
                            | '',
                    )
                }
                className={INPUT_CLASS}
            >
              <option value="">
                변경 안 함
              </option>

              <SeatTypeOptions />
            </select>
          </EditorField>

          <EditorField
              label="상태"
          >
            <select
                value={status}
                disabled={
                  saving
                }
                onChange={(event) =>
                    setStatus(
                        event.target
                            .value as
                            | SeatStatus
                            | '',
                    )
                }
                className={INPUT_CLASS}
            >
              <option value="">
                변경 안 함
              </option>

              <SeatStatusOptions />
            </select>
          </EditorField>

          <button
              type="button"
              disabled={
                  saving ||
                  (!seatType &&
                      !status)
              }
              onClick={() =>
                  void onSave({
                    seatType,
                    status,
                  })
              }
              className="h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving
                ? '적용 중...'
                : `${count}개 좌석에 적용`}
          </button>

          <button
              type="button"
              disabled={saving}
              onClick={
                onClear
              }
              className="h-10 w-full rounded-xl text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            선택 해제
          </button>
        </div>
      </div>
  );
}

/*
 * =============================================================
 * 공통
 * =============================================================
 */

const INPUT_CLASS =
    'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100';

interface FilterFieldProps {
  label: string;
  children:
      React.ReactNode;
}

function FilterField({
                       label,
                       children,
                     }: FilterFieldProps) {
  return (
      <label>
      <span className="text-xs font-semibold text-slate-500">
        {label}
      </span>

        <div className="mt-2">
          {children}
        </div>
      </label>
  );
}

interface EditorFieldProps {
  label: string;
  children:
      React.ReactNode;
}

function EditorField({
                       label,
                       children,
                     }: EditorFieldProps) {
  return (
      <label className="block">
      <span className="text-xs font-semibold text-slate-500">
        {label}
      </span>

        <div className="mt-2">
          {children}
        </div>
      </label>
  );
}

function SeatTypeOptions() {
  return (
      <>
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
      </>
  );
}

function SeatStatusOptions() {
  return (
      <>
        <option value="ACTIVE">
          활성
        </option>

        <option value="INACTIVE">
          비활성
        </option>

        <option value="MAINTENANCE">
          유지보수
        </option>
      </>
  );
}

function StatusBadge({
                       status,
                     }: {
  status: SeatStatus;
}) {
  return (
      <span
          className={[
            'rounded-full border px-2.5 py-1 text-[11px] font-bold',
            STATUS_STYLES[
                status
                ],
          ].join(
              ' ',
          )}
      >
      {
        STATUS_LABELS[
            status
            ]
      }
    </span>
  );
}

function InfoRow({
                   label,
                   value,
                 }: {
  label: string;
  value: string;
}) {
  return (
      <div className="flex items-center justify-between gap-4">
        <dt className="text-xs text-slate-400">
          {label}
        </dt>

        <dd className="text-sm font-semibold text-slate-700">
          {value}
        </dd>
      </div>
  );
}

function EmptySelection({
                          editMode,
                        }: {
  editMode: boolean;
}) {
  return (
      <div className="py-12 text-center">
        <MousePointer2
            size={25}
            className="mx-auto text-slate-300"
        />

        <p className="mt-4 text-sm font-semibold text-slate-600">
          좌석을 선택해주세요.
        </p>

        <p className="mx-auto mt-2 max-w-52 text-xs leading-5 text-slate-400">
          {editMode
              ? '좌석을 클릭하거나 드래그해서 여러 좌석을 선택할 수 있습니다.'
              : '좌석을 클릭하면 상세 정보를 확인할 수 있습니다.'}
        </p>
      </div>
  );
}

function LoadingSeatMap() {
  return (
      <div className="flex min-h-[520px] flex-col items-center justify-center">
        <RefreshCw
            size={24}
            className="animate-spin text-indigo-500"
        />

        <p className="mt-4 text-sm text-slate-500">
          좌석 배치를 불러오고 있습니다.
        </p>
      </div>
  );
}

function EmptySeatMap() {
  return (
      <div className="flex min-h-[520px] flex-col items-center justify-center px-5 text-center">
        <p className="text-sm font-semibold text-slate-700">
          조회된 좌석이 없습니다.
        </p>

        <p className="mt-2 text-xs text-slate-400">
          검색 조건을 변경하거나 좌석을 추가해주세요.
        </p>
      </div>
  );
}

interface PaginationProps {
  data:
      GetAdminSeatsResponse;

  pageNumbers:
      number[];

  loading:
      boolean;

  onPageChange: (
      page: number,
  ) => void;
}

function Pagination({
                      data,
                      pageNumbers,
                      loading,
                      onPageChange,
                    }: PaginationProps) {
  return (
      <footer className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-sm text-slate-500">
          총{' '}
          <strong className="text-slate-800">
            {data.totalElements.toLocaleString()}
          </strong>
          석
        </p>

        {data.totalPages >
            0 && (
                <div className="flex max-w-full items-center gap-1 overflow-x-auto">
                  <button
                      type="button"
                      disabled={
                          data.first ||
                          loading
                      }
                      onClick={() =>
                          onPageChange(
                              Math.max(
                                  0,
                                  data.page -
                                  1,
                              ),
                          )
                      }
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 disabled:opacity-40"
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
                                  onPageChange(
                                      pageNumber,
                                  )
                              }
                              className={[
                                'size-9 shrink-0 rounded-lg text-sm font-semibold',
                                data.page ===
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
                          onPageChange(
                              data.page +
                              1,
                          )
                      }
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 disabled:opacity-40"
                  >
                    <ChevronRight
                        size={17}
                    />
                  </button>
                </div>
            )}
      </footer>
  );
}
