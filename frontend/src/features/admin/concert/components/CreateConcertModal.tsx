import {
  FileImage,
  ImagePlus,
  LoaderCircle,
  Save,
  X,
} from 'lucide-react';

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  createConcert,
  uploadAndApplyConcertPoster,
} from '../api/adminConcertApi';

import type {
  AgeRating,
  ConcertCategory,
} from '../types/adminConcert';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

interface CreateConcertModalProps {
  onClose: () => void;

  onCreated: () => void;
}

interface ConcertFormState {
  title: string;
  subtitle: string;
  description: string;

  category: ConcertCategory;

  runningTime: string;

  ageRating: AgeRating;
}

const INITIAL_FORM: ConcertFormState = {
  title: '',
  subtitle: '',
  description: '',

  category: 'CONCERT',

  runningTime: '',

  ageRating: 'ALL',
};

const ALLOWED_IMAGE_TYPES =
    new Set<string>([
      'image/jpeg',
      'image/png',
      'image/webp',
    ]);

const MAX_POSTER_SIZE =
    10 * 1024 * 1024;

export default function CreateConcertModal({
                                             onClose,
                                             onCreated,
                                           }: CreateConcertModalProps) {
  const fileInputRef =
      useRef<HTMLInputElement | null>(
          null,
      );

  const [
    form,
    setForm,
  ] =
      useState<ConcertFormState>(
          INITIAL_FORM,
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

  /*
   * 공연 생성까지 성공했는데
   * 포스터 업로드만 실패했을 경우
   * 같은 공연을 중복 생성하지 않고
   * 포스터만 다시 시도하기 위해 유지한다.
   */
  const [
    createdConcertId,
    setCreatedConcertId,
  ] =
      useState<number | null>(
          null,
      );

  const [
    submitting,
    setSubmitting,
  ] =
      useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
      useState('');

  /*
   * Browser Object URL 정리.
   */
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
  }

  function openFilePicker() {
    if (
        submitting
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

  function clearPoster() {
    if (
        posterPreviewUrl
    ) {
      URL.revokeObjectURL(
          posterPreviewUrl,
      );
    }

    setPosterPreviewUrl(
        null,
    );

    setPosterFile(
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
        submitting
    ) {
      return;
    }

    if (
        !validateForm()
    ) {
      return;
    }

    setSubmitting(
        true,
    );

    setErrorMessage('');

    try {
      let concertId =
          createdConcertId;

      /*
       * 아직 공연 자체가 생성되지 않은 경우에만
       * POST /admin/concerts 수행.
       */
      if (
          concertId ===
          null
      ) {
        const created =
            await createConcert({
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
            });

        concertId =
            created.concertId;

        setCreatedConcertId(
            concertId,
        );
      }

      /*
       * 포스터는 선택 사항.
       */
      if (
          posterFile
      ) {
        await uploadAndApplyConcertPoster(
            concertId,
            posterFile,
        );
      }

      onCreated();
    } catch (error) {
      /*
       * 공연 생성은 성공했지만
       * 포스터 단계에서 실패했어도
       * createdConcertId가 유지된다.
       *
       * 사용자가 다시 저장하면
       * 같은 공연을 또 만들지 않고
       * 포스터 업로드만 재시도한다.
       */
      if (
          createdConcertId
      ) {
        setErrorMessage(
            getApiErrorMessage(
                error,
                '공연은 생성되었지만 포스터 적용에 실패했습니다. 다시 저장하면 포스터 업로드만 재시도합니다.',
            ),
        );
      } else {
        setErrorMessage(
            getApiErrorMessage(
                error,
                '공연 등록에 실패했습니다.',
            ),
        );
      }
    } finally {
      setSubmitting(
          false,
      );
    }
  }

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
        <div className="flex max-h-[calc(100dvh-32px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/*
           * ===================================================
           * Header
           * ===================================================
           */}
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                공연 등록
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                공연 기본 정보와 대표 포스터를 등록합니다.
              </p>
            </div>

            <button
                type="button"
                disabled={
                  submitting
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
                      submitting
                    }
                    className="hidden"
                />

                <button
                    type="button"
                    disabled={
                      submitting
                    }
                    onClick={
                      openFilePicker
                    }
                    className="group mt-4 flex aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-indigo-300 hover:bg-indigo-50/40 disabled:cursor-not-allowed"
                >
                  {posterPreviewUrl ? (
                      <img
                          src={
                            posterPreviewUrl
                          }
                          alt="공연 포스터 미리보기"
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

                {posterFile && (
                    <div className="mt-3">
                      <p className="truncate text-xs font-medium text-slate-600">
                        {posterFile.name}
                      </p>

                      <div className="mt-2 flex gap-2">
                        <button
                            type="button"
                            disabled={
                              submitting
                            }
                            onClick={
                              openFilePicker
                            }
                            className="h-9 flex-1 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          변경
                        </button>

                        <button
                            type="button"
                            disabled={
                              submitting
                            }
                            onClick={
                              clearPoster
                            }
                            className="h-9 flex-1 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          제거
                        </button>
                      </div>
                    </div>
                )}
              </section>

              {/*
               * =================================================
               * Basic Information
               * =================================================
               */}
              <section className="min-w-0">
                <h3 className="text-sm font-bold text-slate-800">
                  기본 정보
                </h3>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                        htmlFor="create-concert-title"
                        className="text-xs font-semibold text-slate-600"
                    >
                      공연 제목 *
                    </label>

                    <input
                        id="create-concert-title"
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
                        className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                        htmlFor="create-concert-subtitle"
                        className="text-xs font-semibold text-slate-600"
                    >
                      부제
                    </label>

                    <input
                        id="create-concert-subtitle"
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
                        className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                        htmlFor="create-concert-category"
                        className="text-xs font-semibold text-slate-600"
                    >
                      카테고리 *
                    </label>

                    <select
                        id="create-concert-category"
                        value={
                          form.category
                        }
                        onChange={(event) =>
                            updateField(
                                'category',
                                event.target
                                    .value as
                                    ConcertCategory,
                            )
                        }
                        disabled={
                          submitting
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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
                    <label
                        htmlFor="create-concert-age-rating"
                        className="text-xs font-semibold text-slate-600"
                    >
                      관람 등급 *
                    </label>

                    <select
                        id="create-concert-age-rating"
                        value={
                          form.ageRating
                        }
                        onChange={(event) =>
                            updateField(
                                'ageRating',
                                event.target
                                    .value as
                                    AgeRating,
                            )
                        }
                        disabled={
                          submitting
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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
                    <label
                        htmlFor="create-concert-running-time"
                        className="text-xs font-semibold text-slate-600"
                    >
                      공연 시간
                    </label>

                    <div className="relative mt-2">
                      <input
                          id="create-concert-running-time"
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
                          className="h-11 w-full rounded-xl border border-slate-300 px-3.5 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />

                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        분
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                        htmlFor="create-concert-description"
                        className="text-xs font-semibold text-slate-600"
                    >
                      공연 설명
                    </label>

                    <textarea
                        id="create-concert-description"
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
                        className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm leading-6 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {errorMessage && (
                    <p
                        role="alert"
                        className="mt-5 whitespace-pre-line rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {errorMessage}
                    </p>
                )}
              </section>
            </div>

            <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <button
                  type="button"
                  disabled={
                    submitting
                  }
                  onClick={
                    onClose
                  }
                  className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                취소
              </button>

              <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="flex h-11 min-w-32 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
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

                      공연 등록
                    </>
                )}
              </button>
            </footer>
          </form>
        </div>
      </div>
  );
}
