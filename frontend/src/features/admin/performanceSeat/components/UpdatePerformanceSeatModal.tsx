import {
  type SubmitEvent,
  useState,
} from 'react';

import {
  Tag,
  X,
} from 'lucide-react';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  updatePerformanceSeat,
} from '../api/adminPerformanceSeatApi';

import type {
  AdminPerformanceSeat,
  SeatGrade,
} from '../types/adminPerformanceSeat';

interface UpdatePerformanceSeatModalProps {
  seat: AdminPerformanceSeat;

  onClose: () => void;
  onUpdated: () => void;
}

export default function UpdatePerformanceSeatModal({
                                                     seat,
                                                     onClose,
                                                     onUpdated,
                                                   }: UpdatePerformanceSeatModalProps) {
  const [
    grade,
    setGrade,
  ] =
      useState<SeatGrade>(
          seat.grade,
      );

  const [
    price,
    setPrice,
  ] = useState(
      String(
          seat.price,
      ),
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
      await updatePerformanceSeat(
          seat.performanceSeatId,
          {
            grade,
            price:
            priceNumber,
          },
      );

      onUpdated();
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '판매 좌석 수정에 실패했습니다.',
          ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-6">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
          <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <Tag
                    size={20}
                    className="text-indigo-600"
                />

                <h2 className="text-lg font-bold text-slate-950">
                  판매 좌석 수정
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {seat.sectionName}{' '}
                {seat.floor}층{' '}
                {seat.rowName}열{' '}
                {seat.seatNumber}번
              </p>
            </div>

            <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="닫기"
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X size={19} />
            </button>
          </header>

          <form
              onSubmit={handleSubmit}
              className="p-6"
          >
            <div>
              <label
                  htmlFor="performance-seat-grade"
                  className="text-sm font-medium text-slate-700"
              >
                좌석 등급
              </label>

              <select
                  id="performance-seat-grade"
                  value={grade}
                  disabled={submitting}
                  onChange={(event) =>
                      setGrade(
                          event.target
                              .value as SeatGrade,
                      )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
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

            <div className="mt-5">
              <label
                  htmlFor="performance-seat-price"
                  className="text-sm font-medium text-slate-700"
              >
                판매 가격
              </label>

              <input
                  id="performance-seat-price"
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
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              />
            </div>

            {errorMessage && (
                <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                취소
              </button>

              <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300"
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
