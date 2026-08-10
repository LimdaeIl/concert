import {
  Camera,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';

import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

const MAX_FILE_SIZE =
    5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES =
    new Set<string>([
      'image/jpeg',
      'image/png',
      'image/webp',
    ]);

interface ProfileImageEditorProps {
  currentImageUrl: string | null;

  memberName: string;

  selectedFile: File | null;

  disabled?: boolean;

  deleting?: boolean;

  onFileChange: (
      file: File | null,
  ) => void;

  onDelete: () => void;

  onError: (
      message: string,
  ) => void;
}

export default function ProfileImageEditor({
                                             currentImageUrl,
                                             memberName,
                                             selectedFile,
                                             disabled = false,
                                             deleting = false,
                                             onFileChange,
                                             onDelete,
                                             onError,
                                           }: ProfileImageEditorProps) {
  const inputRef =
      useRef<HTMLInputElement | null>(
          null,
      );

  const [
    previewUrl,
    setPreviewUrl,
  ] =
      useState<string | null>(
          null,
      );

  /*
   * 선택 파일이 변경될 때마다
   * 브라우저 Object URL을 생성한다.
   */
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);

      return;
    }

    const objectUrl =
        URL.createObjectURL(
            selectedFile,
        );

    setPreviewUrl(
        objectUrl,
    );

    return () => {
      URL.revokeObjectURL(
          objectUrl,
      );
    };
  }, [selectedFile]);

  const displayImageUrl =
      previewUrl ??
      currentImageUrl;

  function openFilePicker() {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  }

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.value =
          '';
    }
  }

  function handleFileChange(
      event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
        event.target.files?.[0];

    if (!file) {
      return;
    }

    onError('');

    if (
        !ALLOWED_IMAGE_TYPES.has(
            file.type,
        )
    ) {
      onError(
          'JPG, PNG, WEBP 이미지만 사용할 수 있습니다.',
      );

      resetInput();

      return;
    }

    if (
        file.size >
        MAX_FILE_SIZE
    ) {
      onError(
          '프로필 이미지는 5MB 이하만 사용할 수 있습니다.',
      );

      resetInput();

      return;
    }

    onFileChange(
        file,
    );
  }

  function handleCancelSelection() {
    onFileChange(
        null,
    );

    resetInput();
  }

  return (
      <section>
        <div className="flex items-center gap-2">
          <Camera
              size={19}
              className="text-indigo-600"
          />

          <h2 className="text-base font-semibold text-slate-900">
            프로필 이미지
          </h2>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <button
                  type="button"
                  disabled={disabled}
                  onClick={
                    openFilePicker
                  }
                  className="group flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-sm outline-none transition hover:shadow-md disabled:cursor-not-allowed"
                  aria-label="프로필 이미지 선택"
              >
                {displayImageUrl ? (
                    <img
                        src={
                          displayImageUrl
                        }
                        alt={`${memberName} 프로필`}
                        className="size-full object-cover"
                    />
                ) : (
                    <UserRound
                        size={46}
                        strokeWidth={1.5}
                        className="text-slate-300 transition group-hover:text-slate-400"
                    />
                )}
              </button>

              <button
                  type="button"
                  disabled={disabled}
                  onClick={
                    openFilePicker
                  }
                  className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                  aria-label="프로필 이미지 변경"
              >
                <Camera
                    size={16}
                />
              </button>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleFileChange
                }
                disabled={disabled}
                className="hidden"
            />

            {selectedFile ? (
                <>
                  <p className="mt-4 max-w-full truncate text-sm font-semibold text-slate-800">
                    {selectedFile.name}
                  </p>

                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    저장하면 새 이미지가 적용됩니다.
                  </p>

                  <button
                      type="button"
                      disabled={disabled}
                      onClick={
                        handleCancelSelection
                      }
                      className="mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  >
                    <X
                        size={14}
                    />

                    선택 취소
                  </button>
                </>
            ) : (
                <>
                  <p className="mt-4 text-sm font-semibold text-slate-800">
                    {currentImageUrl
                        ? '현재 프로필 이미지'
                        : '프로필 이미지를 등록해주세요.'}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    이미지를 눌러 변경할 수 있습니다.
                  </p>
                </>
            )}

            <p className="mt-3 text-center text-xs leading-5 text-slate-400">
              JPG, PNG, WEBP · 최대 5MB
            </p>

            {!selectedFile &&
                currentImageUrl && (
                    <button
                        type="button"
                        disabled={
                            disabled ||
                            deleting
                        }
                        onClick={
                          onDelete
                        }
                        className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2
                          size={14}
                      />

                      {deleting
                          ? '삭제 중...'
                          : '프로필 이미지 삭제'}
                    </button>
                )}
          </div>
        </div>
      </section>
  );
}
