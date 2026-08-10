import {
  Armchair,
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Music2,
  Plus,
} from 'lucide-react';

import {
  useNavigate,
} from 'react-router-dom';

interface ManagementCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  icon: typeof Building2;
  children: React.ReactNode;
}

function ManagementCard({
                          title,
                          description,
                          buttonLabel,
                          onClick,
                          icon: Icon,
                          children,
                        }: ManagementCardProps) {
  return (
      <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Icon size={22} />
          </div>

          <button
              type="button"
              onClick={onClick}
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
          >
            {buttonLabel}

            <ArrowRight
                size={14}
            />
          </button>
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-950">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-6 flex-1">
          {children}
        </div>
      </article>
  );
}

export default function AdminDashboardPage() {
  const navigate =
      useNavigate();

  return (
      <div className="mx-auto w-full max-w-[1500px]">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              ADMINISTRATION
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              관리자 대시보드
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              공연장 인프라와 공연 판매 구성을
              관리할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        '/admin/venues',
                    )
                }
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Building2
                  size={17}
              />

              공연장
            </button>

            <button
                type="button"
                onClick={() =>
                    navigate(
                        '/admin/concerts',
                    )
                }
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <Plus
                  size={17}
              />

              공연 관리
            </button>
          </div>
        </section>

        {/*
       * 현재 지원 기능
       */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-950">
              현재 관리 기능
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              현재 구현되어 실제로 사용할 수 있는 관리자 기능입니다.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ManagementCard
                title="공연장 인프라"
                description="공연에 사용할 장소와 물리 좌석 구조를 구성합니다."
                buttonLabel="공연장 관리"
                icon={Building2}
                onClick={() =>
                    navigate(
                        '/admin/venues',
                    )
                }
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <Building2
                      size={17}
                      className="shrink-0 text-slate-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      공연장
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      장소 기본정보 및 상태 관리
                    </p>
                  </div>

                  <CheckCircle2
                      size={17}
                      className="shrink-0 text-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <CircleDot
                      size={17}
                      className="shrink-0 text-slate-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      공연홀
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      공연장별 홀 및 수용인원 관리
                    </p>
                  </div>

                  <CheckCircle2
                      size={17}
                      className="shrink-0 text-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <Armchair
                      size={17}
                      className="shrink-0 text-slate-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      물리 좌석
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      구역·층·열·번호별 좌석 구성
                    </p>
                  </div>

                  <CheckCircle2
                      size={17}
                      className="shrink-0 text-emerald-500"
                  />
                </div>
              </div>
            </ManagementCard>

            <ManagementCard
                title="공연 판매 구성"
                description="공연을 생성하고 실제 판매 가능한 회차와 좌석을 구성합니다."
                buttonLabel="공연 관리"
                icon={Music2}
                onClick={() =>
                    navigate(
                        '/admin/concerts',
                    )
                }
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <Music2
                      size={17}
                      className="shrink-0 text-slate-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      공연
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      공연 정보 및 공개 상태 관리
                    </p>
                  </div>

                  <CheckCircle2
                      size={17}
                      className="shrink-0 text-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <CalendarClock
                      size={17}
                      className="shrink-0 text-slate-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      공연 회차
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      공연 및 예매 일정 관리
                    </p>
                  </div>

                  <CheckCircle2
                      size={17}
                      className="shrink-0 text-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <Armchair
                      size={17}
                      className="shrink-0 text-slate-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      판매 좌석
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      회차별 등급·가격·판매상태 관리
                    </p>
                  </div>

                  <CheckCircle2
                      size={17}
                      className="shrink-0 text-emerald-500"
                  />
                </div>
              </div>
            </ManagementCard>
          </div>
        </section>

        {/*
       * 운영 순서
       */}
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              공연 오픈 준비 순서
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              신규 공연 판매를 준비할 때 권장되는 등록 순서입니다.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {[
              {
                step: '01',
                title: '공연장',
                description: '장소 등록',
              },
              {
                step: '02',
                title: '공연홀',
                description: '홀 구성',
              },
              {
                step: '03',
                title: '물리 좌석',
                description: '좌석 배치',
              },
              {
                step: '04',
                title: '공연',
                description: '공연 정보',
              },
              {
                step: '05',
                title: '회차',
                description: '일정 설정',
              },
              {
                step: '06',
                title: '판매 좌석',
                description: '가격 설정',
              },
            ].map(
                (item) => (
                    <div
                        key={item.step}
                        className="relative rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-xs font-bold text-indigo-600">
                        STEP {item.step}
                      </p>

                      <p className="mt-3 text-sm font-bold text-slate-900">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.description}
                      </p>
                    </div>
                ),
            )}
          </div>
        </section>

        <section className="mt-7 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 sm:p-6">
          <h2 className="text-sm font-bold text-indigo-950">
            관리 구조
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-white/80 p-4">
              <p className="text-xs font-semibold text-indigo-500">
                VENUE
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                공연장 → 공연홀 → 물리 좌석
              </p>
            </div>

            <div className="rounded-xl bg-white/80 p-4">
              <p className="text-xs font-semibold text-indigo-500">
                SALES
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                공연 → 회차 → 판매 좌석
              </p>
            </div>
          </div>
        </section>
      </div>
  );
}
