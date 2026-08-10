import {
  CalendarDays,
  CreditCard,
  Music2,
  Ticket,
} from 'lucide-react';

const cards = [
  {
    label: '등록 공연',
    value: '-',
    description: '등록된 공연 수',
    icon: Music2,
  },
  {
    label: '예정 회차',
    value: '-',
    description: '예정된 공연 회차',
    icon: CalendarDays,
  },
  {
    label: '전체 예약',
    value: '-',
    description: '누적 예약 건수',
    icon: Ticket,
  },
  {
    label: '결제 완료',
    value: '-',
    description: '결제 완료 건수',
    icon: CreditCard,
  },
];

export default function AdminDashboardPage() {
  return (
      <div className="mx-auto max-w-[1600px]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            대시보드
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            공연 서비스의 운영 현황을 관리합니다.
          </p>
        </div>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon =
                card.icon;

            return (
                <div
                    key={card.label}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {card.label}
                      </p>

                      <p className="mt-3 text-3xl font-bold text-slate-950">
                        {card.value}
                      </p>
                    </div>

                    <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon size={21} />
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    {card.description}
                  </p>
                </div>
            );
          })}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="min-h-80 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              최근 예약
            </h2>

            <div className="flex h-56 items-center justify-center">
              <p className="text-sm text-slate-400">
                예약 조회 API 연결 예정
              </p>
            </div>
          </div>

          <div className="min-h-80 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              최근 결제
            </h2>

            <div className="flex h-56 items-center justify-center">
              <p className="text-sm text-slate-400">
                결제 조회 API 연결 예정
              </p>
            </div>
          </div>
        </section>
      </div>
  );
}