import {
  UserRound,
} from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/authStore';

export default function AdminHeader() {
  const member =
      useAuthStore(
          (state) => state.member,
      );

  return (
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-8 backdrop-blur">
        <div>
          <p className="text-sm text-slate-500">
            Concert Administration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <UserRound size={18} />
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              {member?.name ?? '관리자'}
            </p>

            <p className="text-xs text-slate-500">
              {member?.email}
            </p>
          </div>
        </div>
      </header>
  );
}