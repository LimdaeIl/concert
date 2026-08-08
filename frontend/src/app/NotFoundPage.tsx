import {
  ArrowLeft,
  Home,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
        <p className="text-7xl font-black tracking-tight text-slate-200">
          404
        </p>

        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          페이지를 찾을 수 없습니다
        </h1>

        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
          주소가 잘못되었거나 페이지가 이동되었을 수 있습니다.
        </p>

        <div className="mt-8 flex w-full max-w-sm gap-3">
          <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
          >
            <ArrowLeft size={17} />

            이전으로
          </button>

          <button
              type="button"
              onClick={() =>
                  navigate('/', {
                    replace: true,
                  })
              }
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white"
          >
            <Home size={17} />

            홈으로
          </button>
        </div>
      </div>
  );
}
