import {
  Armchair,
  Check,
  Layers3,
  LoaderCircle,
  MousePointer2,
  RotateCcw,
  Tag,
  X,
} from 'lucide-react';

import {
  type PointerEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  bulkCreatePerformanceSeats,
  getAdminPerformanceSeatCandidateMap,
} from '../api/adminPerformanceSeatApi';

import type {
  AdminPerformanceSeatCandidateMapSeat,
  SeatGrade,
} from '../types/adminPerformanceSeat';

/*
 * ============================================================
 * Types
 * ============================================================
 */

interface BulkCreatePerformanceSeatModalProps {
  performanceId: number;

  onClose: () => void;

  onCreated: () => void;
}

interface ConfiguredSeat {
  seat:
      AdminPerformanceSeatCandidateMapSeat;

  grade:
      SeatGrade;

  price:
      number;
}

interface FloorGroup {
  floor: number;

  sections:
      SectionGroup[];

  seatCount:
      number;
}

interface SectionGroup {
  sectionName:
      string;

  rows:
      RowGroup[];

  seats:
      AdminPerformanceSeatCandidateMapSeat[];

  seatCount:
      number;
}

interface RowGroup {
  rowName:
      string;

  seats:
      AdminPerformanceSeatCandidateMapSeat[];
}

type Density =
    | 'COMPACT'
    | 'NORMAL';

type DragMode =
    | 'SELECT'
    | 'DESELECT'
    | null;

/*
 * ============================================================
 * Constants
 * ============================================================
 */

const GRADE_OPTIONS:
    SeatGrade[] = [
  'VIP',
  'R',
  'S',
  'A',
  'B',
];

const GRADE_STYLE:
    Record<
        SeatGrade,
        string
    > = {
  VIP:
      'border-violet-500 bg-violet-500 text-white',

  R:
      'border-emerald-500 bg-emerald-500 text-white',

  S:
      'border-blue-500 bg-blue-500 text-white',

  A:
      'border-amber-500 bg-amber-500 text-white',

  B:
      'border-slate-500 bg-slate-500 text-white',
};

const DENSITY_CONFIG:
    Record<
        Density,
        {
          seatClass: string;
          seatGap: string;
          rowGap: string;
        }
    > = {
  COMPACT: {
    seatClass:
        'h-6 min-w-6 rounded-[4px] px-0.5 text-[8px]',

    seatGap:
        'gap-0.5',

    rowGap:
        'space-y-1',
  },

  NORMAL: {
    seatClass:
        'h-8 min-w-8 rounded-md px-1.5 text-[10px]',

    seatGap:
        'gap-1.5',

    rowGap:
        'space-y-2',
  },
};

/*
 * ============================================================
 * Modal
 * ============================================================
 */

