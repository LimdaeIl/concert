import {
  FileImage,
  ImagePlus,
  LoaderCircle,
  Save,
  Trash2,
  X,
} from 'lucide-react';

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  deleteConcertPoster,
  updateConcert,
  uploadAndApplyConcertPoster,
} from '../api/adminConcertApi';

import type {
  AdminConcert,
  AgeRating,
  ConcertCategory,
} from '../types/adminConcert';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

interface UpdateConcertModalProps {
  concert: AdminConcert;

  onClose: () => void;

  onUpdated: () => void;
}

interface ConcertFormState {
  title: string;
  subtitle: string;
  description: string;

  category: ConcertCategory;

  runningTime: string;

  ageRating: AgeRating;
}

const ALLOWED_IMAGE_TYPES =
    new Set<string>([
      'image/jpeg',
      'image/png',
      'image/webp',
    ]);

const MAX_POSTER_SIZE =
    10 * 1024 * 1024;

export default function UpdateConcertModal({
                                             concert,
                                             onClose,
                                             onUpdated,
                                           }: UpdateConcertModalProps) {
  const fileInputRef =
      useRef<HTMLInputElement | null>(
          null,
      );

  const initialForm =
      useMemo<ConcertFormState>(
          () => ({
            title:
            concert.title,

            subtitle:
                concert.subtitle ??
                '',

            description:
                concert.description ??
                '',

            category:
            concert.category,

            runningTime:
                concert.runningTime !=
                null
                    ? String(
                        concert.runningTime,
                    )
                    : '',

            ageRating:
            concert.ageRating,
          }),
          [
            concert,
          ],
      );

  const [
    form,
    setForm,
  ] =
      useState<ConcertFormState>(
          initialForm,
      );

  const [
    posterFile,
    setPosterFile,
  ] =
      useState<File | null>(
          null,
      );

  const [
    posterPreviewUrl,
    setPosterPreviewUrl,
  ] =
      useState<string | null>(
          null,
      );

  const [
    currentPosterUrl,
    setCurrentPosterUrl,
  ] =
      useState<string | null>(
          concert.posterUrl,
      );

  const [
    submitting,
    setSubmitting,
  ] =
      useState(false);

  const [
    deletingPoster,
    setDeletingPoster,
  ] =
      useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
      useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] =
      useState('');

  useEffect(() => {
    return () => {
      if (
          posterPreviewUrl
      ) {
        URL.revokeObjectURL(
            posterPreviewUrl,
        );
      }
    };
  }, [
    posterPreviewUrl,
  ]);

  const basicInformationChanged =
      useMemo(
          () =>
              form.title.trim() !==
              initialForm.title.trim() ||
              form.subtitle.trim() !==
              initialForm.subtitle.trim() ||
              form.description.trim() !==
              initialForm.description.trim() ||
              form.category !==
              initialForm.category ||
              form.runningTime !==
              initialForm.runningTime ||
              form.ageRating !==
              initialForm.ageRating,
          [
            form,
            initialForm,
          ],
      );

  const anythingChanged =
      basicInformationChanged ||
      posterFile !==
      null;

  function updateField<
      K extends keyof ConcertFormState
  >(
      key: K,
      value: ConcertFormState[K],
  ) {
    setForm(
        (current) => ({
          ...current,
          [key]:
          value,
        }),
    );

    setSuccessMessage('');
  }

  function openFilePicker() {
    if (
        submitting ||
        deletingPoster
    ) {
      return;
    }

    fileInputRef.current?.click();
  }

  function resetFileInput() {
    if (
        fileInputRef.current
    ) {
      fileInputRef.current.value =
          '';
    }
  }

  function clearSelectedPoster() {
    if (
        posterPreviewUrl
    ) {
      URL.revokeObjectURL(
          posterPreviewUrl,
      );
    }

    setPosterFile(
        null,
    );

    setPosterPreviewUrl(
        null,
    );

    resetFileInput();
  }

  function handlePosterChange(
      event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
        event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    if (
        !ALLOWED_IMAGE_TYPES.has(
            file.type,
        )
    ) {
      setErrorMessage(
          'JPG, PNG, WEBP 이미지만 사용할 수 있습니다.',
      );

      resetFileInput();

      return;
    }

    if (
        file.size >
        MAX_POSTER_SIZE
    ) {
      setErrorMessage(
          '포스터 이미지는 10MB 이하만 사용할 수 있습니다.',
      );

      resetFileInput();

      return;
    }

    if (
        posterPreviewUrl
    ) {
      URL.revokeObjectURL(
          posterPreviewUrl,
      );
    }

    setPosterFile(
        file,
    );

    setPosterPreviewUrl(
        URL.createObjectURL(
            file,
        ),
    );
  }

  function validateForm(): boolean {
    if (
        !form.title.trim()
    ) {
      setErrorMessage(
          '공연 제목을 입력해주세요.',
      );

      return false;
    }

    if (
        form.runningTime &&
        (
            !Number.isInteger(
                Number(
                    form.runningTime,
                ),
            ) ||
            Number(
                form.runningTime,
            ) <= 0
        )
    ) {
      setErrorMessage(
          '공연 시간은 1분 이상의 정수로 입력해주세요.',
      );

      return false;
    }

    return true;
  }

  async function handleSubmit(
      event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
        submitting ||
        deletingPoster
    ) {
      return;
    }

    if (
        !validateForm()
    ) {
      return;
    }

    if (
        !anythingChanged
    ) {
      setErrorMessage(
          '변경된 내용이 없습니다.',
      );

      return;
    }

    setSubmitting(
        true,
    );

    setErrorMessage('');
    setSuccessMessage('');

    try {
      /*
       * 기본 정보가 실제 변경된 경우에만 PATCH.
       */
      if (
          basicInformationChanged
      ) {
        await updateConcert(
            concert.concertId,
            {
              title:
                  form.title.trim(),

              subtitle:
                  form.subtitle.trim() ||
                  null,

              description:
                  form.description.trim() ||
                  null,

              category:
              form.category,

              runningTime:
                  form.runningTime
                      ? Number(
                          form.runningTime,
                      )
                      : null,

              ageRating:
              form.ageRating,
            },
        );
      }

      /*
       * 새 포스터가 선택된 경우
       *
       * Presigned URL
       * → S3 PUT
       * → DB object key 확정
       * → Backend에서 기존 S3 object 삭제
       */
      if (
          posterFile
      ) {
        await uploadAndApplyConcertPoster(
            concert.concertId,
            posterFile,
        );
      }

      onUpdated();
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '공연 정보 수정에 실패했습니다.',
          ),
      );
    } finally {
      setSubmitting(
          false,
      );
    }
  }

  async function handleDeletePoster() {
    if (
        !currentPosterUrl ||
        deletingPoster ||
        submitting
    ) {
      return;
    }

    const confirmed =
        window.confirm(
            '현재 등록된 공연 포스터를 삭제하시겠습니까?',
        );

    if (
        !confirmed
    ) {
      return;
    }

    setDeletingPoster(
        true,
    );

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await deleteConcertPoster(
          concert.concertId,
      );

      setCurrentPosterUrl(
          null,
      );

      clearSelectedPoster();

      setSuccessMessage(
          '공연 포스터가 삭제되었습니다.',
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '공연 포스터 삭제에 실패했습니다.',
          ),
      );
    } finally {
      setDeletingPoster(
          false,
      );
    }
  }

  const displayPosterUrl =
      posterPreviewUrl ??
      currentPosterUrl;

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
        <div className="flex max-h-[calc(100dvh-32px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                공연 정보 수정
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                공연 기본 정보와 대표 포스터를 관리합니다.
              </p>
            </div>

            <button
                type="button"
                disabled={
                    submitting ||
                    deletingPoster
                }
                onClick={
                  onClose
                }
                className="flex size-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="닫기"
            >
              <X
                  size={20}
              />
            </button>
          </header>

          <form
              onSubmit={
                handleSubmit
              }
              className="min-h-0 flex-1 overflow-y-auto"
          >
            <div className="grid gap-8 px-5 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
              {/*
               * =================================================
               * Poster
               * =================================================
               */}
              <section>
                <div className="flex items-center gap-2">
                  <FileImage
                      size={18}
                      className="text-indigo-600"
                  />

                  <h3 className="text-sm font-bold text-slate-800">
                    대표 포스터
                  </h3>
                </div>

                <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handlePosterChange
                    }
                    disabled={
                        submitting ||
                        deletingPoster
                    }
                    className="hidden"
                />

                <button
                    type="button"
                    disabled={
                        submitting ||
                        deletingPoster
                    }
                    onClick={
                      openFilePicker
                    }
                    className="group mt-4 flex aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-indigo-300 hover:bg-indigo-50/40 disabled:cursor-not-allowed"
                >
                  {displayPosterUrl ? (
                      <img
                          src={
                            displayPosterUrl
                          }
                          alt={`${concert.title} 포스터`}
                          className="size-full object-cover"
                      />
                  ) : (
                      <div className="m-auto flex flex-col items-center px-4 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-white text-indigo-500 shadow-sm">
                          <ImagePlus
                              size={22}
                          />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-slate-700">
                          포스터 선택
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          JPG, PNG, WEBP
                          <br/>
                          최대 10MB
                        </p>
                      </div>
                  )}
                </button>

                {posterFile ? (
                    <div className="mt-3">
                      <p className="truncate text-xs font-medium text-indigo-600">
                        {posterFile.name}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        저장하면 이 이미지로 교체됩니다.
                      </p>

                      <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            disabled={
                              submitting
                            }
                            onClick={
                              openFilePicker
                            }
                            className="h-9 flex-1 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-600"
                        >
                          다시 선택
                        </button>

                        <button
                            type="button"
                            disabled={
                              submitting
                            }
                            onClick={
                              clearSelectedPoster
                            }
                            className="h-9 flex-1 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-600"
                        >
                          선택 취소
                        </button>
                      </div>
                    </div>
                ) : currentPosterUrl ? (
                    <button
                        type="button"
                        disabled={
                            submitting ||
                            deletingPoster
                        }
                        onClick={() =>
                            void handleDeletePoster()
                        }
                        className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {deletingPoster ? (
                          <LoaderCircle
                              size={15}
                              className="animate-spin"
                          />
                      ) : (
                          <Trash2
                              size={15}
                          />
                      )}

                      {deletingPoster
                          ? '삭제 중...'
                          : '현재 포스터 삭제'}
                    </button>
                ) : null}
              </section>

              {/*
               * =================================================
               * Form
               * =================================================
               */}
              <section className="min-w-0">
                <h3 className="text-sm font-bold text-slate-800">
                  기본 정보
                </h3>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-600">
                      공연 제목 *
                    </label>

                    <input
                        value={
                          form.title
                        }
                        onChange={(event) =>
                            updateField(
                                'title',
                                event.target.value,
                            )
                        }
                        disabled={
                          submitting
                        }
                        maxLength={200}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-600">
                      부제
                    </label>

                    <input
                        value={
                          form.subtitle
                        }
                        onChange={(event) =>
                            updateField(
                                'subtitle',
                                event.target.value,
                            )
                        }
                        disabled={
                          submitting
                        }
                        maxLength={200}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      카테고리 *
                    </label>

                    <select
                        value={
                          form.category
                        }
                        onChange={(event) =>
                            updateField(
                                'category',
                                event.target.value as ConcertCategory,
                            )
                        }
                        disabled={
                          submitting
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="CONCERT">콘서트</option>
                      <option value="MUSICAL">뮤지컬</option>
                      <option value="PLAY">연극</option>
                      <option value="CLASSIC">클래식</option>
                      <option value="DANCE">무용</option>
                      <option value="ETC">기타</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      관람 등급 *
                    </label>

                    <select
                        value={
                          form.ageRating
                        }
                        onChange={(event) =>
                            updateField(
                                'ageRating',
                                event.target.value as AgeRating,
                            )
                        }
                        disabled={
                          submitting
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="ALL">전체 관람가</option>
                      <option value="AGE_7">7세 이상</option>
                      <option value="AGE_12">12세 이상</option>
                      <option value="AGE_15">15세 이상</option>
                      <option value="AGE_19">19세 이상</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      공연 시간
                    </label>

                    <input
                        type="number"
                        min={1}
                        step={1}
                        value={
                          form.runningTime
                        }
                        onChange={(event) =>
                            updateField(
                                'runningTime',
                                event.target.value,
                            )
                        }
                        disabled={
                          submitting
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-600">
                      공연 설명
                    </label>

                    <textarea
                        value={
                          form.description
                        }
                        onChange={(event) =>
                            updateField(
                                'description',
                                event.target.value,
                            )
                        }
                        disabled={
                          submitting
                        }
                        rows={7}
                        className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm leading-6 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {errorMessage && (
                    <p
                        role="alert"
                        className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {errorMessage}
                    </p>
                )}

                {successMessage && (
                    <p
                        role="status"
                        className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                    >
                      {successMessage}
                    </p>
                )}
              </section>
            </div>

            <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <button
                  type="button"
                  disabled={
                      submitting ||
                      deletingPoster
                  }
                  onClick={
                    onClose
                  }
                  className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700"
              >
                취소
              </button>

              <button
                  type="submit"
                  disabled={
                      submitting ||
                      deletingPoster
                  }
                  className="flex h-11 min-w-32 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:bg-slate-300"
              >
                {submitting ? (
                    <>
                      <LoaderCircle
                          size={17}
                          className="animate-spin"
                      />

                      저장 중...
                    </>
                ) : (
                    <>
                      <Save
                          size={17}
                      />

                      변경사항 저장
                    </>
                )}
              </button>
            </footer>
          </form>
        </div>
      </div>
  );
}
