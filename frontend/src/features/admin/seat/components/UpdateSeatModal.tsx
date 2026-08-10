// frontend/src/features/admin/seat/components/UpdateSeatModal.tsx

import {
  type SubmitEvent,
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
  updateSeat,
} from '../api/adminSeatApi';

import type {
  AdminSeat,
  SeatType,
} from '../types/adminSeat';

interface UpdateSeatModalProps {
  seat: AdminSeat;

  onClose: () => void;

  onUpdated: () => void;
}

export default function UpdateSeatModal({
                                          seat,
                                          onClose,
                                          onUpdated,
                                        }: UpdateSeatModalProps) {
  const [
    sectionName,
    setSectionName,
  ] = useState(
      seat.sectionName,
  );

  const [
    floor,
    setFloor,
  ] = useState(
      String(seat.floor),
  );

  const [
    rowName,
    setRowName,
  ] = useState(
      seat.rowName,
  );

  const [
    seatNumber,
    setSeatNumber,
  ] = useState(
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
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  async function handleSubmit(
      event:
      SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedSection =
        sectionName.trim();

    const normalizedRow =
        rowName.trim();

    const normalizedSeatNumber =
        seatNumber.trim();

    const floorNumber =
        Number(floor);

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

    if (!normalizedSeatNumber) {
      setErrorMessage(
          '좌석 번호를 입력해주세요.',
      );

      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await updateSeat(
          seat.seatId,
          {
            sectionName:
            normalizedSection,

            floor:
            floorNumber,

            rowName:
            normalizedRow,

            seatNumber:
            normalizedSeatNumber,

            seatType,
          },
      );

      onUpdated();
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '좌석 수정에 실패했습니다.',
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
                  좌석 수정
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                좌석 위치와 유형을 수정합니다.
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
                    htmlFor="update-seat-section"
                    className="text-sm font-medium text-slate-700"
                >
                  구역
                </label>

                <input
                    id="update-seat-section"
                    value={sectionName}
                    disabled={submitting}
                    onChange={(event) =>
                        setSectionName(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                    htmlFor="update-seat-floor"
                    className="text-sm font-medium text-slate-700"
                >
                  층
                </label>

                <input
                    id="update-seat-floor"
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
                    htmlFor="update-seat-row"
                    className="text-sm font-medium text-slate-700"
                >
                  열
                </label>

                <input
                    id="update-seat-row"
                    value={rowName}
                    disabled={submitting}
                    onChange={(event) =>
                        setRowName(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                    htmlFor="update-seat-number"
                    className="text-sm font-medium text-slate-700"
                >
                  좌석 번호
                </label>

                <input
                    id="update-seat-number"
                    value={seatNumber}
                    disabled={submitting}
                    onChange={(event) =>
                        setSeatNumber(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                    htmlFor="update-seat-type"
                    className="text-sm font-medium text-slate-700"
                >
                  좌석 유형
                </label>

                <select
                    id="update-seat-type"
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
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-slate-300"
              >
                {submitting
                    ? '수정 중...'
                    : '수정'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
