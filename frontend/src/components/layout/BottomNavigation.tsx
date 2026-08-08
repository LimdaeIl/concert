import {
  Home,
  Search,
  Ticket,
  UserRound,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navigationItems = [
  {
    to: '/',
    label: '홈',
    icon: Home,
  },
  {
    to: '/concerts',
    label: '공연',
    icon: Search,
  },
  {
    to: '/reservations',
    label: '예매',
    icon: Ticket,
  },
  {
    to: '/me',
    label: '마이',
    icon: UserRound,
  },
];

export default function BottomNavigation() {
  return (
      <footer className="fixed bottom-0 left-1/2 z-50 w-full max-w-[640px] -translate-x-1/2 border-t border-slate-200 bg-white">
        <nav className="grid h-16 grid-cols-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                        [
                          'flex flex-col items-center justify-center gap-1 transition-colors',
                          isActive
                              ? 'text-slate-950'
                              : 'text-slate-400',
                        ].join(' ')
                    }
                >
                  {({ isActive }) => (
                      <>
                        <Icon
                            size={22}
                            strokeWidth={isActive ? 2.5 : 2}
                        />

                        <span
                            className={[
                              'text-xs',
                              isActive ? 'font-semibold' : 'font-medium',
                            ].join(' ')}
                        >
                    {item.label}
                  </span>
                      </>
                  )}
                </NavLink>
            );
          })}
        </nav>

        <div className="h-[env(safe-area-inset-bottom)] bg-white" />
      </footer>
  );
}
