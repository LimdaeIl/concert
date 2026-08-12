import {
  type FormEvent,
  useMemo,
  useState,
} from 'react';

import {
  Armchair,
  Check,
  Hash,
  Layers3,
  Rows3,
  Sparkles,
  X,
} from 'lucide-react';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  bulkCreateSeats,
} from '../api/adminSeatApi';

import type {
  CreateSeatItem,
  SeatType,
} from '../types/adminSeat';

/*
 * ============================================================
 * Props
 * ============================================================
 */

interface BulkCreateSeatModalProps {
  venueHallId: number;

  onClose: () => void;

  onCreated: () => void;
}

/*
 * ============================================================
 * Constants
 * ============================================================
 */

const INPUT_CLASS =
    'h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100 disabled:text-slate-400';

const SEAT_TYPE_LABELS:
    Record<SeatType, string> = {
  STANDARD: '일반석',
  WHEELCHAIR: '휠체어석',
  COMPANION: '동반자석',
  OBSTRUCTED_VIEW: '시야제한석',
};

const PREVIEW_LIMIT = 120;

/*
 * ============================================================
 * Component
 * ============================================================
 */

export default function BulkCreateSeatModal({
                                              venueHallId,
                                              onClose,
                                              onCreated,
                                            }: BulkCreateSeatModalProps) {
  /*
   * ----------------------------------------------------------
   * Form
   * ----------------------------------------------------------
   */

  const [
    sectionName,
    setSectionName,
  ] = useState('');

  const [
    floor,
    setFloor,
  ] = useState('1');

  /*
   * 예:
   *
   * A
   * A,B,C
   * A-D
   * VIP1, VIP2
   */
  const [
    rowExpression,
    setRowExpression,
  ] = useState('A');

  const [
    startNumber,
    setStartNumber,
  ] = useState('1');

  const [
    endNumber,
    setEndNumber,
  ] = useState('10');

  const [
    seatType,
    setSeatType,
  ] =
      useState<SeatType>(
          'STANDARD',
      );

  /*
   * ----------------------------------------------------------
   * State
   * ----------------------------------------------------------
   */

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  /*
   * ==========================================================
   * Parsed values
   * ==========================================================
   */

  const parsedRows =
      useMemo(
          () =>
              parseRowExpression(
                  rowExpression,
              ),
          [
            rowExpression,
          ],
      );

  const parsedFloor =
      Number(
          floor,
      );

  const parsedStart =
      Number(
          startNumber,
      );

  const parsedEnd =
      Number(
          endNumber,
      );

  const seatCountPerRow =
      useMemo(
          () => {
            if (
                !Number.isInteger(
                    parsedStart,
                ) ||
                !Number.isInteger(
                    parsedEnd,
                ) ||
                parsedStart <= 0 ||
                parsedEnd <
                parsedStart
            ) {
              return 0;
            }

            return (
                parsedEnd -
                parsedStart +
                1
            );
          },
          [
            parsedStart,
            parsedEnd,
          ],
      );

  const totalSeatCount =
      parsedRows.length *
      seatCountPerRow;

  /*
   * ==========================================================
   * Preview
   * ==========================================================
   */

  const previewSeats =
      useMemo(
          () => {
            if (
                parsedRows.length ===
                0 ||
                seatCountPerRow ===
                0
            ) {
              return [];
            }

            const result:
                PreviewRow[] = [];

            let currentCount =
                0;

            for (
                const rowName of
                parsedRows
                ) {
              const remaining =
                  PREVIEW_LIMIT -
                  currentCount;

              if (
                  remaining <=
                  0
              ) {
                break;
              }

              const numbers =
                  Array.from(
                      {
                        length:
                            Math.min(
                                seatCountPerRow,
                                remaining,
                            ),
                      },
                      (
                          _,
                          index,
                      ) =>
                          String(
                              parsedStart +
                              index,
                          ),
                  );

              result.push({
                rowName,
                seatNumbers:
                numbers,
              });

              currentCount +=
                  numbers.length;
            }

            return result;
          },
          [
            parsedRows,
            parsedStart,
            seatCountPerRow,
          ],
      );

  /*
   * ==========================================================
   * Submit
   * ==========================================================
   */

  async function handleSubmit(
      event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage('');

    const normalizedSection =
        sectionName.trim();

    /*
     * --------------------------------------------------------
     * Validation
     * --------------------------------------------------------
     */

    if (
        !normalizedSection
    ) {
      setErrorMessage(
          '좌석 구역을 입력해주세요.',
      );

      return;
    }

    if (
        normalizedSection.length >
        50
    ) {
      setErrorMessage(
          '좌석 구역은 50자 이하여야 합니다.',
      );

      return;
    }

    if (
        !Number.isInteger(
            parsedFloor,
        ) ||
        parsedFloor <= 0
    ) {
      setErrorMessage(
          '층은 1 이상의 정수여야 합니다.',
      );

      return;
    }

    if (
        parsedRows.length ===
        0
    ) {
      setErrorMessage(
          '생성할 행을 입력해주세요.',
      );

      return;
    }

    if (
        parsedRows.some(
            (row) =>
                row.length >
                20,
        )
    ) {
      setErrorMessage(
          '행 이름은 20자 이하여야 합니다.',
      );

      return;
    }

    if (
        !Number.isInteger(
            parsedStart,
        ) ||
        parsedStart <= 0
    ) {
      setErrorMessage(
          '시작 좌석 번호는 1 이상의 정수여야 합니다.',
      );

      return;
    }

    if (
        !Number.isInteger(
            parsedEnd,
        ) ||
        parsedEnd <
        parsedStart
    ) {
      setErrorMessage(
          '끝 좌석 번호는 시작 번호 이상이어야 합니다.',
      );

      return;
    }

    /*
     * --------------------------------------------------------
     * Create request
     * --------------------------------------------------------
     */

    const seats:
        CreateSeatItem[] =
        parsedRows.flatMap(
            (rowName) =>
                Array.from(
                    {
                      length:
                      seatCountPerRow,
                    },
                    (
                        _,
                        index,
                    ) => ({
                      sectionName:
                      normalizedSection,

                      floor:
                      parsedFloor,

                      rowName,

                      seatNumber:
                          String(
                              parsedStart +
                              index,
                          ),

                      seatType,
                    }),
                ),
        );

    if (
        seats.length ===
        0
    ) {
      setErrorMessage(
          '생성할 좌석이 없습니다.',
      );

      return;
    }

    /*
     * 프론트에서도 같은 요청 안에
     * 중복 좌석 위치가 생기지 않는지 검사한다.
     */
    const positionKeys =
        new Set<string>();

    for (
        const seat of seats
        ) {
      const key =
          [
            seat.sectionName,
            seat.floor,
            seat.rowName,
            seat.seatNumber,
          ].join('|');

      if (
          positionKeys.has(
              key,
          )
      ) {
        setErrorMessage(
            '생성 요청에 중복된 좌석 위치가 포함되어 있습니다.',
        );

        return;
      }

      positionKeys.add(
          key,
      );
    }

    /*
     * --------------------------------------------------------
     * API
     * --------------------------------------------------------
     */

    setSubmitting(true);

    try {
      await bulkCreateSeats(
          venueHallId,
          {
            seats,
          },
      );

      onCreated();
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '좌석 일괄 생성에 실패했습니다.',
          ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * ==========================================================
   * Preset
   * ==========================================================
   */

  function applyPreset(
      preset:
      RowPreset,
  ) {
    setRowExpression(
        preset.rows,
    );

    setStartNumber(
        String(
            preset.start,
        ),
    );

    setEndNumber(
        String(
            preset.end,
        ),
    );

    setErrorMessage('');
  }

  /*
   * ==========================================================
   * Render
   * ==========================================================
   */

  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-[2px] sm:p-6"
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
        <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

          {/*
           * ===================================================
           * Header
           * ===================================================
           */}

          <header className="flex shrink-0 items-start justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-7">

            <div className="flex items-start gap-4">

              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Armchair
                    size={21}
                />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600">
                  Seat Layout Builder
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                  좌석 일괄 생성
                </h2>

                <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
                  하나의 구역에 여러 행과 연속된 좌석 번호를
                  한 번에 생성합니다.
                </p>
              </div>
            </div>

            <button
                type="button"
                onClick={
                  onClose
                }
                disabled={
                  submitting
                }
                aria-label="닫기"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            >
              <X
                  size={20}
              />
            </button>
          </header>

          {/*
           * ===================================================
           * Body
           * ===================================================
           */}

          <form
              onSubmit={
                handleSubmit
              }
              className="min-h-0 flex-1 overflow-y-auto"
          >

            <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_390px]">

              {/*
               * =================================================
               * Left Form
               * =================================================
               */}

              <div className="p-5 sm:p-7">

                {/*
                 * ------------------------------------------------
                 * Location
                 * ------------------------------------------------
                 */}

                <FormSection
                    number="01"
                    title="좌석 위치"
                    description="생성할 좌석의 층과 구역을 지정합니다."
                >

                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">

                    <Field
                        label="구역"
                        description="예: A구역, 중앙석, VIP"
                    >
                      <input
                          value={
                            sectionName
                          }
                          maxLength={
                            50
                          }
                          disabled={
                            submitting
                          }
                          onChange={(
                              event,
                          ) => {
                            setSectionName(
                                event.target.value,
                            );

                            setErrorMessage(
                                '',
                            );
                          }}
                          placeholder="A구역"
                          className={
                            INPUT_CLASS
                          }
                      />
                    </Field>

                    <Field
                        label="층"
                        description="1 이상의 정수"
                    >
                      <div className="relative">
                        <Layers3
                            size={15}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="number"
                            min={1}
                            value={
                              floor
                            }
                            disabled={
                              submitting
                            }
                            onChange={(
                                event,
                            ) => {
                              setFloor(
                                  event.target.value,
                              );

                              setErrorMessage(
                                  '',
                              );
                            }}
                            className={`${INPUT_CLASS} pl-10`}
                        />
                      </div>
                    </Field>
                  </div>
                </FormSection>

                {/*
                 * ------------------------------------------------
                 * Rows
                 * ------------------------------------------------
                 */}

                <FormSection
                    number="02"
                    title="행 구성"
                    description="여러 행을 쉼표 또는 범위로 한 번에 지정할 수 있습니다."
                >

                  <Field
                      label="생성할 행"
                      description="A,B,C 또는 A-D 형식"
                  >
                    <div className="relative">
                      <Rows3
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
                      />

                      <input
                          value={
                            rowExpression
                          }
                          disabled={
                            submitting
                          }
                          onChange={(
                              event,
                          ) => {
                            setRowExpression(
                                event.target.value,
                            );

                            setErrorMessage(
                                '',
                            );
                          }}
                          placeholder="A-D"
                          className={`${INPUT_CLASS} pl-10`}
                      />
                    </div>
                  </Field>

                  <div className="mt-3 flex flex-wrap gap-2">

                    <QuickButton
                        disabled={
                          submitting
                        }
                        onClick={() =>
                            setRowExpression(
                                'A-D',
                            )
                        }
                    >
                      A-D
                    </QuickButton>

                    <QuickButton
                        disabled={
                          submitting
                        }
                        onClick={() =>
                            setRowExpression(
                                'A-F',
                            )
                        }
                    >
                      A-F
                    </QuickButton>

                    <QuickButton
                        disabled={
                          submitting
                        }
                        onClick={() =>
                            setRowExpression(
                                'A-J',
                            )
                        }
                    >
                      A-J
                    </QuickButton>

                    <QuickButton
                        disabled={
                          submitting
                        }
                        onClick={() =>
                            setRowExpression(
                                '',
                            )
                        }
                    >
                      직접 입력
                    </QuickButton>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                    <div className="flex items-center justify-between gap-3">

                      <div>
                        <p className="text-[11px] font-bold text-slate-400">
                          인식된 행
                        </p>

                        <p className="mt-1 text-sm font-black text-slate-800">
                          {parsedRows.length.toLocaleString()}
                          개
                        </p>
                      </div>

                      <div className="flex max-w-[70%] flex-wrap justify-end gap-1.5">

                        {parsedRows.length ===
                        0 ? (
                            <span className="text-xs text-slate-400">
                              행을 입력해주세요.
                            </span>
                        ) : (
                            parsedRows.map(
                                (row) => (
                                    <span
                                        key={
                                          row
                                        }
                                        className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-black text-indigo-700"
                                    >
                                      {row}
                                    </span>
                                ),
                            )
                        )}
                      </div>
                    </div>
                  </div>
                </FormSection>

                {/*
                 * ------------------------------------------------
                 * Seat numbers
                 * ------------------------------------------------
                 */}

                <FormSection
                    number="03"
                    title="좌석 번호"
                    description="각 행에 생성할 연속 좌석 번호 범위를 입력합니다."
                >

                  <div className="grid grid-cols-2 gap-4">

                    <Field
                        label="시작 번호"
                    >
                      <div className="relative">
                        <Hash
                            size={15}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="number"
                            min={1}
                            value={
                              startNumber
                            }
                            disabled={
                              submitting
                            }
                            onChange={(
                                event,
                            ) => {
                              setStartNumber(
                                  event.target.value,
                              );

                              setErrorMessage(
                                  '',
                              );
                            }}
                            className={`${INPUT_CLASS} pl-10`}
                        />
                      </div>
                    </Field>

                    <Field
                        label="끝 번호"
                    >
                      <div className="relative">
                        <Hash
                            size={15}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="number"
                            min={1}
                            value={
                              endNumber
                            }
                            disabled={
                              submitting
                            }
                            onChange={(
                                event,
                            ) => {
                              setEndNumber(
                                  event.target.value,
                              );

                              setErrorMessage(
                                  '',
                              );
                            }}
                            className={`${INPUT_CLASS} pl-10`}
                        />
                      </div>
                    </Field>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">

                    <QuickButton
                        disabled={
                          submitting
                        }
                        onClick={() => {
                          setStartNumber(
                              '1',
                          );

                          setEndNumber(
                              '10',
                          );
                        }}
                    >
                      1~10
                    </QuickButton>

                    <QuickButton
                        disabled={
                          submitting
                        }
                        onClick={() => {
                          setStartNumber(
                              '1',
                          );

                          setEndNumber(
                              '20',
                          );
                        }}
                    >
                      1~20
                    </QuickButton>

                    <QuickButton
                        disabled={
                          submitting
                        }
                        onClick={() => {
                          setStartNumber(
                              '1',
                          );

                          setEndNumber(
                              '30',
                          );
                        }}
                    >
                      1~30
                    </QuickButton>
                  </div>
                </FormSection>

                {/*
                 * ------------------------------------------------
                 * Seat type
                 * ------------------------------------------------
                 */}

                <FormSection
                    number="04"
                    title="좌석 유형"
                    description="이번에 생성하는 좌석에 공통으로 적용됩니다."
                >

                  <div className="grid gap-2 sm:grid-cols-2">

                    <SeatTypeButton
                        type="STANDARD"
                        current={
                          seatType
                        }
                        disabled={
                          submitting
                        }
                        onClick={
                          setSeatType
                        }
                    />

                    <SeatTypeButton
                        type="WHEELCHAIR"
                        current={
                          seatType
                        }
                        disabled={
                          submitting
                        }
                        onClick={
                          setSeatType
                        }
                    />

                    <SeatTypeButton
                        type="COMPANION"
                        current={
                          seatType
                        }
                        disabled={
                          submitting
                        }
                        onClick={
                          setSeatType
                        }
                    />

                    <SeatTypeButton
                        type="OBSTRUCTED_VIEW"
                        current={
                          seatType
                        }
                        disabled={
                          submitting
                        }
                        onClick={
                          setSeatType
                        }
                    />
                  </div>
                </FormSection>

                {/*
                 * ------------------------------------------------
                 * Presets
                 * ------------------------------------------------
                 */}

                <FormSection
                    number="05"
                    title="빠른 구성"
                    description="자주 사용하는 행과 좌석 수를 빠르게 적용합니다."
                    last
                >

                  <div className="grid gap-3 sm:grid-cols-3">

                    {ROW_PRESETS.map(
                        (
                            preset,
                        ) => (
                            <button
                                key={
                                  preset.label
                                }
                                type="button"
                                disabled={
                                  submitting
                                }
                                onClick={() =>
                                    applyPreset(
                                        preset,
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-50"
                            >
                              <Sparkles
                                  size={15}
                                  className="text-indigo-500"
                              />

                              <p className="mt-2 text-xs font-black text-slate-800">
                                {
                                  preset.label
                                }
                              </p>

                              <p className="mt-1 text-[10px] leading-4 text-slate-400">
                                {
                                  preset.description
                                }
                              </p>
                            </button>
                        ),
                    )}
                  </div>
                </FormSection>

                {errorMessage && (
                    <div
                        role="alert"
                        className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                    >
                      <X
                          size={16}
                          className="mt-0.5 shrink-0"
                      />

                      {errorMessage}
                    </div>
                )}
              </div>

              {/*
               * =================================================
               * Right Preview
               * =================================================
               */}

              <aside className="border-t border-slate-200 bg-slate-50/80 p-5 lg:border-l lg:border-t-0 lg:p-6">

                <div className="sticky top-0">

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Layout Preview
                    </p>

                    <h3 className="mt-1 text-sm font-black text-slate-950">
                      생성 미리보기
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      실제 저장 전에 생성될 좌석 배치를 확인하세요.
                    </p>
                  </div>

                  {/*
                   * ----------------------------------------------
                   * Summary
                   * ----------------------------------------------
                   */}

                  <div className="mt-5 grid grid-cols-3 gap-2">

                    <PreviewMetric
                        label="층"
                        value={
                          Number.isInteger(
                              parsedFloor,
                          ) &&
                          parsedFloor >
                          0
                              ? `${parsedFloor}F`
                              : '-'
                        }
                    />

                    <PreviewMetric
                        label="행"
                        value={`${parsedRows.length}`}
                    />

                    <PreviewMetric
                        label="좌석"
                        value={`${totalSeatCount.toLocaleString()}`}
                        emphasized
                    />
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-[10px] font-bold text-slate-400">
                          구역
                        </p>

                        <p className="mt-1 text-sm font-black text-slate-800">
                          {sectionName.trim() ||
                              '미입력'}
                        </p>
                      </div>

                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-600">
                        {
                          SEAT_TYPE_LABELS[
                              seatType
                              ]
                        }
                      </span>
                    </div>
                  </div>

                  {/*
                   * ----------------------------------------------
                   * Stage
                   * ----------------------------------------------
                   */}

                  <div className="mt-5">

                    <div className="mx-auto w-[72%]">

                      <div className="h-1.5 rounded-t-full bg-slate-300" />

                      <div className="bg-gradient-to-b from-slate-200/70 to-transparent py-2 text-center">
                        <span className="text-[8px] font-black uppercase tracking-[0.35em] text-slate-400">
                          Stage
                        </span>
                      </div>
                    </div>
                  </div>

                  {/*
                   * ----------------------------------------------
                   * Seat layout
                   * ----------------------------------------------
                   */}

                  <div className="mt-3 max-h-[360px] overflow-auto rounded-xl border border-slate-200 bg-white p-4">

                    {previewSeats.length ===
                    0 ? (
                        <div className="flex min-h-[180px] flex-col items-center justify-center text-center">

                          <Armchair
                              size={25}
                              className="text-slate-300"
                          />

                          <p className="mt-3 text-xs font-bold text-slate-500">
                            좌석 정보가 필요합니다.
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            행과 좌석 번호를 입력하면 배치가 표시됩니다.
                          </p>
                        </div>
                    ) : (
                        <div className="min-w-max space-y-2">

                          {previewSeats.map(
                              (
                                  row,
                              ) => (
                                  <div
                                      key={
                                        row.rowName
                                      }
                                      className="flex items-center gap-2"
                                  >

                                    <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-1.5 text-[9px] font-black text-slate-500">
                                      {
                                        row.rowName
                                      }
                                    </span>

                                    <div className="flex gap-1">

                                      {row.seatNumbers.map(
                                          (
                                              number,
                                          ) => (
                                              <span
                                                  key={`${row.rowName}-${number}`}
                                                  className="flex h-7 min-w-7 items-center justify-center rounded-md border border-emerald-300 bg-emerald-100 px-1 text-[8px] font-black text-emerald-800"
                                              >
                                                {
                                                  number
                                                }
                                              </span>
                                          ),
                                      )}
                                    </div>

                                    <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-1.5 text-[9px] font-black text-slate-500">
                                      {
                                        row.rowName
                                      }
                                    </span>
                                  </div>
                              ),
                          )}
                        </div>
                    )}
                  </div>

                  {totalSeatCount >
                      PREVIEW_LIMIT && (
                          <p className="mt-2 text-center text-[10px] font-semibold text-slate-400">
                            미리보기는 최대{' '}
                            {PREVIEW_LIMIT.toLocaleString()}
                            석까지만 표시합니다.
                            실제 생성 대상은{' '}
                            {totalSeatCount.toLocaleString()}
                            석입니다.
                          </p>
                      )}

                  {/*
                   * ----------------------------------------------
                   * Final summary
                   * ----------------------------------------------
                   */}

                  <div
                      className={[
                        'mt-5 rounded-2xl border p-4',

                        totalSeatCount >
                        0
                            ? 'border-indigo-200 bg-indigo-50'
                            : 'border-slate-200 bg-white',
                      ].join(
                          ' ',
                      )}
                  >

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-xs font-bold text-slate-500">
                          생성 예정
                        </p>

                        <p className="mt-1 text-3xl font-black tracking-tight text-indigo-950">
                          {totalSeatCount.toLocaleString()}

                          <span className="ml-1 text-sm font-bold text-indigo-500">
                            석
                          </span>
                        </p>
                      </div>

                      {totalSeatCount >
                          0 && (
                              <div className="flex size-10 items-center justify-center rounded-full bg-indigo-600 text-white">
                                <Check
                                    size={18}
                                />
                              </div>
                          )}
                    </div>

                    {totalSeatCount >
                        0 && (
                            <p className="mt-3 text-[11px] leading-5 text-indigo-700">
                              {parsedRows.length}
                              개 행 × 행당{' '}
                              {seatCountPerRow.toLocaleString()}
                              석
                            </p>
                        )}
                  </div>
                </div>
              </aside>
            </div>

            {/*
             * ===================================================
             * Footer
             * ===================================================
             */}

            <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">

              <p className="text-[11px] leading-5 text-slate-400">
                동일한 층·구역·행·번호의 좌석이 이미 존재하면
                서버에서 생성 요청이 거절됩니다.
              </p>

              <div className="flex shrink-0 gap-2">

                <button
                    type="button"
                    onClick={
                      onClose
                    }
                    disabled={
                      submitting
                    }
                    className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  취소
                </button>

                <button
                    type="submit"
                    disabled={
                        submitting ||
                        totalSeatCount ===
                        0
                    }
                    className="flex h-11 min-w-36 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {submitting
                      ? '생성 중...'
                      : `${totalSeatCount.toLocaleString()}석 생성`}
                </button>
              </div>
            </footer>
          </form>
        </div>
      </div>
  );
}

/*
 * ============================================================
 * Row parser
 * ============================================================
 */

/**
 * 지원 형식
 *
 * A
 * A,B,C
 * A B C
 * A
 * B
 * C
 *
 * A-D
 * A~D
 *
 * A-C, E, G-H
 *
 * 영문 한 글자 범위만 자동 확장한다.
 * 그 외 값(VIP1 등)은 일반 행 이름으로 취급한다.
 */
function parseRowExpression(
    expression:
    string,
): string[] {
  const normalized =
      expression
      .trim()
      .replace(
          /\r/g,
          '',
      );

  if (
      !normalized
  ) {
    return [];
  }

  const tokens =
      normalized
      .split(
          /[,\s]+/,
      )
      .map(
          (token) =>
              token.trim(),
      )
      .filter(
          Boolean,
      );

  const rows:
      string[] = [];

  for (
      const token of
      tokens
      ) {
    const rangeMatch =
        token.match(
            /^([A-Za-z])[-~]([A-Za-z])$/,
        );

    if (
        rangeMatch
    ) {
      const start =
          rangeMatch[1]
          .toUpperCase()
          .charCodeAt(0);

      const end =
          rangeMatch[2]
          .toUpperCase()
          .charCodeAt(0);

      /*
       * 역방향 범위는 잘못된 입력으로 보고
       * 일반 문자열로 남긴다.
       */
      if (
          start <=
          end
      ) {
        for (
            let code =
                start;
            code <=
            end;
            code +=
                1
        ) {
          rows.push(
              String.fromCharCode(
                  code,
              ),
          );
        }

        continue;
      }
    }

    rows.push(
        token,
    );
  }

  /*
   * 같은 행이 두 번 입력되어도
   * 생성 요청에는 한 번만 포함한다.
   */
  return Array.from(
      new Set(
          rows,
      ),
  );
}

/*
 * ============================================================
 * Form UI
 * ============================================================
 */

function FormSection({
                       number,
                       title,
                       description,
                       children,
                       last = false,
                     }: {
  number:
      string;

  title:
      string;

  description:
      string;

  children:
      React.ReactNode;

  last?:
      boolean;
}) {
  return (
      <section
          className={[
            'pb-7',

            last
                ? ''
                : 'mb-7 border-b border-slate-200',
          ].join(
              ' ',
          )}
      >
        <div className="mb-5 flex items-start gap-3">

          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white">
            {number}
          </span>

          <div>
            <h3 className="text-sm font-black text-slate-900">
              {title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {children}
      </section>
  );
}

function Field({
                 label,
                 description,
                 children,
               }: {
  label:
      string;

  description?:
      string;

  children:
      React.ReactNode;
}) {
  return (
      <label className="block">

        <div className="flex items-end justify-between gap-2">

          <span className="text-xs font-bold text-slate-600">
            {label}
          </span>

          {description && (
              <span className="text-[10px] text-slate-400">
                {description}
              </span>
          )}
        </div>

        <div className="mt-2">
          {children}
        </div>
      </label>
  );
}

function QuickButton({
                       children,
                       disabled,
                       onClick,
                     }: {
  children:
      React.ReactNode;

  disabled:
      boolean;

  onClick:
      () => void;
}) {
  return (
      <button
          type="button"
          disabled={
            disabled
          }
          onClick={
            onClick
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
      >
        {children}
      </button>
  );
}

/*
 * ============================================================
 * Seat Type
 * ============================================================
 */

function SeatTypeButton({
                          type,
                          current,
                          disabled,
                          onClick,
                        }: {
  type:
      SeatType;

  current:
      SeatType;

  disabled:
      boolean;

  onClick: (
      type:
      SeatType,
  ) => void;
}) {
  const selected =
      type ===
      current;

  return (
      <button
          type="button"
          disabled={
            disabled
          }
          onClick={() =>
              onClick(
                  type,
              )
          }
          className={[
            'flex items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-50',

            selected
                ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
          ].join(
              ' ',
          )}
      >

        <div
            className={[
              'flex size-8 shrink-0 items-center justify-center rounded-lg',

              selected
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-400',
            ].join(
                ' ',
            )}
        >
          <Armchair
              size={15}
          />
        </div>

        <div className="min-w-0">

          <p
              className={[
                'text-xs font-black',

                selected
                    ? 'text-indigo-950'
                    : 'text-slate-700',
              ].join(
                  ' ',
              )}
          >
            {
              SEAT_TYPE_LABELS[
                  type
                  ]
            }
          </p>

          <p className="mt-0.5 truncate text-[9px] text-slate-400">
            {
              SEAT_TYPE_DESCRIPTIONS[
                  type
                  ]
            }
          </p>
        </div>

        {selected && (
            <Check
                size={15}
                className="ml-auto shrink-0 text-indigo-600"
            />
        )}
      </button>
  );
}

const SEAT_TYPE_DESCRIPTIONS:
    Record<SeatType, string> = {
  STANDARD:
      '일반 관람 좌석',

  WHEELCHAIR:
      '휠체어 이용 관람객 좌석',

  COMPANION:
      '동반 관람객 좌석',

  OBSTRUCTED_VIEW:
      '일부 시야가 제한되는 좌석',
};

/*
 * ============================================================
 * Preview
 * ============================================================
 */

interface PreviewRow {
  rowName:
      string;

  seatNumbers:
      string[];
}

function PreviewMetric({
                         label,
                         value,
                         emphasized = false,
                       }: {
  label:
      string;

  value:
      string;

  emphasized?:
      boolean;
}) {
  return (
      <div
          className={[
            'rounded-xl border px-3 py-3',

            emphasized
                ? 'border-indigo-200 bg-indigo-50'
                : 'border-slate-200 bg-white',
          ].join(
              ' ',
          )}
      >
        <p className="text-[9px] font-bold text-slate-400">
          {label}
        </p>

        <p
            className={[
              'mt-1 text-lg font-black',

              emphasized
                  ? 'text-indigo-950'
                  : 'text-slate-800',
            ].join(
                ' ',
            )}
        >
          {value}
        </p>
      </div>
  );
}

/*
 * ============================================================
 * Presets
 * ============================================================
 */

interface RowPreset {
  label:
      string;

  description:
      string;

  rows:
      string;

  start:
      number;

  end:
      number;
}

const ROW_PRESETS:
    RowPreset[] = [
  {
    label:
        '소형 구역',

    description:
        'A-D · 행당 10석',

    rows:
        'A-D',

    start:
        1,

    end:
        10,
  },

  {
    label:
        '중형 구역',

    description:
        'A-F · 행당 20석',

    rows:
        'A-F',

    start:
        1,

    end:
        20,
  },

  {
    label:
        '대형 구역',

    description:
        'A-J · 행당 30석',

    rows:
        'A-J',

    start:
        1,

    end:
        30,
  },
];
