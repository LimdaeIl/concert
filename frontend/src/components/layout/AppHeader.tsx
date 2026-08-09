import {LogIn,} from 'lucide-react';
import {useNavigate,} from 'react-router-dom';

import defaultProfileImage from '@/assets/default-profile.png';
import {useAuthStore} from '@/features/auth/store/authStore';

export default function AppHeader() {
  const navigate =
      useNavigate();

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

  const authenticated =
      Boolean(accessToken);

  return (
      <header
          className="fixed left-1/2 top-0 z-50 flex h-16 w-full max-w-[640px] -translate-x-1/2 items-center justify-between border-b border-slate-100 bg-white/95 px-5 backdrop-blur">
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
                    navigate('/me')
                }
                className="flex min-w-0 items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-slate-50"
            >
              <img
                  src={
                    defaultProfileImage
                  }
                  alt="기본 프로필"
                  className="size-9 shrink-0 rounded-full border border-slate-200 object-cover"
              />
              <span className="max-w-24 truncate text-sm font-semibold text-slate-800">
                {member?.name ?? '회원'}
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
