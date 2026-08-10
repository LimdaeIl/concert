import {
  ArrowLeft,
  Save,
  UserRound,
} from 'lucide-react';

import {
  type SubmitEvent,
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import AddressSearchField
  from '@/features/address/components/AddressSearchField';

import type {
  AddressValue,
} from '@/features/address/types/address';

import {
  createProfileImageUploadUrl,
  deleteProfileImage,
  getMe,
  updateMyProfile,
  updateProfileImage,
  uploadProfileImageToS3,
} from '@/features/member/api/memberApi';

import ProfileImageEditor
  from '@/features/member/components/ProfileImageEditor';

import type {
  MemberMeResponse,
} from '@/features/member/types/member';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

const EMPTY_ADDRESS: AddressValue = {
  zipCode: '',
  roadAddress: '',
  jibunAddress: '',
  detailAddress: '',
};

export default function ProfileEditPage() {
  const navigate =
      useNavigate();

  const [
    member,
    setMember,
  ] =
      useState<MemberMeResponse | null>(
          null,
      );

  const [
    name,
    setName,
  ] =
      useState('');

  const [
    address,
    setAddress,
  ] =
      useState<AddressValue>(
          EMPTY_ADDRESS,
      );

  const [
    selectedImageFile,
    setSelectedImageFile,
  ] =
      useState<File | null>(
          null,
      );

  const [
    loading,
    setLoading,
  ] =
      useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
      useState(false);

  const [
    deletingImage,
    setDeletingImage,
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
    let active = true;

    async function loadMember() {
      try {
        const response =
            await getMe();

        if (!active) {
          return;
        }

        applyMember(
            response,
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(
            getApiErrorMessage(
                error,
                '회원 정보를 불러오지 못했습니다.',
            ),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadMember();

    return () => {
      active = false;
    };
  }, []);

  function applyMember(
      nextMember: MemberMeResponse,
  ) {
    setMember(
        nextMember,
    );

    setName(
        nextMember.name,
    );

    setAddress({
      zipCode:
      nextMember.address.zipCode,

      roadAddress:
      nextMember.address.roadAddress,

      jibunAddress:
      nextMember.address.jibunAddress,

      detailAddress:
      nextMember.address.detailAddress,
    });
  }

  function isBasicProfileChanged(): boolean {
    if (!member) {
      return false;
    }

    return (
        name.trim() !==
        member.name ||
        address.zipCode !==
        member.address.zipCode ||
        address.roadAddress !==
        member.address.roadAddress ||
        address.jibunAddress !==
        member.address.jibunAddress ||
        address.detailAddress.trim() !==
        member.address.detailAddress
    );
  }

  async function saveProfileImage(
      file: File,
  ) {
    /*
     * 1. Presigned PUT URL 발급.
     */
    const upload =
        await createProfileImageUploadUrl(
            file.type,
        );

    /*
     * 2. Browser → S3.
     */
    await uploadProfileImageToS3(
        upload.uploadUrl,
        file,
    );

    /*
     * 3. DB에 Object Key 확정.
     *
     * 이 PATCH가 성공해야
     * v1_members.profile_image_key에 저장된다.
     */
    await updateProfileImage({
      objectKey:
      upload.objectKey,
    });
  }

  async function handleSubmit(
      event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!member) {
      return;
    }

    if (!name.trim()) {
      setErrorMessage(
          '이름을 입력해주세요.',
      );

      return;
    }

    if (
        !address.zipCode ||
        !(
            address.roadAddress ||
            address.jibunAddress
        )
    ) {
      setErrorMessage(
          '주소 검색을 완료해주세요.',
      );

      return;
    }

    const imageChanged =
        selectedImageFile !== null;

    const basicProfileChanged =
        isBasicProfileChanged();

    if (
        !imageChanged &&
        !basicProfileChanged
    ) {
      setErrorMessage(
          '변경된 내용이 없습니다.',
      );

      return;
    }

    setSubmitting(true);

    setErrorMessage('');
    setSuccessMessage('');

    try {
      /*
       * 이미지가 선택된 경우
       * 먼저 S3 + DB 이미지 확정 처리.
       */
      if (selectedImageFile) {
        await saveProfileImage(
            selectedImageFile,
        );
      }

      /*
       * 이름/주소가 실제 변경된 경우에만 호출.
       *
       * 백엔드의 NO_PROFILE_CHANGES 예외를
       * 피하기 위해 무조건 호출하지 않는다.
       */
      if (basicProfileChanged) {
        await updateMyProfile({
          name:
              name.trim(),

          roadAddress:
          address.roadAddress,

          jibunAddress:
          address.jibunAddress,

          detailAddress:
              address.detailAddress.trim(),

          zipCode:
          address.zipCode,
        });
      }

      /*
       * 모든 변경 완료 후 최신 회원 정보 조회.
       *
       * 여기서 새로운 profileImageUrl까지
       * 다시 발급받는다.
       */
      const updatedMember =
          await getMe();

      applyMember(
          updatedMember,
      );

      setSelectedImageFile(
          null,
      );

      setSuccessMessage(
          '프로필이 수정되었습니다.',
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '프로필 수정에 실패했습니다.',
          ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteProfileImage() {
    if (
        !member?.profileImageUrl ||
        deletingImage ||
        submitting
    ) {
      return;
    }

    setDeletingImage(true);

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await deleteProfileImage();

      const updatedMember =
          await getMe();

      applyMember(
          updatedMember,
      );

      setSelectedImageFile(
          null,
      );

      setSuccessMessage(
          '프로필 이미지가 삭제되었습니다.',
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '프로필 이미지 삭제에 실패했습니다.',
          ),
      );
    } finally {
      setDeletingImage(false);
    }
  }

  if (loading) {
    return (
        <div className="flex min-h-dvh items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"/>

            <p className="text-sm text-slate-500">
              회원 정보를 불러오고 있습니다.
            </p>
          </div>
        </div>
    );
  }

  if (!member) {
    return (
        <div className="min-h-dvh">
          <header className="sticky top-0 z-20 flex h-14 items-center border-b border-slate-100 bg-white px-4">
            <button
                type="button"
                onClick={() =>
                    navigate(-1)
                }
                className="flex size-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
                aria-label="뒤로가기"
            >
              <ArrowLeft
                  size={22}
              />
            </button>

            <h1 className="ml-2 text-base font-semibold text-slate-900">
              프로필 수정
            </h1>
          </header>

          <div className="px-5 py-8">
            <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorMessage ||
                  '회원 정보를 확인할 수 없습니다.'}
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-dvh pb-10">
        <header className="sticky top-0 z-20 flex h-14 items-center border-b border-slate-100 bg-white/95 px-4 backdrop-blur">
          <button
              type="button"
              onClick={() =>
                  navigate(-1)
              }
              className="flex size-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100"
              aria-label="뒤로가기"
          >
            <ArrowLeft
                size={22}
            />
          </button>

          <h1 className="ml-2 text-base font-semibold text-slate-900">
            프로필 수정
          </h1>
        </header>

        <form
            onSubmit={
              handleSubmit
            }
            className="px-5 py-7"
        >
          <ProfileImageEditor
              currentImageUrl={
                member.profileImageUrl
              }
              memberName={
                member.name
              }
              selectedFile={
                selectedImageFile
              }
              disabled={
                  submitting ||
                  deletingImage
              }
              deleting={
                deletingImage
              }
              onFileChange={
                setSelectedImageFile
              }
              onDelete={() =>
                  void handleDeleteProfileImage()
              }
              onError={
                setErrorMessage
              }
          />

          <section className="mt-9">
            <div className="flex items-center gap-2">
              <UserRound
                  size={19}
                  className="text-indigo-600"
              />

              <h2 className="text-base font-semibold text-slate-900">
                기본 정보
              </h2>
            </div>

            <div className="mt-5">
              <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700"
              >
                이름
              </label>

              <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                      setName(
                          event.target.value,
                      )
                  }
                  disabled={
                    submitting
                  }
                  autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
              />
            </div>
          </section>

          <section className="mt-9">
            <AddressSearchField
                value={address}
                onChange={
                  setAddress
                }
                disabled={
                  submitting
                }
            />
          </section>

          {errorMessage && (
              <p
                  role="alert"
                  className="mt-7 whitespace-pre-line rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </p>
          )}

          {successMessage && (
              <p
                  role="status"
                  className="mt-7 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {successMessage}
              </p>
          )}

          <button
              type="submit"
              disabled={
                  submitting ||
                  deletingImage
              }
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Save
                size={18}
            />

            {submitting
                ? '저장 중...'
                : '변경사항 저장'}
          </button>
        </form>
      </div>
  );
}
