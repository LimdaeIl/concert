import {
  ChevronRight,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
  Ticket,
  UserRound,
} from 'lucide-react';
import {useEffect, useState,} from 'react';
import {useNavigate} from 'react-router-dom';

import {signOut} from '@/features/auth/api/authApi';
import {useAuthStore} from '@/features/auth/store/authStore';
import {getMe,} from '@/features/member/api/memberApi';
import type {MemberMeResponse,} from '@/features/member/types/member';
import {getApiErrorMessage} from '@/lib/api/getApiErrorMessage';

export default function MyPage() {
  const navigate = useNavigate();

  const clearAuthentication = useAuthStore(
      (state) => state.clearAuthentication,
  );

  const [
    member,
    setMember,
  ] = useState<MemberMeResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
      useState('');
  const [signingOut, setSigningOut] =
      useState(false);

  useEffect(() => {
    let active = true;

    async function loadMember() {
      try {
        const response = await getMe();

        if (!active) {
          return;
        }

        setMember(response);
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

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOut();
    } finally {
      clearAuthentication();

      navigate('/', {
        replace: true,
      });
    }
  }

  if (loading) {
    return (
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
                className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"/>

            <p className="text-sm text-slate-500">
              회원 정보를 불러오고 있습니다.
            </p>
          </div>
        </div>
    );
  }

  if (errorMessage || !member) {
    return (
        <div className="px-5 py-6">
          <h2 className="text-2xl font-bold text-slate-950">
            마이
          </h2>

          <div className="mt-8 rounded-2xl bg-red-50 p-5">
            <p className="text-sm text-red-700">
              {errorMessage ||
                  '회원 정보를 확인할 수 없습니다.'}
            </p>
          </div>
        </div>
    );
  }

  const addressText = [
    member.address.roadAddress,
    member.address.detailAddress,
  ]
  .filter(Boolean)
  .join(' ');

  return (
      <div className="pb-10">
        <section className="px-5 pt-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            마이
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            내 정보와 예매 내역을 관리할 수 있습니다.
          </p>
        </section>

        <section className="mt-6 px-5">
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center gap-4">
              <div
                  className="flex size-16 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                <UserRound
                    size={29}
                    strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-lg font-bold text-slate-950">
                    {member.name}
                  </h3>

                  <span
                      className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600">
                  {member.role}
                </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  회원번호 {member.memberId}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
              <div className="flex items-center gap-3">
                <Mail
                    size={17}
                    className="shrink-0 text-slate-400"
                />

                <p className="min-w-0 truncate text-sm text-slate-600">
                  {member.email}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Phone
                    size={17}
                    className="shrink-0 text-slate-400"
                />

                <p className="text-sm text-slate-600">
                  {member.phone}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                    size={17}
                    className="mt-0.5 shrink-0 text-slate-400"
                />

                <p className="text-sm leading-5 text-slate-600">
                  {addressText || '등록된 주소가 없습니다.'}
                </p>
              </div>
            </div>

            {member.socialProviders.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-5">
                  {member.socialProviders.map(
                      (provider) => (
                          <span
                              key={provider}
                              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm"
                          >
                    {provider}
                  </span>
                      ),
                  )}
                </div>
            )}
          </div>
        </section>

        <section className="mt-8 px-5">
          <h3 className="text-sm font-semibold text-slate-500">
            예매
          </h3>

          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
            <button
                type="button"
                onClick={() =>
                    navigate('/reservations')
                }
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <Ticket
                  size={20}
                  className="text-slate-500"
              />

              <span className="flex-1 text-sm font-medium text-slate-800">
              내 예매 내역
            </span>

              <ChevronRight
                  size={18}
                  className="text-slate-300"
              />
            </button>
          </div>
        </section>

        <section className="mt-7 px-5">
          <h3 className="text-sm font-semibold text-slate-500">
            회원 정보
          </h3>

          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
            <button
                type="button"
                onClick={() =>
                    navigate('/me/profile')
                }
                className="flex w-full items-center gap-3 border-b border-slate-200 px-4 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <Settings
                  size={20}
                  className="text-slate-500"
              />

              <span className="flex-1 text-sm font-medium text-slate-800">
              프로필 수정
            </span>

              <ChevronRight
                  size={18}
                  className="text-slate-300"
              />
            </button>
            <button
                type="button"
                onClick={() =>
                    navigate('/me/settings')
                }
                className="flex w-full items-center gap-3 border-b border-slate-200 px-4 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <ShieldCheck
                  size={20}
                  className="text-slate-500"
              />

              <span className="flex-1 text-sm font-medium text-slate-800">
                계정 설정
              </span>
              <ChevronRight
                  size={18}
                  className="text-slate-300"
              />
            </button>

            <button
                type="button"
                onClick={() =>
                    void handleSignOut()
                }
                disabled={signingOut}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut
                  size={20}
                  className="text-red-500"
              />

              <span className="flex-1 text-sm font-medium text-red-600">
              {signingOut
                  ? '로그아웃 중...'
                  : '로그아웃'}
            </span>
            </button>
          </div>
        </section>
      </div>
  );
}
