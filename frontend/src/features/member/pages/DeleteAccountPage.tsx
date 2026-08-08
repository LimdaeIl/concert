import {
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import {
  type SubmitEvent,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/features/auth/store/authStore';
import { deleteMe } from '@/features/member/api/memberApi';
import { getApiErrorMessage } from '@/lib/api/getApiErrorMessage';

export default function DeleteAccountPage() {
  const navigate = useNavigate();

  const clearAuthentication = useAuthStore(
      (state) => state.clearAuthentication,
  );

  const [confirmation, setConfirmation] =
      useState('');
  const [submitting, setSubmitting] =
      useState(false);
  const [errorMessage, setErrorMessage] =
      useState('');

  const canDelete =
      confirmation.trim() === '회원탈퇴';

  async function handleSubmit(
      event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!canDelete) {
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await deleteMe();

      clearAuthentication();

      navigate('/', {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '회원 탈퇴에 실패했습니다.',
          ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <div className="min-h-dvh">
        <header className="flex h-14 items-center border-b border-slate-100 px-4">
          <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100"
              aria-label="뒤로가기"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="ml-2 text-base font-semibold text-slate-900">
            회원 탈퇴
          </h1>
        </header>

        <form
            onSubmit={handleSubmit}
            className="px-5 py-7"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle size={26} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-950">
            정말 탈퇴하시겠습니까?
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            탈퇴하면 회원은 탈퇴 상태로 변경되고
            개인정보가 익명화됩니다.
          </p>

          <div className="mt-7 rounded-2xl bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-700">
              탈퇴 전 확인해주세요.
            </p>

            <p className="mt-2 text-sm leading-6 text-red-600">
              연결된 소셜 계정과 Refresh Token 등의
              인증 정보도 제거됩니다.
            </p>
          </div>

          <div className="mt-8">
            <label
                htmlFor="confirmation"
                className="text-sm font-medium text-slate-700"
            >
              계속하려면 회원탈퇴를 입력해주세요.
            </label>

            <input
                id="confirmation"
                type="text"
                value={confirmation}
                onChange={(event) =>
                    setConfirmation(
                        event.target.value,
                    )
                }
                placeholder="회원탈퇴"
                autoComplete="off"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
            />
          </div>

          {errorMessage && (
              <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
          )}

          <button
              type="submit"
              disabled={
                  !canDelete || submitting
              }
              className="mt-8 h-12 w-full rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting
                ? '탈퇴 처리 중...'
                : '회원 탈퇴'}
          </button>
        </form>
      </div>
  );
}
