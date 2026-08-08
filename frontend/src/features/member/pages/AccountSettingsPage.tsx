import {
  ArrowLeft,
  ChevronRight,
  KeyRound,
  Mail,
  Phone,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AccountSettingsPage() {
  const navigate = useNavigate();

  return (
      <div className="min-h-dvh pb-10">
        <header className="flex h-14 items-center border-b border-slate-100 px-4">
          <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex size-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100"
              aria-label="뒤로가기"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="ml-2 text-base font-semibold text-slate-900">
            계정 설정
          </h1>
        </header>

        <div className="px-5 py-6">
          <section>
            <h2 className="text-sm font-semibold text-slate-500">
              로그인 정보
            </h2>

            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <button
                  type="button"
                  onClick={() =>
                      navigate('/me/settings/email')
                  }
                  className="flex w-full items-center gap-3 border-b border-slate-200 px-4 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <Mail
                    size={20}
                    className="text-slate-500"
                />

                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    이메일 변경
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    새 이메일 인증 후 변경합니다.
                  </p>
                </div>

                <ChevronRight
                    size={18}
                    className="text-slate-300"
                />
              </button>

              <button
                  type="button"
                  onClick={() =>
                      navigate('/me/settings/phone')
                  }
                  className="flex w-full items-center gap-3 border-b border-slate-200 px-4 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <Phone
                    size={20}
                    className="text-slate-500"
                />

                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    휴대전화번호 변경
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    새 번호 인증 후 변경합니다.
                  </p>
                </div>

                <ChevronRight
                    size={18}
                    className="text-slate-300"
                />
              </button>

              <button
                  type="button"
                  disabled
                  className="flex w-full items-center gap-3 px-4 py-4 text-left opacity-50"
              >
                <KeyRound
                    size={20}
                    className="text-slate-500"
                />

                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    비밀번호 변경
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Request DTO 확인 후 연결 예정
                  </p>
                </div>
              </button>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold text-red-500">
              계정 삭제
            </h2>

            <button
                type="button"
                onClick={() =>
                    navigate('/me/settings/delete')
                }
                className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-left transition-colors hover:bg-red-100"
            >
              <Trash2
                  size={20}
                  className="text-red-500"
              />

              <div className="flex-1">
                <p className="text-sm font-semibold text-red-600">
                  회원 탈퇴
                </p>

                <p className="mt-1 text-xs text-red-400">
                  탈퇴 후 개인정보는 익명화됩니다.
                </p>
              </div>

              <ChevronRight
                  size={18}
                  className="text-red-300"
              />
            </button>
          </section>
        </div>
      </div>
  );
}
