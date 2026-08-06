import { Link } from 'react-router-dom';

import { signOut } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';

export function HomePage() {
  const accessToken = useAuthStore(
      (state) => state.accessToken,
  );

  const clearAuthentication = useAuthStore(
      (state) => state.clearAuthentication,
  );

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      clearAuthentication();
    }
  }

  return (
      <main className="px-5 py-8">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-950">
            CONCERT
          </h1>

          {accessToken ? (
              <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                로그아웃
              </button>
          ) : (
              <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
              >
                로그인
              </Link>
          )}
        </header>

        <section className="py-20 text-center">
          <p className="text-sm font-semibold text-indigo-600">
            공연 예매 서비스
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            보고 싶은 공연을
            <br />
            간편하게 예매하세요
          </h2>

          <p className="mt-5 text-sm leading-6 text-slate-600">
            현재는 인증 기능 구현을 위한 임시 화면입니다.
          </p>

          {accessToken && (
              <Link
                  to="/mypage"
                  className="mt-8 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
              >
                내 정보 확인
              </Link>
          )}
        </section>
      </main>
  );
}
