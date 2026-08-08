import { Outlet } from 'react-router-dom';

import AppHeader from './AppHeader';
import BottomNavigation from './BottomNavigation';

export default function AppLayout() {
  return (
      <div className="min-h-dvh bg-slate-100">
        <div className="relative mx-auto min-h-dvh w-full max-w-[640px] bg-white shadow-sm">
          <AppHeader />

          <main className="min-h-dvh pb-20 pt-14">
            <Outlet />
          </main>

          <BottomNavigation />
        </div>
      </div>
  );
}
