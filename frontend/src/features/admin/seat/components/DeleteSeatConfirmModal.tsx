import {
  AlertTriangle,
  Layers3,
  Trash2,
  X,
} from 'lucide-react';

import {
  useMemo,
} from 'react';

import type {
  AdminSeat,
} from '../types/adminSeat';

interface DeleteSeatConfirmModalProps {
  seats: AdminSeat[];

  deleting: boolean;

  onClose: () => void;

  onConfirm: () => Promise<void>;
}

interface DeleteRowSummary {
  rowName: string;
  seatNumbers: string[];
  count: number;
}

interface DeleteSectionSummary {
  sectionName: string;
  rows: DeleteRowSummary[];
  count: number;
}

interface DeleteFloorSummary {
  floor: number;
  sections: DeleteSectionSummary[];
  count: number;
}

export default function DeleteSeatConfirmModal({
                                                 seats,
                                                 deleting,
                                                 onClose,
                                                 onConfirm,
                                               }: DeleteSeatConfirmModalProps) {
  const summaries =
      useMemo(
          () =>
              createDeleteSummaries(
                  seats,
              ),
          [
            seats,
          ],
      );

  return (
      <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
          onMouseDown={(
              event,
          ) => {
            if (
                event.target ===
                event.currentTarget &&
                !deleting
            ) {
              onClose();
            }
          }}
      >
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

          {/*
           * ===================================================
           * Header
           * ===================================================
           */}

          <header className="flex shrink-0 items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-6">

            <div className="flex items-start gap-4">

              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2
                    size={20}
                />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
                  Permanent Delete
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                  선택 좌석 삭제
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  아래 좌석을 공연홀에서 영구적으로 삭제합니다.
                </p>
              </div>
            </div>

            <button
                type="button"
                aria-label="닫기"
                disabled={
                  deleting
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
           * Summary
           * ===================================================
           */}

          <div className="shrink-0 border-b border-slate-200 bg-slate-50/70 p-5 sm:p-6">

            <div className="grid grid-cols-3 gap-3">

              <SummaryMetric
                  label="삭제 좌석"
                  value={seats.length}
                  suffix="석"
                  danger
              />

              <SummaryMetric
                  label="층"
                  value={summaries.length}
                  suffix="개"
              />

              <SummaryMetric
                  label="구역"
                  value={
                    summaries.reduce(
                        (
                            total,
                            floor,
                        ) =>
                            total +
                            floor.sections.length,
                        0,
                    )
                  }
                  suffix="개"
              />
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

              <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-xs font-black text-red-800">
                  삭제된 좌석은 복구할 수 없습니다.
                </p>

                <p className="mt-1 text-[11px] leading-5 text-red-600">
                  공연 회차에 이미 사용된 좌석이 하나라도 포함되어 있으면
                  서버에서 전체 삭제 요청을 거부합니다.
                </p>
              </div>
            </div>
          </div>

          {/*
           * ===================================================
           * Seat Detail
           * ===================================================
           */}

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

            <div className="space-y-5">

              {summaries.map(
                  (
                      floor,
                  ) => (
                      <section
                          key={
                            floor.floor
                          }
                          className="overflow-hidden rounded-2xl border border-slate-200"
                      >

                        <header className="flex items-center justify-between bg-slate-950 px-4 py-3 text-white">

                          <div className="flex items-center gap-3">

                            <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                              <Layers3
                                  size={15}
                              />
                            </div>

                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                Floor
                              </p>

                              <p className="text-sm font-black">
                                {floor.floor}층
                              </p>
                            </div>
                          </div>

                          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black text-slate-200">
                            {floor.count.toLocaleString()}석
                          </span>
                        </header>

                        <div className="space-y-4 p-4">

                          {floor.sections.map(
                              (
                                  section,
                              ) => (
                                  <section
                                      key={
                                        `${floor.floor}-${section.sectionName}`
                                      }
                                  >

                                    <div className="flex items-center gap-3">

                                      <span className="shrink-0 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-black text-indigo-700">
                                        {section.sectionName}
                                      </span>

                                      <div className="h-px flex-1 bg-slate-100" />

                                      <span className="text-[10px] font-bold text-slate-400">
                                        {section.count.toLocaleString()}석
                                      </span>
                                    </div>

                                    <div className="mt-3 space-y-2">

                                      {section.rows.map(
                                          (
                                              row,
                                          ) => (
                                              <DeleteRow
                                                  key={`${floor.floor}-${section.sectionName}-${row.rowName}`}
                                                  row={
                                                    row
                                                  }
                                              />
                                          ),
                                      )}
                                    </div>
                                  </section>
                              ),
                          )}
                        </div>
                      </section>
                  ),
              )}
            </div>
          </div>

          {/*
           * ===================================================
           * Footer
           * ===================================================
           */}

          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

            <button
                type="button"
                disabled={
                  deleting
                }
                onClick={
                  onClose
                }
                className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              취소
            </button>

            <button
                type="button"
                disabled={
                    deleting ||
                    seats.length ===
                    0
                }
                onClick={() =>
                    void onConfirm()
                }
                className="flex h-11 min-w-44 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Trash2
                  size={16}
              />

              {deleting
                  ? '삭제 중...'
                  : `${seats.length.toLocaleString()}개 좌석 삭제`}
            </button>
          </footer>
        </div>
      </div>
  );
}

