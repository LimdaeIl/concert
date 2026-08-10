import {
  type SubmitEvent,
  useState,
} from 'react';

import {
  Building2,
  X,
} from 'lucide-react';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  updateVenueHall,
} from '../api/adminVenueHallApi';

import type {
  AdminVenueHall,
} from '../types/adminVenueHall';

interface UpdateVenueHallModalProps {
  hall: AdminVenueHall;

  onClose: () => void;

  onUpdated: () => void;
}

export default function UpdateVenueHallModal({
                                               hall,
                                               onClose,
                                               onUpdated,
                                             }: UpdateVenueHallModalProps) {
  const [
    name,
    setName,
  ] = useState(
      hall.name,
  );

  const [
    floor,
    setFloor,
  ] = useState(
      hall.floor ?? '',
  );

  const [
    capacity,
    setCapacity,
  ] = useState(
      String(
          hall.capacity,
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
      event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage(
          '공연홀 이름을 입력해주세요.',
      );

      return;
    }

    const capacityNumber =
        Number(capacity);

    if (
        !Number.isInteger(
            capacityNumber,
        ) ||
        capacityNumber <= 0
    ) {
      setErrorMessage(
          '수용 인원은 1 이상의 정수여야 합니다.',
      );

      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await updateVenueHall(
          hall.venueHallId,
          {
            name:
                name.trim(),

            floor:
                floor.trim() ||
                null,

            capacity:
            capacityNumber,
          },
      );

      onUpdated();
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '공연홀 수정에 실패했습니다.',
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
                <Building2
                    size={20}
                    className="text-indigo-600"
                />

                <h2 className="text-lg font-bold text-slate-950">
                  공연홀 수정
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                공연홀 기본 정보를
                수정합니다.
              </p>
            </div>

            <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="닫기"
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
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
                  htmlFor="update-hall-name"
                  className="text-sm font-medium text-slate-700"
              >
                공연홀명
              </label>

              <input
                  id="update-hall-name"
                  value={name}
                  disabled={submitting}
                  onChange={(event) =>
                      setName(
                          event.target.value,
                      )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                    htmlFor="update-hall-floor"
                    className="text-sm font-medium text-slate-700"
                >
                  위치 층
                </label>

                <input
                    id="update-hall-floor"
                    value={floor}
                    disabled={submitting}
                    onChange={(event) =>
                        setFloor(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                    htmlFor="update-hall-capacity"
                    className="text-sm font-medium text-slate-700"
                >
                  수용 인원
                </label>

                <input
                    id="update-hall-capacity"
                    type="number"
                    min={1}
                    value={capacity}
                    disabled={submitting}
                    onChange={(event) =>
                        setCapacity(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                />
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
