import {
  ArrowLeft,
  Check,
  Mail,
} from 'lucide-react';
import {
  type SubmitEvent,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import {
  sendEmailVerification,
  verifyEmail,
} from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { changeEmail } from '@/features/member/api/memberApi';
import { getApiErrorMessage } from '@/lib/api/getApiErrorMessage';

export default function ChangeEmailPage() {
  const navigate = useNavigate();

  const clearAuthentication = useAuthStore(
      (state) => state.clearAuthentication,
  );

  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] =
      useState('');
  const [
    verificationToken,
    setVerificationToken,
  ] = useState('');

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] =
      useState(false);
  const [submitting, setSubmitting] =
      useState(false);

  const [errorMessage, setErrorMessage] =
      useState('');
  const [successMessage, setSuccessMessage] =
      useState('');

  const verified = Boolean(verificationToken);

  async function handleSendVerification() {
    if (!email.trim()) {
      setErrorMessage(
          '새 이메일을 입력해주세요.',
      );
      return;
    }

    setSending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await sendEmailVerification({
        email: email.trim(),
      });

      setSuccessMessage(
          '인증번호를 발송했습니다.',
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '인증번호 발송에 실패했습니다.',
          ),
      );
    } finally {
      setSending(false);
    }
  }

  async function handleVerify() {
    if (
        !email.trim() ||
        !verificationCode.trim()
    ) {
      setErrorMessage(
          '이메일과 인증번호를 입력해주세요.',
      );
      return;
    }

    setVerifying(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await verifyEmail({
        email: email.trim(),
        verificationCode:
            verificationCode.trim(),
      });

      setVerificationToken(
          response.verificationToken,
      );

      setSuccessMessage(
          '이메일 인증이 완료되었습니다.',
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '이메일 인증에 실패했습니다.',
          ),
      );
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmit(
      event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!verificationToken) {
      setErrorMessage(
          '이메일 인증을 완료해주세요.',
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await changeEmail({
        email: email.trim(),
        verificationToken,
      });

      clearAuthentication();

      navigate('/login', {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '이메일 변경에 실패했습니다.',
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
            이메일 변경
          </h1>
        </header>

        <form
            onSubmit={handleSubmit}
            className="px-5 py-7"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Mail size={22} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-950">
            새 이메일을 인증해주세요
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            이메일 변경 후에는 보안을 위해 다시
            로그인해야 합니다.
          </p>

          <div className="mt-8 flex gap-2">
            <input
                type="email"
                autoComplete="email"
                value={email}
                disabled={verified}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setVerificationToken('');
                }}
                placeholder="new@example.com"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
            />

            <button
                type="button"
                onClick={() =>
                    void handleSendVerification()
                }
                disabled={sending || verified}
                className="shrink-0 rounded-xl border border-slate-300 px-4 text-sm font-semibold disabled:bg-slate-100 disabled:text-slate-400"
            >
              {sending ? '발송 중' : '인증번호'}
            </button>
          </div>

          {!verified && (
              <div className="mt-3 flex gap-2">
                <input
                    type="text"
                    inputMode="numeric"
                    value={verificationCode}
                    onChange={(event) =>
                        setVerificationCode(
                            event.target.value,
                        )
                    }
                    placeholder="인증번호"
                    className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />

                <button
                    type="button"
                    disabled={verifying}
                    onClick={() =>
                        void handleVerify()
                    }
                    className="rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:bg-slate-300"
                >
                  {verifying ? '확인 중' : '확인'}
                </button>
              </div>
          )}

          {verified && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <Check size={17} />
                이메일 인증이 완료되었습니다.
              </div>
          )}

          {errorMessage && (
              <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
          )}

          {successMessage && !verified && (
              <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </p>
          )}

          <button
              type="submit"
              disabled={submitting || !verified}
              className="mt-8 h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting
                ? '변경 중...'
                : '이메일 변경'}
          </button>
        </form>
      </div>
  );
}
