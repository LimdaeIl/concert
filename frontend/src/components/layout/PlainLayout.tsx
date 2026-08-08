import { Outlet } from 'react-router-dom';

export default function PlainLayout() {
  return (
      <div className="min-h-dvh bg-slate-100">
        <main className="mx-auto min-h-dvh w-full max-w-[640px] bg-white shadow-sm">
          <Outlet />
        </main>
      </div>
  );
}
