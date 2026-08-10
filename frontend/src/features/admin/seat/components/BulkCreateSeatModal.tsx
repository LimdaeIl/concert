// frontend/src/features/admin/seat/components/BulkCreateSeatModal.tsx

import {
  type SubmitEvent,
  useMemo,
  useState,
} from 'react';

import {
  Armchair,
  X,
} from 'lucide-react';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  bulkCreateSeats,
} from '../api/adminSeatApi';

import type {
  SeatType,
} from '../types/adminSeat';

interface BulkCreateSeatModalProps {
  venueHallId: number;

  onClose: () => void;

  onCreated: () => void;
}

export default function BulkCreateSeatModal({
                                              venueHallId,
                                              onClose,
                                              onCreated,
                                            }: BulkCreateSeatModalProps) {
  const [
    sectionName,
    setSectionName,
  ] = useState('');

  const [
    floor,
    setFloor,
  ] = useState('1');

  const [
    rowName,
    setRowName,
  ] = useState('');

  const [
    startNumber,
    setStartNumber,
  ] = useState('1');

  const [
    endNumber,
    setEndNumber,
  ] = useState('1');

  const [
    seatType,
    setSeatType,
  ] =
      useState<SeatType>(
          'STANDARD',
      );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const previewCount =
      useMemo(() => {
        const start =
            Number(startNumber);

        const end =
            Number(endNumber);

        if (
            !Number.isInteger(start) ||
            !Number.isInteger(end) ||
            start <= 0 ||
            end < start
        ) {
          return 0;
        }

        return end - start + 1;
      }, [
        startNumber,
        endNumber,
      ]);

  async function handleSubmit(
      event:
      SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedSection =
        sectionName.trim();

    const normalizedRow =
        rowName.trim();

    const floorNumber =
        Number(floor);

    const start =
        Number(startNumber);

    const end =
        Number(endNumber);

    if (!normalizedSection) {
      setErrorMessage(
          '좌석 구역을 입력해주세요.',
      );

      return;
    }

    if (
        !Number.isInteger(
            floorNumber,
        ) ||
        floorNumber <= 0
    ) {
      setErrorMessage(
          '층은 1 이상의 정수여야 합니다.',
      );

      return;
    }

    if (!normalizedRow) {
      setErrorMessage(
          '좌석 열을 입력해주세요.',
      );

      return;
    }

    if (
        !Number.isInteger(start) ||
        start <= 0
    ) {
      setErrorMessage(
          '시작 좌석 번호를 확인해주세요.',
      );

      return;
    }

    if (
        !Number.isInteger(end) ||
        end < start
    ) {
      setErrorMessage(
          '끝 좌석 번호를 확인해주세요.',
      );

      return;
    }

    const seats =
        Array.from(
            {
              length:
                  end - start + 1,
            },
            (_, index) => ({
              sectionName:
              normalizedSection,

              floor:
              floorNumber,

              rowName:
              normalizedRow,

              seatNumber:
                  String(
                      start + index,
                  ),

              seatType,
            }),
        );

    setSubmitting(true);
    setErrorMessage('');

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

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-6">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
          <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <Armchair
                    size={20}
                    className="text-indigo-600"
                />

                <h2 className="text-lg font-bold text-slate-950">
                  좌석 일괄 생성
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                동일한 구역과 열의 좌석을
                번호 범위로 생성합니다.
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

          <form
              onSubmit={handleSubmit}
              className="p-6"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                    htmlFor="seat-section"
                    className="text-sm font-medium text-slate-700"
                >
                  구역
                </label>

                <input
                    id="seat-section"
                    value={sectionName}
                    disabled={submitting}
                    onChange={(event) =>
                        setSectionName(
                            event.target.value,
                        )
                    }
                    placeholder="A"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                    htmlFor="seat-floor"
                    className="text-sm font-medium text-slate-700"
                >
                  층
                </label>

                <input
                    id="seat-floor"
                    type="number"
                    min={1}
                    value={floor}
                    disabled={submitting}
                    onChange={(event) =>
                        setFloor(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                    htmlFor="seat-row"
                    className="text-sm font-medium text-slate-700"
                >
                  열
                </label>

                <input
                    id="seat-row"
                    value={rowName}
                    disabled={submitting}
                    onChange={(event) =>
                        setRowName(
                            event.target.value,
                        )
                    }
                    placeholder="A"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                    htmlFor="seat-type"
                    className="text-sm font-medium text-slate-700"
                >
                  좌석 유형
                </label>

                <select
                    id="seat-type"
                    value={seatType}
                    disabled={submitting}
                    onChange={(event) =>
                        setSeatType(
                            event.target
                                .value as SeatType,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                >
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
                <label
                    htmlFor="seat-start-number"
                    className="text-sm font-medium text-slate-700"
                >
                  시작 번호
                </label>

                <input
                    id="seat-start-number"
                    type="number"
                    min={1}
                    value={startNumber}
                    disabled={submitting}
                    onChange={(event) =>
                        setStartNumber(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                    htmlFor="seat-end-number"
                    className="text-sm font-medium text-slate-700"
                >
                  끝 번호
                </label>

                <input
                    id="seat-end-number"
                    type="number"
                    min={1}
                    value={endNumber}
                    disabled={submitting}
                    onChange={(event) =>
                        setEndNumber(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-600">
                생성 예정 좌석
              </p>

              <p className="mt-1 text-xl font-bold text-slate-950">
                {previewCount.toLocaleString()}
                개
              </p>
            </div>

            {errorMessage && (
                <p
                    role="alert"
                    className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {errorMessage}
                </p>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                취소
              </button>

              <button
                  type="submit"
                  disabled={
                      submitting ||
                      previewCount === 0
                  }
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-slate-300"
              >
                {submitting
                    ? '생성 중...'
                    : `${previewCount}개 생성`}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
