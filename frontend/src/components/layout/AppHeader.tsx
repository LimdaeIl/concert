import {
  LogIn,
  UserRound,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  useAuthStore,
} from '@/features/auth/store/authStore';

import {
  getMe,
} from '@/features/member/api/memberApi';

export default function AppHeader() {
  const navigate =
      useNavigate();

  const location =
      useLocation();

  const accessToken =
      useAuthStore(
          (state) =>
              state.accessToken,
      );

  const member =
      useAuthStore(
          (state) =>
              state.member,
      );

  const [
    profileImageUrl,
    setProfileImageUrl,
  ] =
      useState<string | null>(
          null,
      );

  const authenticated =
      Boolean(
          accessToken,
      );

  /*
   * 로그인 상태에서 Header가 보여질 때
   * 최신 Presigned GET URL을 조회한다.
   *
   * pathname을 dependency에 포함해서
   * /me/profile에서 이미지 수정 후
   * /me 등으로 돌아오면 다시 갱신되도록 한다.
   */
  useEffect(() => {
    let active = true;

    if (!authenticated) {
      setProfileImageUrl(
          null,
      );

      return () => {
        active = false;
      };
    }

    async function loadProfileImage() {
      try {
        const response =
            await getMe();

        if (!active) {
          return;
        }

        setProfileImageUrl(
            response.profileImageUrl,
        );
      } catch {
        /*
         * Header 프로필 이미지는
         * 부가 UI이므로 조회 실패가
         * 전체 Header 오류로 이어지지 않는다.
         */
        if (active) {
          setProfileImageUrl(
              null,
          );
        }
      }
    }

    void loadProfileImage();

    return () => {
      active = false;
    };
  }, [
    authenticated,
    location.pathname,
  ]);

  return (
      <header className="fixed left-1/2 top-0 z-50 flex h-16 w-full max-w-[640px] -translate-x-1/2 items-center justify-between border-b border-slate-100 bg-white/95 px-5 backdrop-blur">
        <button
            type="button"
            onClick={() =>
                navigate('/')
            }
            className="text-lg font-black tracking-tight text-indigo-600"
        >
          CONCERT
        </button>

        {authenticated ? (
            <button
                type="button"
                onClick={() =>
                    navigate(
                        '/me',
                    )
                }
                className="flex min-w-0 items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-slate-50"
            >
              <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                {profileImageUrl ? (
                    <img
                        src={
                          profileImageUrl
                        }
                        alt={`${member?.name ?? '회원'} 프로필`}
                        className="size-full object-cover"
                        onError={() =>
                            setProfileImageUrl(
                                null,
                            )
                        }
                    />
                ) : (
                    <UserRound
                        size={19}
                        strokeWidth={1.8}
                        className="text-slate-400"
                    />
                )}
              </div>

              <span className="max-w-24 truncate text-sm font-semibold text-slate-800">
                {member?.name ??
                    '회원'}
              </span>
            </button>
        ) : (
            <button
                type="button"
                onClick={() =>
                    navigate(
                        '/login',
                    )
                }
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              <LogIn
                  size={17}
              />

              로그인
            </button>
        )}
      </header>
  );
}