/*
 * ============================================================
 * Row
 * ============================================================
 */

function DeleteRow({
                     row,
                   }: {
  row: DeleteRowSummary;
}) {
  const rangeText =
      summarizeSeatNumbers(
          row.seatNumbers,
      );

  return (
      <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5">

        <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-white px-2 text-[10px] font-black text-slate-600 ring-1 ring-slate-200">
          {row.rowName}
        </span>

        <div className="min-w-0 flex-1">

          <div className="flex items-center justify-between gap-3">

            <p className="truncate text-xs font-bold text-slate-700">
              {row.rowName}열
            </p>

            <span className="shrink-0 text-[10px] font-bold text-slate-400">
              {row.count}석
            </span>
          </div>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            {rangeText}
          </p>
        </div>
      </div>
  );
}

/*
 * ============================================================
 * Metric
 * ============================================================
 */

function SummaryMetric({
                         label,
                         value,
                         suffix,
                         danger = false,
                       }: {
  label: string;
  value: number;
  suffix: string;
  danger?: boolean;
}) {
  return (
      <div
          className={[
            'rounded-xl border bg-white px-3 py-3',

            danger
                ? 'border-red-200'
                : 'border-slate-200',
          ].join(
              ' ',
          )}
      >
        <p className="text-[9px] font-bold text-slate-400">
          {label}
        </p>

        <p
            className={[
              'mt-1 text-xl font-black',

              danger
                  ? 'text-red-700'
                  : 'text-slate-900',
            ].join(
                ' ',
            )}
        >
          {value.toLocaleString()}

          <span className="ml-1 text-[10px] font-bold text-slate-400">
            {suffix}
          </span>
        </p>
      </div>
  );
}

/*
 * ============================================================
 * Grouping
 * ============================================================
 */

function createDeleteSummaries(
    seats: AdminSeat[],
): DeleteFloorSummary[] {
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
                           ]) => {
                            const seatNumbers =
                                rowSeats
                                .map(
                                    (
                                        seat,
                                    ) =>
                                        seat.seatNumber,
                                )
                                .sort(
                                    (
                                        first,
                                        second,
                                    ) =>
                                        first.localeCompare(
                                            second,
                                            undefined,
                                            {
                                              numeric:
                                                  true,
                                            },
                                        ),
                                );

                            return {
                              rowName,

                              seatNumbers,

                              count:
                              seatNumbers.length,
                            };
                          },
                      );

                  return {
                    sectionName,

                    rows,

                    count:
                        rows.reduce(
                            (
                                total,
                                row,
                            ) =>
                                total +
                                row.count,
                            0,
                        ),
                  };
                },
            );

        return {
          floor,

          sections,

          count:
              sections.reduce(
                  (
                      total,
                      section,
                  ) =>
                      total +
                      section.count,
                  0,
              ),
        };
      },
  );
}

/*
 * ============================================================
 * Seat number summary
 * ============================================================
 */

function summarizeSeatNumbers(
    seatNumbers: string[],
): string {
  if (
      seatNumbers.length ===
      0
  ) {
    return '-';
  }

  const numeric =
      seatNumbers.every(
          (seatNumber) =>
              /^\d+$/.test(
                  seatNumber,
              ),
      );

  if (
      !numeric
  ) {
    return seatNumbers
    .map(
        (seatNumber) =>
            `${seatNumber}번`,
    )
    .join(', ');
  }

  const numbers =
      seatNumbers
      .map(
          Number,
      )
      .sort(
          (
              first,
              second,
          ) =>
              first -
              second,
      );

  const ranges:
      string[] = [];

  let rangeStart =
      numbers[0];

  let previous =
      numbers[0];

  for (
      let index =
          1;
      index <
      numbers.length;
      index +=
          1
  ) {
    const current =
        numbers[index];

    if (
        current ===
        previous +
        1
    ) {
      previous =
          current;

      continue;
    }

    ranges.push(
        formatRange(
            rangeStart,
            previous,
        ),
    );

    rangeStart =
        current;

    previous =
        current;
  }

  ranges.push(
      formatRange(
          rangeStart,
          previous,
      ),
  );

  return ranges.join(
      ', ',
  );
}

function formatRange(
    start: number,
    end: number,
): string {
  if (
      start ===
      end
  ) {
    return `${start}번`;
  }

  return `${start}~${end}번`;
}
