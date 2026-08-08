import { Bell } from 'lucide-react';

export default function AppHeader() {
  return (
      <header className="fixed left-1/2 top-0 z-50 h-14 w-full max-w-[640px] -translate-x-1/2 border-b border-slate-200 bg-white">
        <div className="flex h-full items-center justify-between px-5">
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            Concert
          </h1>

          <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100"
              aria-label="알림"
          >
            <Bell
                size={21}
                strokeWidth={2}
            />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>
        </div>
      </header>
  );
}
