import {type SubmitEvent, useState,} from 'react';

import {Link, useLocation, useNavigate,} from 'react-router-dom';

import {getMe} from '@/features/member/api/memberApi';
import {getApiErrorMessage} from '@/lib/api/getApiErrorMessage';

import {signIn} from '../api/authApi';
import {useAuthStore} from '../store/authStore';

import githubLogo from '@/assets/github-logo.png';
import googleLogo from '@/assets/google-logo.webp';
import kakaoLogo from '@/assets/kakao-logo.webp';

interface LocationState {
  from?: string;
}

type SocialProvider =
    | 'google'
    | 'kakao'
    | 'github';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL
    ?.replace(/\/$/, '');

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const setAuthentication =
      useAuthStore(
          (state) =>
              state.setAuthentication,
      );

  const setMember =
      useAuthStore(
          (state) =>
              state.setMember,
      );

  const [email, setEmail] =
      useState('');

  const [password, setPassword] =
      useState('');

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    socialSubmitting,
    setSocialSubmitting,
  ] = useState<SocialProvider | null>(
      null,
  );

  async function handleSubmit(
      event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
        !email.trim() ||
        !password
    ) {
      setErrorMessage(
          '이메일과 비밀번호를 입력해주세요.',
      );

      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const authentication =
          await signIn({
            email: email.trim(),
            password,
          });

      setAuthentication(
          authentication.id,
          authentication.accessToken,
      );

      const member =
          await getMe();

      setMember({
        id: member.id,
        name: member.name,
        email: member.email,
      });

      const state =
          location.state as
              | LocationState
              | null;

      navigate(
          state?.from ?? '/',
          {
            replace: true,
          },
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '이메일 또는 비밀번호를 확인해주세요.',
          ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleSocialLogin(
      provider: SocialProvider,
  ) {
    if (!API_BASE_URL) {
      setErrorMessage(
          'API 서버 주소가 설정되어 있지 않습니다.',
      );

      return;
    }

    setErrorMessage('');
    setSocialSubmitting(provider);

    window.location.assign(
        `${API_BASE_URL}/oauth2/authorization/${provider}`,
    );
  }

  const isBusy =
      submitting ||
      socialSubmitting !== null;

  return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col bg-white px-5">
        <header className="flex h-16 items-center">
          <Link
              to="/"
              className="text-lg font-bold tracking-tight text-slate-950"
          >
            CONCERT
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-12">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              다시 만나서 반가워요
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              로그인
            </h1>

            <p className="mt-3 text-sm text-slate-600">
              이메일 또는 소셜 계정으로
              로그인해주세요.
            </p>
          </div>

          {/* 일반 로그인 */}
          <form
              className="mt-10 space-y-5"
              onSubmit={handleSubmit}
          >
            <div>
              <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
              >
                이메일
              </label>

              <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  disabled={isBusy}
                  onChange={(event) =>
                      setEmail(
                          event.target.value,
                      )
                  }
                  placeholder="user@example.com"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
              >
                비밀번호
              </label>

              <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  disabled={isBusy}
                  onChange={(event) =>
                      setPassword(
                          event.target.value,
                      )
                  }
                  placeholder="비밀번호"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
              />
            </div>

            {errorMessage && (
                <p
                    role="alert"
                    className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {errorMessage}
                </p>
            )}

            <button
                type="submit"
                disabled={isBusy}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting
                  ? '로그인 중...'
                  : '로그인'}
            </button>
          </form>

          {/* 구분선 */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200"/>

            <span className="shrink-0 text-xs font-medium text-slate-400">
            또는 소셜 계정으로 로그인
          </span>

            <div className="h-px flex-1 bg-slate-200"/>
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3">
            {/* Google */}
            <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                    handleSocialLogin('google')
                }
                className="relative flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <img
                  src={googleLogo}
                  alt=""
                  aria-hidden="true"
                  className="absolute left-4 size-5 object-contain"
              />

              <span>
                {socialSubmitting === 'google' ? 'Google 연결 중...' : 'Google로 계속하기'}
              </span>
            </button>

            {/* Kakao */}
            <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                    handleSocialLogin('kakao')
                }
                className="relative flex w-full items-center justify-center rounded-xl bg-[#FEE500] px-4 py-3.5 text-sm font-semibold text-[#191919] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <img
                  src={kakaoLogo}
                  alt=""
                  aria-hidden="true"
                  className="absolute left-4 size-5 object-contain"
              />

              <span>
                {socialSubmitting === 'kakao' ? 'Kakao 연결 중...' : '카카오로 계속하기'}
              </span>
            </button>

            {/* GitHub */}
            <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                    handleSocialLogin('github')
                }
                className="relative flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <img
                  src={githubLogo}
                  alt=""
                  aria-hidden="true"
                  className="absolute left-4 size-5 object-contain"
              />

              <span>
                {socialSubmitting === 'github' ? 'GitHub 연결 중...' : 'GitHub로 계속하기'}
              </span>
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            아직 계정이 없나요?{' '}

            <Link
                to="/sign-up"
                className="font-semibold text-indigo-600"
            >
              회원가입
            </Link>
          </p>
        </section>
      </main>
  );
}
