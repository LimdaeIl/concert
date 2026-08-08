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

import AddressSearchField from '@/features/address/components/AddressSearchField';
import type { AddressValue } from '@/features/address/types/address';
import {
  getMe,
  updateMyProfile,
} from '@/features/member/api/memberApi';
import { getApiErrorMessage } from '@/lib/api/getApiErrorMessage';

const EMPTY_ADDRESS: AddressValue = {
  zipCode: '',
  roadAddress: '',
  jibunAddress: '',
  detailAddress: '',
};

export default function ProfileEditPage() {
  const navigate =
      useNavigate();

  const [name, setName] =
      useState('');

  const [
    address,
    setAddress,
  ] = useState<AddressValue>(
      EMPTY_ADDRESS,
  );

  const [loading, setLoading] =
      useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  useEffect(() => {
    let active = true;

    async function loadMember() {
      try {
        const member =
            await getMe();

        if (!active) {
          return;
        }

        setName(
            member.name,
        );

        setAddress({
          zipCode:
          member.address.zipCode,

          roadAddress:
          member.address.roadAddress,

          jibunAddress:
          member.address.jibunAddress,

          detailAddress:
          member.address.detailAddress,
        });
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

  async function handleSubmit(
      event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

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

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
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

  if (loading) {
    return (
        <div className="flex min-h-dvh items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

            <p className="text-sm text-slate-500">
              회원 정보를 불러오고 있습니다.
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-dvh pb-10">
        <header className="sticky top-0 z-20 flex h-14 items-center border-b border-slate-100 bg-white px-4">
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
          <section>
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
                  autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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
                  className="mt-7 whitespace-pre-line rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </p>
          )}

          {successMessage && (
              <p
                  role="status"
                  className="mt-7 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {successMessage}
              </p>
          )}

          <button
              type="submit"
              disabled={
                submitting
              }
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Save size={18} />

            {submitting
                ? '저장 중...'
                : '변경사항 저장'}
          </button>
        </form>
      </div>
  );
}
