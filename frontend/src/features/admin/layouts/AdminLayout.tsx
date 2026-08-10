import {
  Building2,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Music2,
} from 'lucide-react';

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom';

import {
  signOut,
} from '@/features/auth/api/authApi';

import {
  useAuthStore,
} from '@/features/auth/store/authStore';

const NAV_ITEMS = [
  {
    to: '/admin',
    label: '대시보드',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/admin/venues',
    label: '공연장 관리',
    icon: Building2,
    end: false,
  },
  {
    to: '/admin/concerts',
    label: '공연 관리',
    icon: Music2,
    end: false,
  },
] as const;

export default function AdminLayout() {
  const navigate =
      useNavigate();

  const member =
      useAuthStore(
          (state) =>
              state.member,
      );

  const clearAuthentication =
      useAuthStore(
          (state) =>
              state.clearAuthentication,
      );

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      clearAuthentication();

      navigate(
          '/login',
          {
            replace: true,
          },
      );
    }
  }

  return (
      <div className="min-h-screen bg-slate-50">
        {/*
       * 1024px 미만에선 72px 아이콘 사이드바,
       * lg 이상에서는 224px 전체 사이드바
       */}
        <aside className="fixed inset-y-0 left-0 z-40 flex w-[72px] flex-col bg-slate-950 text-white transition-[width] lg:w-56">
          <div className="flex h-16 shrink-0 items-center justify-center border-b border-slate-800 px-3 lg:justify-start lg:px-5">
            <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight">
              C
            </span>

              <span className="hidden text-lg font-bold tracking-tight lg:inline">
              ONCERT
            </span>

              <span className="hidden rounded-md bg-indigo-500/20 px-2 py-1 text-[10px] font-bold text-indigo-300 xl:inline">
              ADMIN
            </span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-5 lg:px-3">
            <div className="space-y-1">
              {NAV_ITEMS.map(
                  ({
                     to,
                     label,
                     icon: Icon,
                     end,
                   }) => (
                      <NavLink
                          key={to}
                          to={to}
                          end={end}
                          title={label}
                          className={({
                                        isActive,
                                      }) =>
                              [
                                'flex h-11 items-center justify-center rounded-xl text-sm font-medium transition lg:justify-start lg:gap-3 lg:px-4',
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-white',
                              ].join(' ')
                          }
                      >
                        <Icon
                            size={19}
                            strokeWidth={1.8}
                            className="shrink-0"
                        />

                        <span className="hidden lg:inline">
                    {label}
                  </span>
                      </NavLink>
                  ),
              )}
            </div>
          </nav>

          <div className="shrink-0 border-t border-slate-800 p-2 lg:p-3">
            <button
                type="button"
                title="사용자 화면으로"
                onClick={() =>
                    navigate('/')
                }
                className="flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white lg:justify-start lg:gap-3 lg:px-4"
            >
              <ExternalLink
                  size={18}
                  className="shrink-0"
              />

              <span className="hidden lg:inline">
              사용자 화면
            </span>
            </button>

            <button
                type="button"
                title="로그아웃"
                onClick={() =>
                    void handleSignOut()
                }
                className="mt-1 flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-red-400 transition hover:bg-red-950/40 lg:justify-start lg:gap-3 lg:px-4"
            >
              <LogOut
                  size={18}
                  className="shrink-0"
              />

              <span className="hidden lg:inline">
              로그아웃
            </span>
            </button>
          </div>
        </aside>

        {/*
       * 중요:
       * min-w-0가 없으면 자식 table 때문에
       * 전체 layout이 오른쪽으로 밀릴 수 있다.
       */}
        <div className="min-w-0 pl-[72px] transition-[padding] lg:pl-56">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-7">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                Concert Administration
              </p>

              <p className="hidden text-xs text-slate-400 sm:block">
                공연 운영 관리 시스템
              </p>
            </div>

            <div className="min-w-0 text-right">
              <p className="text-sm font-semibold text-slate-900">
                관리자
              </p>

              {member?.email && (
                  <p className="hidden max-w-56 truncate text-xs text-slate-400 sm:block">
                    {member.email}
                  </p>
              )}
            </div>
          </header>

          <main className="min-w-0 p-4 sm:p-5 lg:p-7">
            <Outlet />
          </main>
        </div>
      </div>
  );
}
