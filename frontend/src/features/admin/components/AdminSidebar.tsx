import {
  Building2,
  CalendarDays,
  CreditCard,
  Gauge,
  MapPinned,
  Music2,
  ReceiptText,
  Users,
} from 'lucide-react';

import {
  NavLink,
} from 'react-router-dom';

const menus = [
  {
    label: '대시보드',
    to: '/admin',
    icon: Gauge,
    end: true,
  },
  {
    label: '공연장',
    to: '/admin/venues',
    icon: MapPinned,
  },
  {
    label: '공연홀 / 좌석',
    to: '/admin/halls',
    icon: Building2,
  },
  {
    label: '공연',
    to: '/admin/concerts',
    icon: Music2,
  },
  {
    label: '회차',
    to: '/admin/performances',
    icon: CalendarDays,
  },
  {
    label: '예약',
    to: '/admin/reservations',
    icon: ReceiptText,
  },
  {
    label: '결제 / 환불',
    to: '/admin/payments',
    icon: CreditCard,
  },
  {
    label: '회원',
    to: '/admin/members',
    icon: Users,
  },
];

export default function AdminSidebar() {
  return (
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-slate-950">
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <span className="text-lg font-bold tracking-tight text-white">
          CONCERT
        </span>

          <span className="ml-2 rounded-md bg-indigo-500/20 px-2 py-1 text-[10px] font-bold text-indigo-300">
          ADMIN
        </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menus.map((menu) => {
            const Icon =
                menu.icon;

            return (
                <NavLink
                    key={menu.to}
                    to={menu.to}
                    end={menu.end}
                    className={({
                                  isActive,
                                }) =>
                        [
                          'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                          isActive
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:bg-slate-900 hover:text-white',
                        ].join(' ')
                    }
                >
                  <Icon size={19} />

                  {menu.label}
                </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <NavLink
              to="/"
              className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
          >
            사용자 화면으로
          </NavLink>
        </div>
      </aside>
  );
}