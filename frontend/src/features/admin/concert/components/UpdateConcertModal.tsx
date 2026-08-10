import {
  type SubmitEvent,
  useState,
} from 'react';

import {
  Music2,
  X,
} from 'lucide-react';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  updateConcert,
} from '../api/adminConcertApi';

import type {
  AdminConcert,
  AgeRating,
  ConcertCategory,
} from '../types/adminConcert';

interface UpdateConcertModalProps {
  concert: AdminConcert;

  onClose: () => void;
  onUpdated: () => void;
}

export default function UpdateConcertModal({
                                             concert,
                                             onClose,
                                             onUpdated,
                                           }: UpdateConcertModalProps) {
  const [
    title,
    setTitle,
  ] = useState(
      concert.title,
  );

  const [
    subtitle,
    setSubtitle,
  ] = useState(
      concert.subtitle ?? '',
  );

  const [
    description,
    setDescription,
  ] = useState(
      concert.description ?? '',
  );

  const [
    category,
    setCategory,
  ] =
      useState<ConcertCategory>(
          concert.category,
      );

  const [
    runningTime,
    setRunningTime,
  ] = useState(
      concert.runningTime
          ? String(
              concert.runningTime,
          )
          : '',
  );

  const [
    ageRating,
    setAgeRating,
  ] =
      useState<AgeRating>(
          concert.ageRating,
      );

  const [
    posterUrl,
    setPosterUrl,
  ] = useState(
      concert.posterUrl ?? '',
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

    if (!title.trim()) {
      setErrorMessage(
          '공연 제목을 입력해주세요.',
      );

      return;
    }

    let runningTimeValue:
        | number
        | null = null;

    if (runningTime.trim()) {
      const value =
          Number(runningTime);

      if (
          !Number.isInteger(value) ||
          value <= 0
      ) {
        setErrorMessage(
            '공연 시간은 1분 이상의 정수여야 합니다.',
        );

        return;
      }

      runningTimeValue =
          value;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await updateConcert(
          concert.concertId,
          {
            title:
                title.trim(),

            subtitle:
                subtitle.trim() ||
                null,

            description:
                description.trim() ||
                null,

            category,

            runningTime:
            runningTimeValue,

            ageRating,

            posterUrl:
                posterUrl.trim() ||
                null,
          },
      );

      onUpdated();
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '공연 수정에 실패했습니다.',
          ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-6">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
          <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <Music2
                    size={20}
                    className="text-indigo-600"
                />

                <h2 className="text-lg font-bold text-slate-950">
                  공연 수정
                </h2>
              </div>
            </div>

            <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                aria-label="닫기"
            >
              <X size={19} />
            </button>
          </header>

          <form
              onSubmit={handleSubmit}
              className="p-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  공연 제목
                </label>

                <input
                    value={title}
                    disabled={submitting}
                    maxLength={200}
                    onChange={(event) =>
                        setTitle(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  부제
                </label>

                <input
                    value={subtitle}
                    disabled={submitting}
                    maxLength={200}
                    onChange={(event) =>
                        setSubtitle(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  카테고리
                </label>

                <select
                    value={category}
                    disabled={submitting}
                    onChange={(event) =>
                        setCategory(
                            event.target
                                .value as ConcertCategory,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
                >
                  <option value="CONCERT">
                    콘서트
                  </option>
                  <option value="MUSICAL">
                    뮤지컬
                  </option>
                  <option value="PLAY">
                    연극
                  </option>
                  <option value="CLASSIC">
                    클래식
                  </option>
                  <option value="DANCE">
                    무용
                  </option>
                  <option value="ETC">
                    기타
                  </option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  관람 등급
                </label>

                <select
                    value={ageRating}
                    disabled={submitting}
                    onChange={(event) =>
                        setAgeRating(
                            event.target
                                .value as AgeRating,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
                >
                  <option value="ALL">
                    전체 관람가
                  </option>
                  <option value="AGE_7">
                    7세 이상
                  </option>
                  <option value="AGE_12">
                    12세 이상
                  </option>
                  <option value="AGE_15">
                    15세 이상
                  </option>
                  <option value="AGE_19">
                    19세 이상
                  </option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  공연 시간
                </label>

                <input
                    type="number"
                    min={1}
                    value={runningTime}
                    disabled={submitting}
                    onChange={(event) =>
                        setRunningTime(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  포스터 URL
                </label>

                <input
                    type="url"
                    value={posterUrl}
                    disabled={submitting}
                    maxLength={500}
                    onChange={(event) =>
                        setPosterUrl(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  공연 설명
                </label>

                <textarea
                    rows={7}
                    value={description}
                    disabled={submitting}
                    onChange={(event) =>
                        setDescription(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6"
                />
              </div>
            </div>

            {errorMessage && (
                <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
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
