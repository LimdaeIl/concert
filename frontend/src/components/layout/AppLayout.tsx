import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
      <div className="min-h-screen bg-slate-200">
        <div className="mx-auto min-h-screen w-full bg-white shadow-sm md:max-w-md">
          <Outlet />
        </div>
      </div>
  );
}