export default function BulkCreatePerformanceSeatModal({
                                                         performanceId,
                                                         onClose,
                                                         onCreated,
                                                       }: BulkCreatePerformanceSeatModalProps) {
  /*
   * ----------------------------------------------------------
   * Candidate data
   * ----------------------------------------------------------
   */

  const [
    seats,
    setSeats,
  ] =
      useState<
          AdminPerformanceSeatCandidateMapSeat[]
      >(
          [],
      );

  const [
    performanceStatus,
    setPerformanceStatus,
  ] =
      useState('');

  const [
    loading,
    setLoading,
  ] =
      useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
      useState(false);

  /*
   * ----------------------------------------------------------
   * UI
   * ----------------------------------------------------------
   */

  const [
    activeFloor,
    setActiveFloor,
  ] =
      useState<number | null>(
          null,
      );

  const [
    density,
    setDensity,
  ] =
      useState<Density>(
          'NORMAL',
      );

  /*
   * ----------------------------------------------------------
   * Active selection
   *
   * 지금 등급/가격을 적용할 대상.
   * ----------------------------------------------------------
   */

  const [
    activeSeatIds,
    setActiveSeatIds,
  ] =
      useState<
          Set<number>
      >(
          new Set(),
      );

  /*
   * ----------------------------------------------------------
   * Configured
   *
   * 등급/가격 적용까지 끝난 좌석.
   * 최종 bulk create 요청 대상이다.
   * ----------------------------------------------------------
   */

  const [
    configuredSeats,
    setConfiguredSeats,
  ] =
      useState<
          Map<
              number,
              ConfiguredSeat
          >
      >(
          new Map(),
      );

  /*
   * ----------------------------------------------------------
   * Drag
   * ----------------------------------------------------------
   */

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
   * Setting
   * ----------------------------------------------------------
   */

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
  ] =
      useState('');

  /*
   * ----------------------------------------------------------
   * Message
   * ----------------------------------------------------------
   */

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

  useEffect(() => {
    let active =
        true;

    async function loadCandidateMap() {
      if (
          !Number.isInteger(
              performanceId,
          ) ||
          performanceId <=
          0
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
            await getAdminPerformanceSeatCandidateMap(
                performanceId,
            );

        if (
            !active
        ) {
          return;
        }

        setSeats(
            response.seats,
        );

        setPerformanceStatus(
            response.performanceStatus,
        );

        const floors =
            Array.from(
                new Set(
                    response.seats.map(
                        (seat) =>
                            seat.floor,
                    ),
                ),
            ).sort(
                (
                    first,
                    second,
                ) =>
                    first -
                    second,
            );

        setActiveFloor(
            floors[0] ??
            null,
        );
      } catch (error) {
        if (
            !active
        ) {
          return;
        }

        setErrorMessage(
            getApiErrorMessage(
                error,
                '판매 좌석 후보 배치도를 불러오지 못했습니다.',
            ),
        );
      } finally {
        if (
            active
        ) {
          setLoading(false);
        }
      }
    }

    void loadCandidateMap();

    return () => {
      active =
          false;
    };
  }, [
    performanceId,
  ]);

  /*
   * ==========================================================
   * Global pointer up
   * ==========================================================
   */

  useEffect(() => {
    function finishDrag() {
      setDragging(false);

      setDragMode(
          null,
      );
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
   * Group
   * ==========================================================
   */

  const floors =
      useMemo(
          () =>
              Array.from(
                  new Set(
                      seats.map(
                          (seat) =>
                              seat.floor,
                      ),
                  ),
              ).sort(
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

  const floorGroups =
      useMemo<
          FloorGroup[]
      >(
          () => {
            const floorMap =
                new Map<
                    number,
                    Map<
                        string,
                        Map<
                            string,
                            AdminPerformanceSeatCandidateMapSeat[]
                        >
                    >
                >();

            for (
                const seat of
                seats
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

            return Array.from(
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
                      Array.from(
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
                                Array.from(
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
                                      rowName,

                                      seats:
                                          [
                                            ...rowSeats,
                                          ].sort(
                                              compareSeatNumber,
                                          ),
                                    }),
                                );

                            const sectionSeats =
                                rows.flatMap(
                                    (
                                        row,
                                    ) =>
                                        row.seats,
                                );

                            return {
                              sectionName,

                              rows,

                              seats:
                              sectionSeats,

                              seatCount:
                              sectionSeats.length,
                            };
                          },
                      );

                  return {
                    floor,

                    sections,

                    seatCount:
                        sections.reduce(
                            (
                                total,
                                section,
                            ) =>
                                total +
                                section.seatCount,
                            0,
                        ),
                  };
                },
            );
          },
          [
            seats,
          ],
      );

  const currentFloorGroup =
      floorGroups.find(
          (floorGroup) =>
              floorGroup.floor ===
              activeFloor,
      ) ??
      null;

  /*
   * ==========================================================
   * Counters
   * ==========================================================
   */

  const activeCount =
      activeSeatIds.size;

  const configuredCount =
      configuredSeats.size;

  const gradeSummary =
      useMemo(() => {
        const summary =
            new Map<
                SeatGrade,
                {
                  count:
                      number;

                  amount:
                      number;
                }
            >();

        for (
            const configured
            of configuredSeats.values()
            ) {
          const current =
              summary.get(
                  configured.grade,
              ) ?? {
                count:
                    0,

                amount:
                    0,
              };

          summary.set(
              configured.grade,
              {
                count:
                    current.count +
                    1,

                amount:
                    current.amount +
                    configured.price,
              },
          );
        }

        return summary;
      }, [
        configuredSeats,
      ]);

  /*
   * ==========================================================
   * Selection
   * ==========================================================
   */

  function applyActiveSelection(
      seatId: number,
      mode:
      Exclude<
          DragMode,
          null
      >,
  ) {
    setActiveSeatIds(
        (current) => {
          const next =
              new Set(
                  current,
              );

          if (
              mode ===
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

  function handleSeatPointerDown(
      event:
      PointerEvent<HTMLButtonElement>,
      seatId:
      number,
  ) {
    event.preventDefault();

    const selected =
        activeSeatIds.has(
            seatId,
        );

    const nextMode:
        Exclude<
            DragMode,
            null
        > =
        selected
            ? 'DESELECT'
            : 'SELECT';

    setDragging(true);

    setDragMode(
        nextMode,
    );

    applyActiveSelection(
        seatId,
        nextMode,
    );
  }

  function handleSeatPointerEnter(
      seatId:
      number,
  ) {
    if (
        !dragging ||
        !dragMode
    ) {
      return;
    }

    applyActiveSelection(
        seatId,
        dragMode,
    );
  }

  function toggleGroup(
      groupSeats:
      AdminPerformanceSeatCandidateMapSeat[],
  ) {
    if (
        groupSeats.length ===
        0
    ) {
      return;
    }

    setActiveSeatIds(
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

  function clearActiveSelection() {
    setActiveSeatIds(
        new Set(),
    );

    setDragging(false);

    setDragMode(
        null,
    );
  }

  /*
   * 이미 설정된 좌석을 다시 선택한다.
   *
   * 등급 재설정 등 편집에 사용한다.
   */
  function selectConfiguredGrade(
      selectedGrade:
      SeatGrade,
  ) {
    const ids =
        Array.from(
            configuredSeats.values(),
        )
        .filter(
            (configured) =>
                configured.grade ===
                selectedGrade,
        )
        .map(
            (configured) =>
                configured.seat.seatId,
        );

    setActiveSeatIds(
        new Set(
            ids,
        ),
    );

    setGrade(
        selectedGrade,
    );

    const first =
        Array.from(
            configuredSeats.values(),
        ).find(
            (configured) =>
                configured.grade ===
                selectedGrade,
        );

    if (
        first
    ) {
      setPrice(
          String(
              first.price,
          ),
      );
    }
  }

  /*
   * ==========================================================
   * Apply grade / price
   * ==========================================================
   */

  function applyConfiguration() {
    if (
        activeSeatIds.size ===
        0
    ) {
      setErrorMessage(
          '먼저 등급과 가격을 적용할 좌석을 선택해주세요.',
      );

      return;
    }

    const priceNumber =
        Number(
            price,
        );

    if (
        !Number.isInteger(
            priceNumber,
        ) ||
        priceNumber <
        0
    ) {
      setErrorMessage(
          '판매 가격은 0 이상의 정수여야 합니다.',
      );

      return;
    }

    setErrorMessage('');

    setConfiguredSeats(
        (current) => {
          const next =
              new Map(
                  current,
              );

          for (
              const seatId of
              activeSeatIds
              ) {
            const seat =
                seats.find(
                    (candidate) =>
                        candidate.seatId ===
                        seatId,
                );

            if (
                !seat
            ) {
              continue;
            }

            next.set(
                seatId,
                {
                  seat,

                  grade,

                  price:
                  priceNumber,
                },
            );
          }

          return next;
        },
    );

    clearActiveSelection();
  }

  /*
   * ==========================================================
   * Remove configured seats
   * ==========================================================
   */

  function removeActiveConfiguredSeats() {
    if (
        activeSeatIds.size ===
        0
    ) {
      return;
    }

    setConfiguredSeats(
        (current) => {
          const next =
              new Map(
                  current,
              );

          for (
              const seatId of
              activeSeatIds
              ) {
            next.delete(
                seatId,
            );
          }

          return next;
        },
    );

    clearActiveSelection();
  }

  function resetAll() {
    setActiveSeatIds(
        new Set(),
    );

    setConfiguredSeats(
        new Map(),
    );

    setGrade(
        'VIP',
    );

    setPrice('');

    setErrorMessage('');
  }

  /*
   * ==========================================================
   * Submit
   * ==========================================================
   */

  async function handleSubmit() {
    if (
        configuredSeats.size ===
        0
    ) {
      setErrorMessage(
          '등급과 가격이 설정된 판매 좌석이 없습니다.',
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
                    configuredSeats.values(),
                ).map(
                    (configured) => ({
                      seatId:
                      configured.seat.seatId,

                      grade:
                      configured.grade,

                      price:
                      configured.price,
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

  /*
   * ==========================================================
   * Render
   * ==========================================================
   */

  return (
      <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-[2px] sm:p-5"
          onMouseDown={(
              event,
          ) => {
            if (
                event.target ===
                event.currentTarget &&
                !submitting
            ) {
              onClose();
            }
          }}
      >
        <div className="flex max-h-[94vh] w-full max-w-[1600px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

          {/*
           * ===================================================
           * Header
           * ===================================================
           */}

          <header className="flex shrink-0 items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-7">

            <div className="flex items-start gap-4">

              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Armchair
                    size={21}
                />
              </div>

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">
                  Performance Seat Configuration
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                  판매 좌석 구성
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  공연홀의 실제 배치도에서 좌석을 선택한 뒤
                  판매 등급과 가격을 지정합니다.
                </p>
              </div>
            </div>

            <button
                type="button"
                aria-label="닫기"
                disabled={
                  submitting
                }
                onClick={
                  onClose
                }
                className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
            >
              <X
                  size={19}
              />
            </button>
          </header>

          {/*
           * ===================================================
           * Status
           * ===================================================
           */}

          {!loading &&
              performanceStatus && (
                  <div className="shrink-0 border-b border-slate-200 bg-slate-50/70 px-5 py-3 sm:px-7">

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">

                      <span className="font-semibold text-slate-500">
                        회차 상태

                        <strong className="ml-2 font-black text-slate-900">
                          {performanceStatus}
                        </strong>
                      </span>

                      <span className="font-semibold text-slate-500">
                        등록 가능

                        <strong className="ml-2 font-black text-indigo-600">
                          {seats.length.toLocaleString()}
                          석
                        </strong>
                      </span>

                      <span className="font-semibold text-slate-500">
                        설정 완료

                        <strong className="ml-2 font-black text-emerald-600">
                          {configuredCount.toLocaleString()}
                          석
                        </strong>
                      </span>

                      <span className="font-semibold text-slate-500">
                        현재 선택

                        <strong className="ml-2 font-black text-slate-950">
                          {activeCount.toLocaleString()}
                          석
                        </strong>
                      </span>
                    </div>
                  </div>
              )}

          {/*
           * ===================================================
           * Error
           * ===================================================
           */}

          {errorMessage && (
              <div className="mx-5 mt-4 shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:mx-7">
                {errorMessage}
              </div>
          )}

          {/*
           * ===================================================
           * Loading
           * ===================================================
           */}

          {loading ? (
              <div className="flex min-h-[560px] flex-1 items-center justify-center">

                <div className="text-center">

                  <LoaderCircle
                      size={30}
                      className="mx-auto animate-spin text-indigo-600"
                  />

                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    공연홀 좌석 배치를 불러오고 있습니다.
                  </p>
                </div>
              </div>
          ) : seats.length ===
          0 ? (
              <EmptyCandidateSeatMap />
          ) : (
              <div className="grid min-h-0 flex-1 2xl:grid-cols-[minmax(0,1fr)_360px]">

                {/*
                 * =================================================
                 * Seat map
                 * =================================================
                 */}

                <section className="flex min-h-0 min-w-0 flex-col border-r border-slate-200">

                  {/*
                   * -----------------------------------------------
                   * Toolbar
                   * -----------------------------------------------
                   */}

                  <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 xl:flex-row xl:items-center xl:justify-between sm:px-6">

                    <div className="flex min-w-0 items-center gap-2 overflow-x-auto">

                      {floors.map(
                          (
                              floor,
                          ) => {
                            const floorGroup =
                                floorGroups.find(
                                    (
                                        group,
                                    ) =>
                                        group.floor ===
                                        floor,
                                );

                            return (
                                <button
                                    key={
                                      floor
                                    }
                                    type="button"
                                    onClick={() => {
                                      setActiveFloor(
                                          floor,
                                      );

                                      clearActiveSelection();
                                    }}
                                    className={[
                                      'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black transition',

                                      activeFloor ===
                                      floor
                                          ? 'border-slate-950 bg-slate-950 text-white'
                                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                                    ].join(
                                        ' ',
                                    )}
                                >
                                  {floor}층

                                  <span
                                      className={[
                                        'rounded-full px-2 py-0.5 text-[9px]',

                                        activeFloor ===
                                        floor
                                            ? 'bg-white/15 text-white'
                                            : 'bg-slate-100 text-slate-400',
                                      ].join(
                                          ' ',
                                      )}
                                  >
                                    {
                                        floorGroup?.seatCount ??
                                        0
                                    }
                                  </span>
                                </button>
                            );
                          },
                      )}
                    </div>

                    <div className="flex items-center gap-2">

                      <div className="flex rounded-xl border border-slate-200 bg-white p-1">

                        <button
                            type="button"
                            onClick={() =>
                                setDensity(
                                    'COMPACT',
                                )
                            }
                            className={[
                              'h-8 rounded-lg px-3 text-[10px] font-black transition',

                              density ===
                              'COMPACT'
                                  ? 'bg-slate-950 text-white'
                                  : 'text-slate-500 hover:bg-slate-50',
                            ].join(
                                ' ',
                            )}
                        >
                          콤팩트
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setDensity(
                                    'NORMAL',
                                )
                            }
                            className={[
                              'h-8 rounded-lg px-3 text-[10px] font-black transition',

                              density ===
                              'NORMAL'
                                  ? 'bg-slate-950 text-white'
                                  : 'text-slate-500 hover:bg-slate-50',
                            ].join(
                                ' ',
                            )}
                        >
                          기본
                        </button>
                      </div>

                      <button
                          type="button"
                          onClick={
                            clearActiveSelection
                          }
                          disabled={
                              activeCount ===
                              0
                          }
                          className="h-10 rounded-xl border border-slate-200 px-3 text-[10px] font-black text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                      >
                        선택 해제
                      </button>
                    </div>
                  </div>

                  {/*
                   * -----------------------------------------------
                   * Selection guide
                   * -----------------------------------------------
                   */}

                  <div className="flex shrink-0 items-center gap-3 border-b border-indigo-100 bg-indigo-50/70 px-5 py-3 text-xs text-indigo-700 sm:px-6">

                    <MousePointer2
                        size={15}
                        className="shrink-0"
                    />

                    좌석을 누른 채 쓸어 여러 좌석을 선택할 수 있습니다.
                    층·구역·행 단위 선택도 지원합니다.
                  </div>

                  {/*
                   * -----------------------------------------------
                   * Map
                   * -----------------------------------------------
                   */}

                  <div className="min-h-0 flex-1 overflow-auto bg-slate-50/50 p-4 select-none sm:p-6">

                    <div className="mx-auto min-w-[760px] max-w-[1250px]">

                      <Stage />

                      {currentFloorGroup && (
                          <FloorSeatMap
                              floorGroup={
                                currentFloorGroup
                              }
                              density={
                                density
                              }
                              activeSeatIds={
                                activeSeatIds
                              }
                              configuredSeats={
                                configuredSeats
                              }
                              onPointerDown={
                                handleSeatPointerDown
                              }
                              onPointerEnter={
                                handleSeatPointerEnter
                              }
                              onToggleGroup={
                                toggleGroup
                              }
                          />
                      )}
                    </div>
                  </div>
                </section>

                {/*
                 * =================================================
                 * Inspector
                 * =================================================
                 */}

                <aside className="min-h-0 overflow-y-auto bg-white p-5 sm:p-6">

                  <section>

                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Current Selection
                    </p>

                    <div className="mt-2 flex items-end justify-between">

                      <p className="text-3xl font-black tracking-tight text-slate-950">
                        {activeCount.toLocaleString()}

                        <span className="ml-1 text-sm font-bold text-slate-400">
                          석
                        </span>
                      </p>

                      {activeCount >
                          0 && (
                              <button
                                  type="button"
                                  onClick={
                                    clearActiveSelection
                                  }
                                  className="text-[10px] font-black text-slate-400 transition hover:text-slate-700"
                              >
                                선택 해제
                              </button>
                          )}
                    </div>
                  </section>

                  <section className="mt-6 border-t border-slate-100 pt-6">

                    <div className="flex items-center gap-2">

                      <Tag
                          size={16}
                          className="text-indigo-600"
                      />

                      <p className="text-sm font-black text-slate-900">
                        판매 조건 적용
                      </p>
                    </div>

                    <label className="mt-5 block">

                      <span className="text-xs font-bold text-slate-500">
                        좌석 등급
                      </span>

                      <select
                          value={
                            grade
                          }
                          disabled={
                            submitting
                          }
                          onChange={(
                              event,
                          ) =>
                              setGrade(
                                  event.target
                                      .value as SeatGrade,
                              )
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      >
                        {GRADE_OPTIONS.map(
                            (
                                gradeOption,
                            ) => (
                                <option
                                    key={
                                      gradeOption
                                    }
                                    value={
                                      gradeOption
                                    }
                                >
                                  {
                                    gradeOption
                                  }
                                </option>
                            ),
                        )}
                      </select>
                    </label>

                    <label className="mt-4 block">

                      <span className="text-xs font-bold text-slate-500">
                        판매 가격
                      </span>

                      <div className="relative mt-2">

                        <input
                            type="number"
                            min={0}
                            step={1000}
                            value={
                              price
                            }
                            disabled={
                              submitting
                            }
                            onChange={(
                                event,
                            ) =>
                                setPrice(
                                    event.target.value,
                                )
                            }
                            placeholder="150000"
                            className="h-11 w-full rounded-xl border border-slate-300 px-3 pr-10 text-right text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          원
                        </span>
                      </div>
                    </label>

                    <button
                        type="button"
                        disabled={
                            activeCount ===
                            0 ||
                            submitting
                        }
                        onClick={
                          applyConfiguration
                        }
                        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <Check
                          size={16}
                      />

                      {activeCount >
                      0
                          ? `${activeCount.toLocaleString()}석에 적용`
                          : '좌석을 선택해주세요'}
                    </button>

                    {activeCount >
                        0 && (
                            <button
                                type="button"
                                onClick={
                                  removeActiveConfiguredSeats
                                }
                                className="mt-2 h-10 w-full rounded-xl text-xs font-bold text-red-500 transition hover:bg-red-50"
                            >
                              선택 좌석의 설정 제거
                            </button>
                        )}
                  </section>

                  {/*
                   * ------------------------------------------------
                   * Configured summary
                   * ------------------------------------------------
                   */}

                  <section className="mt-6 border-t border-slate-100 pt-6">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-xs font-bold text-slate-500">
                          설정 완료
                        </p>

                        <p className="mt-1 text-2xl font-black text-slate-950">
                          {configuredCount.toLocaleString()}

                          <span className="ml-1 text-xs font-bold text-slate-400">
                            석
                          </span>
                        </p>
                      </div>

                      <button
                          type="button"
                          disabled={
                              configuredCount ===
                              0
                          }
                          onClick={
                            resetAll
                          }
                          className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-black text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40"
                      >
                        <RotateCcw
                            size={13}
                        />

                        전체 초기화
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">

                      {GRADE_OPTIONS.map(
                          (
                              gradeOption,
                          ) => {
                            const summary =
                                gradeSummary.get(
                                    gradeOption,
                                );

                            if (
                                !summary
                            ) {
                              return null;
                            }

                            return (
                                <button
                                    key={
                                      gradeOption
                                    }
                                    type="button"
                                    onClick={() =>
                                        selectConfiguredGrade(
                                            gradeOption,
                                        )
                                    }
                                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
                                >

                                  <div className="flex items-center gap-3">

                                    <span
                                        className={[
                                          'flex size-8 items-center justify-center rounded-lg border text-[10px] font-black',
                                          GRADE_STYLE[
                                              gradeOption
                                              ],
                                        ].join(
                                            ' ',
                                        )}
                                    >
                                      {
                                        gradeOption
                                      }
                                    </span>

                                    <div>

                                      <p className="text-xs font-black text-slate-700">
                                        {summary.count.toLocaleString()}
                                        석
                                      </p>

                                      <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                                        클릭하여 다시 선택
                                      </p>
                                    </div>
                                  </div>

                                  <p className="text-xs font-black text-slate-700">
                                    {summary.amount.toLocaleString()}
                                    원
                                  </p>
                                </button>
                            );
                          },
                      )}

                      {configuredCount ===
                          0 && (
                              <div className="rounded-xl bg-slate-50 px-4 py-5 text-center">

                                <p className="text-xs font-semibold text-slate-400">
                                  아직 등급과 가격을 적용한 좌석이 없습니다.
                                </p>
                              </div>
                          )}
                    </div>
                  </section>
                </aside>
              </div>
          )}

          {/*
           * ===================================================
           * Footer
           * ===================================================
           */}

          <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">

            <div className="text-xs font-semibold text-slate-500">

              후보{' '}

              <strong className="font-black text-slate-900">
                {seats.length.toLocaleString()}
              </strong>

              석

              <span className="mx-2 text-slate-300">
                ·
              </span>

              설정 완료{' '}

              <strong className="font-black text-emerald-600">
                {configuredCount.toLocaleString()}
              </strong>

              석
            </div>

            <div className="flex gap-2">

              <button
                  type="button"
                  disabled={
                    submitting
                  }
                  onClick={
                    onClose
                  }
                  className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                취소
              </button>

              <button
                  type="button"
                  disabled={
                      submitting ||
                      loading ||
                      configuredCount ===
                      0
                  }
                  onClick={() =>
                      void handleSubmit()
                  }
                  className="flex h-11 min-w-44 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? (
                    <>
                      <LoaderCircle
                          size={16}
                          className="animate-spin"
                      />

                      등록 중...
                    </>
                ) : (
                    <>
                      <Check
                          size={16}
                      />

                      {configuredCount.toLocaleString()}
                      석 판매 좌석 등록
                    </>
                )}
              </button>
            </div>
          </footer>
        </div>
      </div>
  );
}

/*
 * ============================================================
 * Stage
 * ============================================================
 */

function Stage() {
  return (
      <div className="mx-auto mb-10 max-w-[1000px]">

        <div className="mx-auto w-[72%]">

          <div className="h-2 rounded-t-[100%] bg-slate-300" />

          <div className="bg-gradient-to-b from-slate-100 via-slate-50/80 to-transparent pb-5 pt-3 text-center">

            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
              Stage
            </p>

            <p className="mt-1 text-[9px] font-semibold text-slate-300">
              무대 방향
            </p>
          </div>
        </div>
      </div>
  );
}

/*
 * ============================================================
 * Floor
 * ============================================================
 */

function FloorSeatMap({
                        floorGroup,
                        density,
                        activeSeatIds,
                        configuredSeats,
                        onPointerDown,
                        onPointerEnter,
                        onToggleGroup,
                      }: {
  floorGroup:
      FloorGroup;

  density:
      Density;

  activeSeatIds:
      Set<number>;

  configuredSeats:
      Map<
          number,
          ConfiguredSeat
      >;

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
      AdminPerformanceSeatCandidateMapSeat[],
  ) => void;
}) {
  const allFloorSeats =
      floorGroup.sections.flatMap(
          (
              section,
          ) =>
              section.seats,
      );

  const allSelected =
      allFloorSeats.length >
      0 &&
      allFloorSeats.every(
          (seat) =>
              activeSeatIds.has(
                  seat.seatId,
              ),
      );

  return (
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <header className="flex items-center justify-between bg-slate-950 px-5 py-4 text-white">

          <div className="flex items-center gap-3">

            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">

              <Layers3
                  size={18}
              />
            </div>

            <div>

              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                Venue Floor
              </p>

              <p className="mt-0.5 text-lg font-black">
                {floorGroup.floor}층
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">

            <span className="text-xs font-bold text-slate-300">
              {floorGroup.seatCount.toLocaleString()}
              석
            </span>

            <button
                type="button"
                onClick={() =>
                    onToggleGroup(
                        allFloorSeats,
                    )
                }
                className={[
                  'rounded-lg px-3 py-2 text-[10px] font-black transition',

                  allSelected
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20',
                ].join(
                    ' ',
                )}
            >
              {allSelected
                  ? '층 선택 해제'
                  : '층 전체 선택'}
            </button>
          </div>
        </header>

        <div className="space-y-9 p-5 sm:p-7">

          {floorGroup.sections.map(
              (
                  section,
              ) => (
                  <SeatSection
                      key={
                        section.sectionName
                      }
                      section={
                        section
                      }
                      density={
                        density
                      }
                      activeSeatIds={
                        activeSeatIds
                      }
                      configuredSeats={
                        configuredSeats
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
 * Section
 * ============================================================
 */

function SeatSection({
                       section,
                       density,
                       activeSeatIds,
                       configuredSeats,
                       onPointerDown,
                       onPointerEnter,
                       onToggleGroup,
                     }: {
  section:
      SectionGroup;

  density:
      Density;

  activeSeatIds:
      Set<number>;

  configuredSeats:
      Map<
          number,
          ConfiguredSeat
      >;

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
      AdminPerformanceSeatCandidateMapSeat[],
  ) => void;
}) {
  const allSelected =
      section.seats.length >
      0 &&
      section.seats.every(
          (seat) =>
              activeSeatIds.has(
                  seat.seatId,
              ),
      );

  return (
      <section>

        <div className="mb-4 flex items-center gap-3">

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2">

            <p className="text-xs font-black text-indigo-900">
              {section.sectionName}
            </p>
          </div>

          <p className="text-[10px] font-bold text-slate-400">
            {section.rows.length}
            개 행 ·{' '}
            {section.seatCount.toLocaleString()}
            석
          </p>

          <div className="h-px flex-1 bg-slate-100" />

          <button
              type="button"
              onClick={() =>
                  onToggleGroup(
                      section.seats,
                  )
              }
              className={[
                'rounded-lg px-3 py-1.5 text-[9px] font-black transition',

                allSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600',
              ].join(
                  ' ',
              )}
          >
            {allSelected
                ? '구역 선택 해제'
                : '구역 전체 선택'}
          </button>
        </div>

        <div
            className={
              DENSITY_CONFIG[
                  density
                  ].rowGap
            }
        >
          {section.rows.map(
              (
                  row,
              ) => (
                  <SeatRow
                      key={
                        row.rowName
                      }
                      row={
                        row
                      }
                      density={
                        density
                      }
                      activeSeatIds={
                        activeSeatIds
                      }
                      configuredSeats={
                        configuredSeats
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

function SeatRow({
                   row,
                   density,
                   activeSeatIds,
                   configuredSeats,
                   onPointerDown,
                   onPointerEnter,
                   onToggleGroup,
                 }: {
  row:
      RowGroup;

  density:
      Density;

  activeSeatIds:
      Set<number>;

  configuredSeats:
      Map<
          number,
          ConfiguredSeat
      >;

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
      AdminPerformanceSeatCandidateMapSeat[],
  ) => void;
}) {
  const allSelected =
      row.seats.length >
      0 &&
      row.seats.every(
          (seat) =>
              activeSeatIds.has(
                  seat.seatId,
              ),
      );

  const config =
      DENSITY_CONFIG[
          density
          ];

  return (
      <div className="flex min-w-max items-center py-0.5">

        <div className="flex w-[58px] shrink-0 justify-end pr-3">

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
                    : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600',
              ].join(
                  ' ',
              )}
          >
            {row.rowName}
          </button>
        </div>

        <div className="flex min-w-[520px] flex-1 justify-center">

          <div
              className={[
                'flex items-center',
                config.seatGap,
              ].join(
                  ' ',
              )}
          >
            {row.seats.map(
                (
                    seat,
                ) => {
                  const active =
                      activeSeatIds.has(
                          seat.seatId,
                      );

                  const configured =
                      configuredSeats.get(
                          seat.seatId,
                      );

                  return (
                      <button
                          key={
                            seat.seatId
                          }
                          type="button"
                          title={`${seat.floor}층 · ${seat.sectionName} · ${seat.rowName}열 ${seat.seatNumber}번${configured
                              ? ` · ${configured.grade} · ${configured.price.toLocaleString()}원`
                              : ''}`}
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
                            'relative flex shrink-0 touch-none select-none items-center justify-center border font-black shadow-sm transition-all duration-100',

                            config.seatClass,

                            active
                                ? 'z-20 scale-110 border-indigo-700 bg-indigo-600 text-white ring-2 ring-indigo-200'
                                : configured
                                    ? GRADE_STYLE[
                                        configured.grade
                                        ]
                                    : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50',
                          ].join(
                              ' ',
                          )}
                      >
                        {
                          seat.seatNumber
                        }

                        {configured &&
                            !active && (
                                <span className="pointer-events-none absolute -right-1 -top-1 hidden min-w-4 items-center justify-center rounded-full bg-slate-950 px-1 text-[6px] leading-4 text-white lg:flex">
                                  {
                                    configured.grade
                                  }
                                </span>
                            )}
                      </button>
                  );
                },
            )}
          </div>
        </div>

        <div className="flex w-[58px] shrink-0 pl-3">

          <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-slate-100 px-1.5 text-[10px] font-black text-slate-500">
            {row.rowName}
          </span>
        </div>
      </div>
  );
}

/*
 * ============================================================
 * Empty
 * ============================================================
 */

function EmptyCandidateSeatMap() {
  return (
      <div className="flex min-h-[560px] flex-1 flex-col items-center justify-center px-6 text-center">

        <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100">

          <Armchair
              size={25}
              className="text-slate-400"
          />
        </div>

        <p className="mt-4 text-sm font-black text-slate-700">
          등록 가능한 좌석이 없습니다.
        </p>

        <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">
          공연홀의 활성 좌석이 모두 이 회차의 판매 좌석으로
          등록되었거나, 판매 좌석을 구성할 수 없는 회차 상태일 수 있습니다.
        </p>
      </div>
  );
}

/*
 * ============================================================
 * Sort
 * ============================================================
 */

function compareSeatNumber(
    first:
    AdminPerformanceSeatCandidateMapSeat,
    second:
    AdminPerformanceSeatCandidateMapSeat,
): number {
  return String(
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
  );
}
