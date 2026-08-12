import {
  ArrowLeft,
  Check,
  Edit3,
  Layers3,
  MousePointer2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import {
  type PointerEvent,
  type ReactNode,
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
  bulkDeleteSeats,
  bulkUpdateSeats,
  getAdminSeatMap,
  updateSeat,
  updateSeatStatus,
} from '../api/adminSeatApi';

import BulkCreateSeatModal
  from '../components/BulkCreateSeatModal';

import DeleteSeatConfirmModal
  from '../components/DeleteSeatConfirmModal';

import type {
  AdminSeat,
  SeatStatus,
  SeatType,
} from '../types/adminSeat';

/*
 * ============================================================
 * Types
 * ============================================================
 */

type PageMode =
    | 'VIEW'
    | 'EDIT';

type DragMode =
    | 'SELECT'
    | 'DESELECT'
    | null;

type FloorFilter =
    | 'ALL'
    | number;

type SeatDensity =
    | 'COMPACT'
    | 'NORMAL'
    | 'COMFORTABLE';

interface SeatRowGroup {
  key: string;
  rowName: string;
  seats: AdminSeat[];
}

interface SeatSectionGroup {
  key: string;
  sectionName: string;
  rows: SeatRowGroup[];
  seatCount: number;
}

interface SeatFloorGroup {
  floor: number;
  sections: SeatSectionGroup[];
  seatCount: number;
}

/*
 * ============================================================
 * Constants
 * ============================================================
 */

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

const DENSITY_LABELS:
    Record<SeatDensity, string> = {
  COMPACT: '컴팩트',
  NORMAL: '기본',
  COMFORTABLE: '넓게',
};

const DENSITY_CONFIG:
    Record<
        SeatDensity,
        {
          seatClass: string;
          seatGapClass: string;
          aisleClass: string;
          rowGapClass: string;
        }
    > = {
  COMPACT: {
    seatClass:
        'h-5 min-w-5 px-0.5 text-[7px] rounded-[3px]',

    seatGapClass:
        'gap-[3px]',

    aisleClass:
        'ml-2.5',

    rowGapClass:
        'space-y-0.5',
  },

  NORMAL: {
    seatClass:
        'h-8 min-w-8 px-1.5 text-[10px] rounded-md',

    seatGapClass:
        'gap-1.5',

    aisleClass:
        'ml-6',

    rowGapClass:
        'space-y-2',
  },

  COMFORTABLE: {
    seatClass:
        'h-9 min-w-9 px-2 text-[11px] rounded-lg',

    seatGapClass:
        'gap-2',

    aisleClass:
        'ml-9',

    rowGapClass:
        'space-y-3',
  },
};

const INPUT_CLASS =
    'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100';

/*
 * ============================================================
 * Page
 * ============================================================
 */

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

  /*
   * ----------------------------------------------------------
   * Data
   * ----------------------------------------------------------
   */

  const [
    seats,
    setSeats,
  ] =
      useState<AdminSeat[]>(
          [],
      );

  const [
    loading,
    setLoading,
  ] =
      useState(true);

  const [
    saving,
    setSaving,
  ] =
      useState(false);

  const [
    deleting,
    setDeleting,
  ] =
      useState(false);

  /*
   * ----------------------------------------------------------
   * View
   * ----------------------------------------------------------
   */

  const [
    mode,
    setMode,
  ] =
      useState<PageMode>(
          'VIEW',
      );

  const [
    density,
    setDensity,
  ] =
      useState<SeatDensity>(
          'NORMAL',
      );

  const [
    keyword,
    setKeyword,
  ] =
      useState('');

  const [
    activeFloor,
    setActiveFloor,
  ] =
      useState<FloorFilter>(
          'ALL',
      );

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

  /*
   * ----------------------------------------------------------
   * Selection
   * ----------------------------------------------------------
   */

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
  ] =
      useState(false);

  const [
    dragMode,
    setDragMode,
  ] =
      useState<DragMode>(
          null,
      );

  /*
   * ----------------------------------------------------------
   * Modal
   * ----------------------------------------------------------
   */

  const [
    bulkCreateOpen,
    setBulkCreateOpen,
  ] =
      useState(false);

  const [
    deleteConfirmOpen,
    setDeleteConfirmOpen,
  ] =
      useState(false);

  /*
   * ----------------------------------------------------------
   * Message
   * ----------------------------------------------------------
   */

  const [
    successMessage,
    setSuccessMessage,
  ] =
      useState('');

  const [
    errorMessage,
    setErrorMessage,
  ] =
      useState('');

  /*
   * ==========================================================
   * Load
   * ==========================================================
   */

  const loadSeats =
      useCallback(
          async () => {
            if (
                !Number.isInteger(
                    venueHallId,
                ) ||
                venueHallId <=
                0
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
                  await getAdminSeatMap(
                      venueHallId,
                      {},
                  );

              setSeats(
                  response.seats,
              );
            } catch (error) {
              setErrorMessage(
                  getApiErrorMessage(
                      error,
                      '좌석 배치도를 불러오지 못했습니다.',
                  ),
              );
            } finally {
              setLoading(false);
            }
          },
          [
            venueHallId,
          ],
      );

  useEffect(() => {
    void loadSeats();
  }, [
    loadSeats,
  ]);

  useEffect(() => {
    function finishDrag() {
      setDragging(false);
      setDragMode(null);
    }

    window.addEventListener(
        'pointerup',
        finishDrag,
    );

    return () => {
      window.removeEventListener(
          'pointerup',
          finishDrag,
      );
    };
  }, []);

  /*
   * ==========================================================
   * Filter
   * ==========================================================
   */

  const floors =
      useMemo(
          () =>
              Array
              .from(
                  new Set(
                      seats.map(
                          (seat) =>
                              seat.floor,
                      ),
                  ),
              )
              .sort(
                  (
                      first,
                      second,
                  ) =>
                      first -
                      second,
              ),
          [
            seats,
          ],
      );

  const floorSeatCounts =
      useMemo(
          () => {
            const result =
                new Map<
                    number,
                    number
                >();

            for (
                const seat of
                seats
                ) {
              result.set(
                  seat.floor,
                  (
                      result.get(
                          seat.floor,
                      ) ??
                      0
                  ) +
                  1,
              );
            }

            return result;
          },
          [
            seats,
          ],
      );

  const filteredSeats =
      useMemo(
          () => {
            const normalizedKeyword =
                keyword
                .trim()
                .toLowerCase();

            return seats.filter(
                (seat) => {
                  if (
                      activeFloor !==
                      'ALL' &&
                      seat.floor !==
                      activeFloor
                  ) {
                    return false;
                  }

                  if (
                      seatType &&
                      seat.seatType !==
                      seatType
                  ) {
                    return false;
                  }

                  if (
                      status &&
                      seat.status !==
                      status
                  ) {
                    return false;
                  }

                  if (
                      !normalizedKeyword
                  ) {
                    return true;
                  }

                  const searchable =
                      [
                        seat.sectionName,
                        seat.rowName,
                        seat.seatNumber,
                        `${seat.rowName}${seat.seatNumber}`,
                        `${seat.floor}층`,
                      ]
                      .join(
                          ' ',
                      )
                      .toLowerCase();

                  return searchable.includes(
                      normalizedKeyword,
                  );
                },
            );
          },
          [
            seats,
            keyword,
            activeFloor,
            seatType,
            status,
          ],
      );

  /*
   * ==========================================================
   * Group
   * ==========================================================
   */

  const floorGroups =
      useMemo<SeatFloorGroup[]>(
          () => {
            const floorMap =
                new Map<
                    number,
                    Map<
                        string,
                        Map<
                            string,
                            AdminSeat[]
                        >
                    >
                >();

            for (
                const seat of
                filteredSeats
                ) {
              let sectionMap =
                  floorMap.get(
                      seat.floor,
                  );

              if (
                  !sectionMap
              ) {
                sectionMap =
                    new Map();

                floorMap.set(
                    seat.floor,
                    sectionMap,
                );
              }

              let rowMap =
                  sectionMap.get(
                      seat.sectionName,
                  );

              if (
                  !rowMap
              ) {
                rowMap =
                    new Map();

                sectionMap.set(
                    seat.sectionName,
                    rowMap,
                );
              }

              const rowSeats =
                  rowMap.get(
                      seat.rowName,
                  ) ??
                  [];

              rowSeats.push(
                  seat,
              );

              rowMap.set(
                  seat.rowName,
                  rowSeats,
              );
            }

            return Array
            .from(
                floorMap.entries(),
            )
            .sort(
                (
                    [first],
                    [second],
                ) =>
                    first -
                    second,
            )
            .map(
                ([
                   floor,
                   sectionMap,
                 ]) => {
                  const sections =
                      Array
                      .from(
                          sectionMap.entries(),
                      )
                      .sort(
                          (
                              [first],
                              [second],
                          ) =>
                              first.localeCompare(
                                  second,
                                  undefined,
                                  {
                                    numeric:
                                        true,
                                  },
                              ),
                      )
                      .map(
                          ([
                             sectionName,
                             rowMap,
                           ]) => {
                            const rows =
                                Array
                                .from(
                                    rowMap.entries(),
                                )
                                .sort(
                                    (
                                        [first],
                                        [second],
                                    ) =>
                                        first.localeCompare(
                                            second,
                                            undefined,
                                            {
                                              numeric:
                                                  true,
                                            },
                                        ),
                                )
                                .map(
                                    ([
                                       rowName,
                                       rowSeats,
                                     ]) => ({
                                      key:
                                          `${floor}-${sectionName}-${rowName}`,

                                      rowName,

                                      seats:
                                          [
                                            ...rowSeats,
                                          ].sort(
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
                                                        numeric:
                                                            true,
                                                      },
                                                  ),
                                          ),
                                    }),
                                );

                            return {
                              key:
                                  `${floor}-${sectionName}`,

                              sectionName,

                              rows,

                              seatCount:
                                  rows.reduce(
                                      (
                                          sum,
                                          row,
                                      ) =>
                                          sum +
                                          row.seats.length,
                                      0,
                                  ),
                            };
                          },
                      );

                  return {
                    floor,

                    sections,

                    seatCount:
                        sections.reduce(
                            (
                                sum,
                                section,
                            ) =>
                                sum +
                                section.seatCount,
                            0,
                        ),
                  };
                },
            );
          },
          [
            filteredSeats,
          ],
      );

  /*
   * ==========================================================
   * Selection
   * ==========================================================
   */

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
      selectedSeats.length ===
      1
          ? selectedSeats[0]
          : null;

  function clearSelection() {
    setSelectedSeatIds(
        new Set(),
    );

    setDragging(false);
    setDragMode(null);
  }

  function changeMode(
      nextMode:
      PageMode,
  ) {
    setMode(
        nextMode,
    );

    clearSelection();

    setSuccessMessage('');
    setErrorMessage('');
  }

  function handleSeatPointerDown(
      event:
      PointerEvent<HTMLButtonElement>,
      seatId:
      number,
  ) {
    if (
        mode ===
        'VIEW'
    ) {
      setSelectedSeatIds(
          new Set([
            seatId,
          ]),
      );

      return;
    }

    event.preventDefault();

    const alreadySelected =
        selectedSeatIds.has(
            seatId,
        );

    const nextMode:
        Exclude<
            DragMode,
            null
        > =
        alreadySelected
            ? 'DESELECT'
            : 'SELECT';

    setDragging(true);

    setDragMode(
        nextMode,
    );

    applySelection(
        seatId,
        nextMode,
    );
  }

  function handleSeatPointerEnter(
      seatId:
      number,
  ) {
    if (
        mode !==
        'EDIT' ||
        !dragging ||
        !dragMode
    ) {
      return;
    }

    applySelection(
        seatId,
        dragMode,
    );
  }

  function applySelection(
      seatId:
      number,
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

  function toggleSeatGroup(
      groupSeats:
      AdminSeat[],
  ) {
    if (
        mode !==
        'EDIT'
    ) {
      return;
    }

    setSelectedSeatIds(
        (current) => {
          const next =
              new Set(
                  current,
              );

          const allSelected =
              groupSeats.every(
                  (seat) =>
                      next.has(
                          seat.seatId,
                      ),
              );

          for (
              const seat of
              groupSeats
              ) {
            if (
                allSelected
            ) {
              next.delete(
                  seat.seatId,
              );
            } else {
              next.add(
                  seat.seatId,
              );
            }
          }

          return next;
        },
    );
  }

  function selectVisibleSeats() {
    setSelectedSeatIds(
        new Set(
            filteredSeats.map(
                (seat) =>
                    seat.seatId,
            ),
        ),
    );
  }

  /*
   * ==========================================================
   * Create
   * ==========================================================
   */

  async function handleCreated() {
    setBulkCreateOpen(
        false,
    );

    clearSelection();

    setSuccessMessage(
        '좌석이 생성되었습니다.',
    );

    await loadSeats();
  }

  /*
   * ==========================================================
   * Update
   * ==========================================================
   */

  async function saveSingleSeat(
      value:
      SingleSeatEditValue,
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
          value.sectionName ||
          original.floor !==
          value.floor ||
          original.rowName !==
          value.rowName ||
          original.seatNumber !==
          value.seatNumber ||
          original.seatType !==
          value.seatType;

      const statusChanged =
          original.status !==
          value.status;

      if (
          !informationChanged &&
          !statusChanged
      ) {
        setSuccessMessage(
            '변경된 내용이 없습니다.',
        );

        return;
      }

      if (
          informationChanged
      ) {
        await updateSeat(
            original.seatId,
            {
              sectionName:
              value.sectionName,

              floor:
              value.floor,

              rowName:
              value.rowName,

              seatNumber:
              value.seatNumber,

              seatType:
              value.seatType,
            },
        );
      }

      if (
          statusChanged
      ) {
        await updateSeatStatus(
            original.seatId,
            {
              status:
              value.status,
            },
        );
      }

      setSuccessMessage(
          `${value.floor}층 ${value.sectionName} ${value.rowName}열 ${value.seatNumber}번 좌석이 수정되었습니다.`,
      );

      await loadSeats();
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

  async function saveMultipleSeats(
      value:
      MultiSeatEditValue,
  ) {
    if (
        selectedSeats.length <
        2
    ) {
      return;
    }

    if (
        !value.seatType &&
        !value.status
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
      const count =
          selectedSeats.length;

      await bulkUpdateSeats(
          venueHallId,
          {
            seatIds:
                selectedSeats.map(
                    (seat) =>
                        seat.seatId,
                ),

            seatType:
                value.seatType ||
                null,

            status:
                value.status ||
                null,
          },
      );

      clearSelection();

      setSuccessMessage(
          `${count}개 좌석이 수정되었습니다.`,
      );

      await loadSeats();
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
   * ==========================================================
   * Delete
   * ==========================================================
   */

  function openDeleteConfirm() {
    if (
        selectedSeats.length ===
        0
    ) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    setDeleteConfirmOpen(
        true,
    );
  }

  function closeDeleteConfirm() {
    if (
        deleting
    ) {
      return;
    }

    setDeleteConfirmOpen(
        false,
    );
  }

  async function confirmDeleteSelectedSeats() {
    if (
        selectedSeats.length ===
        0
    ) {
      return;
    }

    const count =
        selectedSeats.length;

    setDeleting(true);

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await bulkDeleteSeats(
          venueHallId,
          {
            seatIds:
                selectedSeats.map(
                    (seat) =>
                        seat.seatId,
                ),
          },
      );

      setDeleteConfirmOpen(
          false,
      );

      clearSelection();

      setSuccessMessage(
          `${count}개 좌석이 삭제되었습니다.`,
      );

      await loadSeats();
    } catch (error) {
      /*
       * Modal을 닫지 않는다.
       *
       * 사용자는 실패한 선택 내역을 그대로
       * 확인할 수 있다.
       */
      setErrorMessage(
          getApiErrorMessage(
              error,
              '선택한 좌석을 삭제하지 못했습니다.',
          ),
      );
    } finally {
      setDeleting(false);
    }
  }

  /*
   * ==========================================================
   * Filter reset
   * ==========================================================
   */

  function resetFilters() {
    setKeyword('');

    setActiveFloor(
        'ALL',
    );

    setSeatType('');
    setStatus('');

    clearSelection();
  }

  const busy =
      saving ||
      deleting;

  /*
   * ==========================================================
   * Render
   * ==========================================================
   */

  return (
      <>
        <div className="mx-auto w-full min-w-0 max-w-[1920px]">

          {/*
           * ===================================================
           * Header
           * ===================================================
           */}

          <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 xl:flex-row xl:items-end xl:justify-between">

            <div>

              <button
                  type="button"
                  onClick={() =>
                      navigate(-1)
                  }
                  className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
              >
                <ArrowLeft
                    size={17}
                />

                공연홀 관리
              </button>

              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                Venue Seat Layout
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                좌석 배치 관리
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                실제 공연홀의 층, 구역, 행 구조를 기준으로
                좌석 배치와 운영 상태를 관리합니다.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              <div className="flex rounded-xl border border-slate-300 bg-white p-1 shadow-sm">

                <button
                    type="button"
                    onClick={() =>
                        changeMode(
                            'VIEW',
                        )
                    }
                    className={[
                      'flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold transition',

                      mode ===
                      'VIEW'
                          ? 'bg-slate-950 text-white'
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
                      'flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold transition',

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
                  disabled={
                    loading
                  }
                  onClick={() =>
                      void loadSeats()
                  }
                  className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
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
                  className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500"
              >
                <Plus
                    size={17}
                />

                좌석 추가
              </button>
            </div>
          </header>

          <Message
              successMessage={
                successMessage
              }
              errorMessage={
                errorMessage
              }
          />

          {/*
           * ===================================================
           * Summary
           * ===================================================
           */}

          <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

            <SummaryCard
                label="전체 좌석"
                value={
                  seats.length
                }
                suffix="석"
            />

            <SummaryCard
                label="현재 표시"
                value={
                  filteredSeats.length
                }
                suffix="석"
            />

            <SummaryCard
                label="공연홀 층"
                value={
                  floors.length
                }
                suffix="개"
            />

            <SummaryCard
                label="선택 좌석"
                value={
                  selectedSeats.length
                }
                suffix="석"
                emphasized={
                    selectedSeats.length >
                    0
                }
            />
          </section>

          {/*
           * ===================================================
           * Floor Tabs
           * ===================================================
           */}

          <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-4 py-3 sm:px-5">

              <p className="text-xs font-bold text-slate-500">
                층 선택
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto p-3 sm:p-4">

              <FloorTab
                  active={
                      activeFloor ===
                      'ALL'
                  }
                  label="전체 층"
                  count={
                    seats.length
                  }
                  onClick={() => {
                    clearSelection();

                    setActiveFloor(
                        'ALL',
                    );
                  }}
              />

              {floors.map(
                  (
                      floor,
                  ) => (
                      <FloorTab
                          key={
                            floor
                          }
                          active={
                              activeFloor ===
                              floor
                          }
                          label={`${floor}층`}
                          count={
                              floorSeatCounts.get(
                                  floor,
                              ) ??
                              0
                          }
                          onClick={() => {
                            clearSelection();

                            setActiveFloor(
                                floor,
                            );
                          }}
                      />
                  ),
              )}
            </div>
          </section>

          {/*
           * ===================================================
           * Filters
           * ===================================================
           */}

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_180px_auto] xl:items-end">

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
                        keyword
                      }
                      onChange={(
                          event,
                      ) => {
                        clearSelection();

                        setKeyword(
                            event.target.value,
                        );
                      }}
                      placeholder="구역, 행, 좌석 번호 검색"
                      className={`${INPUT_CLASS} pl-10`}
                  />
                </div>
              </FilterField>

              <FilterField
                  label="좌석 유형"
              >
                <select
                    value={
                      seatType
                    }
                    onChange={(
                        event,
                    ) => {
                      clearSelection();

                      setSeatType(
                          event.target
                              .value as
                              | SeatType
                              | '',
                      );
                    }}
                    className={
                      INPUT_CLASS
                    }
                >
                  <option value="">
                    전체 유형
                  </option>

                  <SeatTypeOptions />
                </select>
              </FilterField>

              <FilterField
                  label="운영 상태"
              >
                <select
                    value={
                      status
                    }
                    onChange={(
                        event,
                    ) => {
                      clearSelection();

                      setStatus(
                          event.target
                              .value as
                              | SeatStatus
                              | '',
                      );
                    }}
                    className={
                      INPUT_CLASS
                    }
                >
                  <option value="">
                    전체 상태
                  </option>

                  <SeatStatusOptions />
                </select>
              </FilterField>

              <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw
                    size={15}
                />

                필터 초기화
              </button>
            </div>
          </section>

          {/*
           * ===================================================
           * Edit Guide
           * ===================================================
           */}

          {mode ===
              'EDIT' && (
                  <section className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 sm:p-5">

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                      <div className="flex items-start gap-3">

                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">

                          <MousePointer2
                              size={18}
                          />
                        </div>

                        <div>

                          <p className="text-sm font-black text-indigo-950">
                            다중 좌석 선택
                          </p>

                          <p className="mt-1 max-w-3xl text-xs leading-5 text-indigo-700">
                            좌석을 누른 채 쓸어 선택하거나,
                            층·구역·행 단위 버튼으로 여러 좌석을
                            한 번에 선택할 수 있습니다.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">

                        <div className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white">

                          {selectedSeats.length.toLocaleString()}

                          <span className="ml-1 text-xs font-semibold text-indigo-100">
                            석 선택
                          </span>
                        </div>

                        <button
                            type="button"
                            disabled={
                                filteredSeats.length ===
                                0
                            }
                            onClick={
                              selectVisibleSeats
                            }
                            className="h-10 rounded-xl border border-indigo-200 bg-white px-4 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-40"
                        >
                          현재 표시 전체 선택
                        </button>

                        <button
                            type="button"
                            disabled={
                                selectedSeatIds.size ===
                                0
                            }
                            onClick={
                              clearSelection
                            }
                            className="h-10 rounded-xl px-4 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-40"
                        >
                          선택 해제
                        </button>
                      </div>
                    </div>
                  </section>
              )}

          {/*
           * ===================================================
           * Main
           * ===================================================
           */}

          <section className="mt-4 grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">

            {/*
             * =================================================
             * Seat Map
             * =================================================
             */}

            <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <Layers3
                        size={18}
                        className="text-indigo-600"
                    />

                    <h2 className="text-sm font-black text-slate-950">
                      공연홀 좌석 배치도
                    </h2>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    무대를 기준으로 층, 구역, 행 순서로
                    좌석을 표시합니다.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">

                  <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">

                    {(
                        [
                          'COMPACT',
                          'NORMAL',
                          'COMFORTABLE',
                        ] as SeatDensity[]
                    ).map(
                        (
                            option,
                        ) => (
                            <button
                                key={
                                  option
                                }
                                type="button"
                                onClick={() =>
                                    setDensity(
                                        option,
                                    )
                                }
                                className={[
                                  'h-8 rounded-lg px-3 text-[10px] font-black transition',

                                  density ===
                                  option
                                      ? 'bg-slate-900 text-white'
                                      : 'text-slate-500 hover:bg-slate-50',
                                ].join(
                                    ' ',
                                )}
                            >
                              {
                                DENSITY_LABELS[
                                    option
                                    ]
                              }
                            </button>
                        ),
                    )}
                  </div>

                  <div className="text-xs text-slate-500">

                    현재 표시{' '}

                    <strong className="text-slate-900">
                      {filteredSeats.length.toLocaleString()}
                    </strong>

                    석
                  </div>
                </div>
              </div>

              <SeatLegendBar />

              {loading ? (
                  <LoadingSeatMap />
              ) : floorGroups.length ===
              0 ? (
                  <EmptySeatMap />
              ) : (
                  <div className="overflow-auto bg-slate-50/40 p-4 select-none sm:p-6">

                    <div className="mx-auto min-w-[800px] max-w-[1650px] space-y-8">

                      {floorGroups.map(
                          (
                              floorGroup,
                          ) => (
                              <FloorSeatMap
                                  key={
                                    floorGroup.floor
                                  }
                                  group={
                                    floorGroup
                                  }
                                  mode={
                                    mode
                                  }
                                  density={
                                    density
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
                                  onToggleGroup={
                                    toggleSeatGroup
                                  }
                              />
                          ),
                      )}
                    </div>
                  </div>
              )}
            </div>

            {/*
             * =================================================
             * Inspector
             * =================================================
             */}

            <aside className="min-w-0">

              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="border-b border-slate-100 pb-4">

                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Seat Inspector
                  </p>

                  <h2 className="mt-1 text-sm font-black text-slate-950">
                    {selectedSeats.length >
                    1
                        ? '선택 좌석 일괄 편집'
                        : '좌석 정보'}
                  </h2>
                </div>

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
                          busy
                        }
                        editable={
                            mode ===
                            'EDIT'
                        }
                        onSave={
                          saveSingleSeat
                        }
                        onDelete={
                          openDeleteConfirm
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
                          busy
                        }
                        onSave={
                          saveMultipleSeats
                        }
                        onDelete={
                          openDeleteConfirm
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

        {/*
         * =====================================================
         * Create Modal
         * =====================================================
         */}

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

        {/*
         * =====================================================
         * Delete Modal
         * =====================================================
         */}

        {deleteConfirmOpen &&
            selectedSeats.length >
            0 && (
                <DeleteSeatConfirmModal
                    seats={
                      selectedSeats
                    }
                    deleting={
                      deleting
                    }
                    onClose={
                      closeDeleteConfirm
                    }
                    onConfirm={
                      confirmDeleteSelectedSeats
                    }
                />
            )}
      </>
  );
}

/*
 * ============================================================
 * Floor Map
 * ============================================================
 */

interface FloorSeatMapProps {
  group:
      SeatFloorGroup;

  mode:
      PageMode;

  density:
      SeatDensity;

  selectedSeatIds:
      Set<number>;

  onPointerDown: (
      event:
      PointerEvent<HTMLButtonElement>,
      seatId:
      number,
  ) => void;

  onPointerEnter: (
      seatId:
      number,
  ) => void;

  onToggleGroup: (
      seats:
      AdminSeat[],
  ) => void;
}

function FloorSeatMap({
                        group,
                        mode,
                        density,
                        selectedSeatIds,
                        onPointerDown,
                        onPointerEnter,
                        onToggleGroup,
                      }: FloorSeatMapProps) {
  const allFloorSeats =
      useMemo(
          () =>
              group.sections.flatMap(
                  (section) =>
                      section.rows.flatMap(
                          (row) =>
                              row.seats,
                      ),
              ),
          [
            group,
          ],
      );

  const floorSelected =
      allFloorSeats.length >
      0 &&
      allFloorSeats.every(
          (seat) =>
              selectedSeatIds.has(
                  seat.seatId,
              ),
      );

  return (
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <header className="flex items-center justify-between gap-4 bg-slate-950 px-6 py-5 text-white">

          <div className="flex items-center gap-4">

            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">

              <Layers3
                  size={22}
              />
            </div>

            <div>

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Venue Floor
              </p>

              <div className="mt-0.5 flex items-end gap-3">

                <h3 className="text-2xl font-black">
                  {group.floor}층
                </h3>

                <span className="pb-0.5 text-[11px] font-semibold text-slate-400">
                  {group.sections.length}
                  개 구역
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">

            <div className="text-right">

              <p className="text-[10px] text-slate-400">
                좌석 수
              </p>

              <p className="text-lg font-black">
                {group.seatCount.toLocaleString()}

                <span className="ml-1 text-xs text-slate-400">
                  석
                </span>
              </p>
            </div>

            {mode ===
                'EDIT' && (
                    <button
                        type="button"
                        onClick={() =>
                            onToggleGroup(
                                allFloorSeats,
                            )
                        }
                        className={[
                          'rounded-xl border px-3 py-2 text-xs font-bold transition',

                          floorSelected
                              ? 'border-indigo-400 bg-indigo-500 text-white'
                              : 'border-white/20 bg-white/10 text-slate-200 hover:bg-white/20',
                        ].join(
                            ' ',
                        )}
                    >
                      {floorSelected
                          ? '층 선택 해제'
                          : '층 전체 선택'}
                    </button>
                )}
          </div>
        </header>

        <div className="px-5 pb-10 pt-7 sm:px-8">

          <Stage />

          <div className="space-y-12">

            {group.sections.map(
                (
                    section,
                    index,
                ) => (
                    <div
                        key={
                          section.key
                        }
                    >

                      {index >
                          0 && (
                              <div className="mb-8 flex items-center gap-4">

                                <div className="h-px flex-1 bg-slate-100" />

                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                                  Aisle
                                </span>

                                <div className="h-px flex-1 bg-slate-100" />
                              </div>
                          )}

                      <SeatSection
                          section={
                            section
                          }
                          mode={
                            mode
                          }
                          density={
                            density
                          }
                          selectedSeatIds={
                            selectedSeatIds
                          }
                          onPointerDown={
                            onPointerDown
                          }
                          onPointerEnter={
                            onPointerEnter
                          }
                          onToggleGroup={
                            onToggleGroup
                          }
                      />
                    </div>
                ),
            )}
          </div>
        </div>
      </section>
  );
}

/*
 * ============================================================
 * Stage
 * ============================================================
 */

function Stage() {
  return (
      <div className="mx-auto mb-12 max-w-[1050px]">

        <div className="mx-auto w-[74%]">

          <div className="h-2 rounded-t-[100%] bg-slate-300 shadow-sm" />

          <div className="bg-gradient-to-b from-slate-100 via-slate-50/70 to-transparent pb-6 pt-3 text-center">

            <p className="text-[10px] font-black uppercase tracking-[0.55em] text-slate-500">
              Stage
            </p>

            <p className="mt-1.5 text-[9px] font-semibold text-slate-300">
              무대 방향
            </p>
          </div>
        </div>

        <div className="mx-auto mt-1 h-px w-[86%] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>
  );
}

/*
 * ============================================================
 * Section
 * ============================================================
 */

interface SeatSectionProps {
  section:
      SeatSectionGroup;

  mode:
      PageMode;

  density:
      SeatDensity;

  selectedSeatIds:
      Set<number>;

  onPointerDown: (
      event:
      PointerEvent<HTMLButtonElement>,
      seatId:
      number,
  ) => void;

  onPointerEnter: (
      seatId:
      number,
  ) => void;

  onToggleGroup: (
      seats:
      AdminSeat[],
  ) => void;
}

function SeatSection({
                       section,
                       mode,
                       density,
                       selectedSeatIds,
                       onPointerDown,
                       onPointerEnter,
                       onToggleGroup,
                     }: SeatSectionProps) {
  const sectionSeats =
      useMemo(
          () =>
              section.rows.flatMap(
                  (row) =>
                      row.seats,
              ),
          [
            section,
          ],
      );

  const allSelected =
      sectionSeats.length >
      0 &&
      sectionSeats.every(
          (seat) =>
              selectedSeatIds.has(
                  seat.seatId,
              ),
      );

  const longestRow =
      useMemo(
          () =>
              Math.max(
                  0,
                  ...section.rows.map(
                      (row) =>
                          row.seats.length,
                  ),
              ),
          [
            section.rows,
          ],
      );

  const densityConfig =
      DENSITY_CONFIG[
          density
          ];

  return (
      <section className="rounded-2xl border border-slate-100 bg-slate-50/45 p-4 sm:p-5">

        <div className="mb-6 flex items-center gap-3">

          <div className="flex shrink-0 items-center gap-3">

            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2">

              <p className="text-sm font-black text-indigo-950">
                {section.sectionName}
              </p>
            </div>

            <div>

              <p className="text-[10px] font-semibold text-slate-400">
                {section.rows.length}
                개 행 ·{' '}
                {section.seatCount.toLocaleString()}
                석
              </p>

              <p className="mt-0.5 text-[9px] text-slate-300">
                최대 행 길이{' '}
                {longestRow}
                석
              </p>
            </div>
          </div>

          <div className="h-px flex-1 bg-slate-200" />

          {mode ===
              'EDIT' && (
                  <button
                      type="button"
                      onClick={() =>
                          onToggleGroup(
                              sectionSeats,
                          )
                      }
                      className={[
                        'shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-black transition',

                        allSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600',
                      ].join(
                          ' ',
                      )}
                  >
                    {allSelected
                        ? '구역 선택 해제'
                        : '구역 전체 선택'}
                  </button>
              )}
        </div>

        <div
            className={
              densityConfig.rowGapClass
            }
        >
          {section.rows.map(
              (
                  row,
              ) => (
                  <SeatRow
                      key={
                        row.key
                      }
                      row={
                        row
                      }
                      mode={
                        mode
                      }
                      density={
                        density
                      }
                      selectedSeatIds={
                        selectedSeatIds
                      }
                      onPointerDown={
                        onPointerDown
                      }
                      onPointerEnter={
                        onPointerEnter
                      }
                      onToggleGroup={
                        onToggleGroup
                      }
                  />
              ),
          )}
        </div>
      </section>
  );
}

/*
 * ============================================================
 * Row
 * ============================================================
 */

interface SeatRowProps {
  row:
      SeatRowGroup;

  mode:
      PageMode;

  density:
      SeatDensity;

  selectedSeatIds:
      Set<number>;

  onPointerDown: (
      event:
      PointerEvent<HTMLButtonElement>,
      seatId:
      number,
  ) => void;

  onPointerEnter: (
      seatId:
      number,
  ) => void;

  onToggleGroup: (
      seats:
      AdminSeat[],
  ) => void;
}

function SeatRow({
                   row,
                   mode,
                   density,
                   selectedSeatIds,
                   onPointerDown,
                   onPointerEnter,
                   onToggleGroup,
                 }: SeatRowProps) {
  const allSelected =
      row.seats.length >
      0 &&
      row.seats.every(
          (seat) =>
              selectedSeatIds.has(
                  seat.seatId,
              ),
      );

  const densityConfig =
      DENSITY_CONFIG[
          density
          ];

  return (
      <div className="group flex min-w-max items-center rounded-xl py-1 transition hover:bg-white/80">

        <div className="flex w-[74px] shrink-0 items-center justify-end gap-2 pr-3">

          <span className="hidden text-[9px] font-semibold text-slate-300 xl:block">
            {row.seats.length}
            석
          </span>

          {mode ===
          'EDIT' ? (
              <button
                  type="button"
                  title={`${row.rowName}열 전체 선택`}
                  onClick={() =>
                      onToggleGroup(
                          row.seats,
                      )
                  }
                  className={[
                    'flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[10px] font-black transition',

                    allSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600',
                  ].join(
                      ' ',
                  )}
              >
                {row.rowName}
              </button>
          ) : (
              <RowBadge
                  rowName={
                    row.rowName
                  }
              />
          )}
        </div>

        <div className="flex min-w-[560px] flex-1 justify-center">

          <div
              className={[
                'flex items-center',
                densityConfig.seatGapClass,
              ].join(
                  ' ',
              )}
          >

            {row.seats.map(
                (
                    seat,
                    index,
                ) => {
                  const selected =
                      selectedSeatIds.has(
                          seat.seatId,
                      );

                  const previousSeat =
                      index >
                      0
                          ? row.seats[
                          index -
                          1
                              ]
                          : null;

                  const aisleBefore =
                      previousSeat
                          ? hasSeatNumberGap(
                              previousSeat,
                              seat,
                          )
                          : false;

                  return (
                      <div
                          key={
                            seat.seatId
                          }
                          className={[
                            'relative',

                            aisleBefore
                                ? densityConfig.aisleClass
                                : '',
                          ].join(
                              ' ',
                          )}
                      >

                        {aisleBefore && (
                            <span className="pointer-events-none absolute -left-4 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap text-[7px] font-bold uppercase tracking-[0.12em] text-slate-200 group-hover:block">
                              aisle
                            </span>
                        )}

                        <button
                            type="button"
                            title={`${seat.floor}층 · ${seat.sectionName} · ${seat.rowName}열 ${seat.seatNumber}번 · ${TYPE_LABELS[seat.seatType]} · ${STATUS_LABELS[seat.status]}`}
                            aria-label={`${seat.rowName}${seat.seatNumber}`}
                            aria-pressed={
                              selected
                            }
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
                              'flex shrink-0 touch-none select-none items-center justify-center border font-black shadow-sm transition-all duration-100',

                              densityConfig.seatClass,

                              selected
                                  ? 'z-10 scale-110 border-indigo-700 bg-indigo-600 text-white ring-2 ring-indigo-200'
                                  : STATUS_STYLES[
                                      seat.status
                                      ],
                            ].join(
                                ' ',
                            )}
                        >
                          {
                            seat.seatNumber
                          }
                        </button>
                      </div>
                  );
                },
            )}
          </div>
        </div>

        <div className="flex w-[74px] shrink-0 items-center gap-2 pl-3">

          <RowBadge
              rowName={
                row.rowName
              }
          />

          <span className="hidden text-[9px] font-semibold text-slate-300 xl:block">
            {row.seats.length}
            석
          </span>
        </div>
      </div>
  );
}

function RowBadge({
                    rowName,
                  }: {
  rowName: string;
}) {
  return (
      <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-slate-100 px-1.5 text-[10px] font-black text-slate-500 ring-1 ring-slate-200/60">
        {rowName}
      </span>
  );
}

/*
 * ============================================================
 * Aisle
 * ============================================================
 */

function hasSeatNumberGap(
    previousSeat: AdminSeat,
    currentSeat: AdminSeat,
): boolean {
  const previous =
      parseNumericSeatNumber(
          previousSeat.seatNumber,
      );

  const current =
      parseNumericSeatNumber(
          currentSeat.seatNumber,
      );

  if (
      previous ===
      null ||
      current ===
      null
  ) {
    return false;
  }

  return (
      current -
      previous >
      1
  );
}

function parseNumericSeatNumber(
    seatNumber: string,
): number | null {
  const normalized =
      seatNumber.trim();

  if (
      !/^\d+$/.test(
          normalized,
      )
  ) {
    return null;
  }

  const parsed =
      Number(
          normalized,
      );

  if (
      !Number.isFinite(
          parsed,
      )
  ) {
    return null;
  }

  return parsed;
}

/*
 * ============================================================
 * Single Editor
 * ============================================================
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

  onDelete: () => void;

  onClear: () => void;
}

function SingleSeatEditor({
                            seat,
                            saving,
                            editable,
                            onSave,
                            onDelete,
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
        parsedFloor <=
        0
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

            <p className="text-2xl font-black tracking-tight text-slate-950">
              {seat.rowName}열{' '}
              {seat.seatNumber}번
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              {seat.floor}층

              <span className="mx-1.5 text-slate-300">
                ·
              </span>

              {seat.sectionName}
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
                  value={`${seat.rowName}열`}
              />

              <InfoRow
                  label="좌석 번호"
                  value={`${seat.seatNumber}번`}
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
                  className="mt-4 h-10 w-full rounded-xl border border-slate-300 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
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
                    onChange={(
                        event,
                    ) =>
                        setSectionName(
                            event.target.value,
                        )
                    }
                    className={
                      INPUT_CLASS
                    }
                />
              </EditorField>

              <div className="grid grid-cols-2 gap-3">

                <EditorField
                    label="층"
                >
                  <input
                      type="number"
                      min={1}
                      value={
                        floor
                      }
                      disabled={
                        saving
                      }
                      onChange={(
                          event,
                      ) =>
                          setFloor(
                              event.target.value,
                          )
                      }
                      className={
                        INPUT_CLASS
                      }
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
                      onChange={(
                          event,
                      ) =>
                          setRowName(
                              event.target.value,
                          )
                      }
                      className={
                        INPUT_CLASS
                      }
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
                    onChange={(
                        event,
                    ) =>
                        setSeatNumber(
                            event.target.value,
                        )
                    }
                    className={
                      INPUT_CLASS
                    }
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
                    onChange={(
                        event,
                    ) =>
                        setSeatType(
                            event.target
                                .value as SeatType,
                        )
                    }
                    className={
                      INPUT_CLASS
                    }
                >
                  <SeatTypeOptions />
                </select>
              </EditorField>

              <EditorField
                  label="운영 상태"
              >
                <select
                    value={
                      status
                    }
                    disabled={
                      saving
                    }
                    onChange={(
                        event,
                    ) =>
                        setStatus(
                            event.target
                                .value as SeatStatus,
                        )
                    }
                    className={
                      INPUT_CLASS
                    }
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
                    className="h-11 flex-1 rounded-xl border border-slate-300 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
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
                    className="h-11 flex-[1.4] rounded-xl bg-indigo-600 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:bg-slate-300"
                >
                  {saving
                      ? '처리 중...'
                      : '변경사항 저장'}
                </button>
              </div>

              <DangerDeletePanel
                  count={1}
                  saving={
                    saving
                  }
                  onDelete={
                    onDelete
                  }
              />
            </div>
        )}
      </div>
  );
}

/*
 * ============================================================
 * Multi Editor
 * ============================================================
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

  onDelete: () => void;

  onClear: () => void;
}

function MultiSeatEditor({
                           count,
                           saving,
                           onSave,
                           onDelete,
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

        <div className="rounded-2xl bg-indigo-50 p-4">

          <p className="text-xs font-bold text-indigo-600">
            선택된 좌석
          </p>

          <p className="mt-1 text-3xl font-black text-indigo-950">
            {count.toLocaleString()}

            <span className="ml-1 text-sm font-bold">
              석
            </span>
          </p>

          <p className="mt-2 text-xs leading-5 text-indigo-700">
            선택된 모든 좌석에 같은 변경사항이 적용됩니다.
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
                onChange={(
                    event,
                ) =>
                    setSeatType(
                        event.target
                            .value as
                            | SeatType
                            | '',
                    )
                }
                className={
                  INPUT_CLASS
                }
            >
              <option value="">
                변경하지 않음
              </option>

              <SeatTypeOptions />
            </select>
          </EditorField>

          <EditorField
              label="운영 상태"
          >
            <select
                value={
                  status
                }
                disabled={
                  saving
                }
                onChange={(
                    event,
                ) =>
                    setStatus(
                        event.target
                            .value as
                            | SeatStatus
                            | '',
                    )
                }
                className={
                  INPUT_CLASS
                }
            >
              <option value="">
                변경하지 않음
              </option>

              <SeatStatusOptions />
            </select>
          </EditorField>

          <button
              type="button"
              disabled={
                  saving ||
                  (
                      !seatType &&
                      !status
                  )
              }
              onClick={() =>
                  void onSave({
                    seatType,
                    status,
                  })
              }
              className="h-11 w-full rounded-xl bg-indigo-600 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving
                ? '처리 중...'
                : `${count.toLocaleString()}개 좌석에 적용`}
          </button>

          <DangerDeletePanel
              count={
                count
              }
              saving={
                saving
              }
              onDelete={
                onDelete
              }
          />

          <button
              type="button"
              disabled={
                saving
              }
              onClick={
                onClear
              }
              className="h-10 w-full rounded-xl text-xs font-bold text-slate-500 transition hover:bg-slate-50"
          >
            선택 해제
          </button>
        </div>
      </div>
  );
}

/*
 * ============================================================
 * Delete Button
 * ============================================================
 */

function DangerDeletePanel({
                             count,
                             saving,
                             onDelete,
                           }: {
  count: number;

  saving: boolean;

  onDelete: () => void;
}) {
  return (
      <div className="border-t border-slate-200 pt-5">

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">

          <div className="flex items-start gap-3">

            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">

              <Trash2
                  size={16}
              />
            </div>

            <div>

              <p className="text-xs font-black text-red-800">
                좌석 영구 삭제
              </p>

              <p className="mt-1 text-[11px] leading-5 text-red-600">
                공연 회차에 사용되지 않은 좌석만
                물리 삭제할 수 있습니다.
              </p>
            </div>
          </div>

          <button
              type="button"
              disabled={
                saving
              }
              onClick={
                onDelete
              }
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-xs font-black text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            <Trash2
                size={14}
            />

            {`${count.toLocaleString()}개 좌석 삭제`}
          </button>
        </div>
      </div>
  );
}

/*
 * ============================================================
 * Summary
 * ============================================================
 */

function SummaryCard({
                       label,
                       value,
                       suffix,
                       emphasized = false,
                     }: {
  label: string;

  value: number;

  suffix: string;

  emphasized?: boolean;
}) {
  return (
      <div
          className={[
            'rounded-2xl border p-4 shadow-sm transition',

            emphasized
                ? 'border-indigo-200 bg-indigo-50'
                : 'border-slate-200 bg-white',
          ].join(
              ' ',
          )}
      >

        <p
            className={[
              'text-xs font-bold',

              emphasized
                  ? 'text-indigo-600'
                  : 'text-slate-400',
            ].join(
                ' ',
            )}
        >
          {label}
        </p>

        <p
            className={[
              'mt-1 text-2xl font-black',

              emphasized
                  ? 'text-indigo-950'
                  : 'text-slate-950',
            ].join(
                ' ',
            )}
        >
          {value.toLocaleString()}

          <span className="ml-1 text-xs font-bold text-slate-400">
            {suffix}
          </span>
        </p>
      </div>
  );
}

/*
 * ============================================================
 * Floor Tab
 * ============================================================
 */

function FloorTab({
                    active,
                    label,
                    count,
                    onClick,
                  }: {
  active: boolean;

  label: string;

  count: number;

  onClick: () => void;
}) {
  return (
      <button
          type="button"
          onClick={
            onClick
          }
          className={[
            'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 transition',

            active
                ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
          ].join(
              ' ',
          )}
      >

        <span className="text-xs font-black">
          {label}
        </span>

        <span
            className={[
              'rounded-full px-2 py-0.5 text-[10px] font-bold',

              active
                  ? 'bg-white/15 text-slate-200'
                  : 'bg-slate-100 text-slate-400',
            ].join(
                ' ',
            )}
        >
          {count.toLocaleString()}
        </span>
      </button>
  );
}

/*
 * ============================================================
 * Common
 * ============================================================
 */

function Message({
                   successMessage,
                   errorMessage,
                 }: {
  successMessage: string;

  errorMessage: string;
}) {
  if (
      successMessage
  ) {
    return (
        <div
            role="status"
            className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
        >
          <Check
              size={16}
          />

          {successMessage}
        </div>
    );
  }

  if (
      errorMessage
  ) {
    return (
        <div
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          <X
              size={16}
              className="mt-0.5 shrink-0"
          />

          {errorMessage}
        </div>
    );
  }

  return null;
}

function FilterField({
                       label,
                       children,
                     }: {
  label: string;

  children: ReactNode;
}) {
  return (
      <label>

        <span className="text-xs font-bold text-slate-500">
          {label}
        </span>

        <div className="mt-2">
          {children}
        </div>
      </label>
  );
}

function EditorField({
                       label,
                       children,
                     }: {
  label: string;

  children: ReactNode;
}) {
  return (
      <label className="block">

        <span className="text-xs font-bold text-slate-500">
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
            'rounded-full border px-2.5 py-1 text-[11px] font-black',

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

        <dd className="text-sm font-bold text-slate-700">
          {value}
        </dd>
      </div>
  );
}

/*
 * ============================================================
 * Legend
 * ============================================================
 */

function SeatLegendBar() {
  return (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-200 bg-white px-5 py-3">

        <SeatLegend
            className="border-emerald-300 bg-emerald-100"
            label="활성"
        />

        <SeatLegend
            className="border-slate-300 bg-slate-100"
            label="비활성"
        />

        <SeatLegend
            className="border-amber-300 bg-amber-100"
            label="유지보수"
        />

        <SeatLegend
            className="border-indigo-700 bg-indigo-600"
            label="선택됨"
        />

        <span className="ml-auto hidden text-[10px] font-semibold text-slate-400 lg:block">
          좌석 번호가 끊긴 위치는 통로 간격으로 표시됩니다.
        </span>
      </div>
  );
}

function SeatLegend({
                      className,
                      label,
                    }: {
  className: string;

  label: string;
}) {
  return (
      <div className="flex items-center gap-2">

        <span
            className={[
              'size-3.5 rounded border',
              className,
            ].join(
                ' ',
            )}
        />

        <span className="text-xs font-semibold text-slate-500">
          {label}
        </span>
      </div>
  );
}

/*
 * ============================================================
 * Empty / Loading
 * ============================================================
 */

function EmptySelection({
                          editMode,
                        }: {
  editMode: boolean;
}) {
  return (
      <div className="py-14 text-center">

        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100">

          <MousePointer2
              size={22}
              className="text-slate-400"
          />
        </div>

        <p className="mt-4 text-sm font-bold text-slate-700">
          좌석을 선택해주세요.
        </p>

        <p className="mx-auto mt-2 max-w-60 text-xs leading-5 text-slate-400">
          {editMode
              ? '좌석을 쓸어 선택하거나 층·구역·행 단위로 여러 좌석을 선택할 수 있습니다.'
              : '좌석을 클릭하면 상세 위치와 운영 상태를 확인할 수 있습니다.'}
        </p>
      </div>
  );
}

function LoadingSeatMap() {
  return (
      <div className="flex min-h-[560px] flex-col items-center justify-center">

        <RefreshCw
            size={25}
            className="animate-spin text-indigo-500"
        />

        <p className="mt-4 text-sm font-semibold text-slate-500">
          공연홀 전체 좌석 배치를 불러오고 있습니다.
        </p>
      </div>
  );
}

function EmptySeatMap() {
  return (
      <div className="flex min-h-[560px] flex-col items-center justify-center px-5 text-center">

        <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100">

          <Layers3
              size={22}
              className="text-slate-400"
          />
        </div>

        <p className="mt-4 text-sm font-bold text-slate-700">
          표시할 좌석이 없습니다.
        </p>

        <p className="mt-2 text-xs text-slate-400">
          필터를 변경하거나 새로운 좌석을 추가해주세요.
        </p>
      </div>
  );
}
