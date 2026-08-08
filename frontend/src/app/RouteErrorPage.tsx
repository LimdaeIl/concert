import {
  AlertTriangle,
  Home,
  RefreshCw,
} from 'lucide-react';
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from 'react-router-dom';

export default function RouteErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();

  let title =
      '예상하지 못한 오류가 발생했습니다.';

  let message =
      '잠시 후 다시 시도해주세요.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} 오류`;

    message =
        typeof error.data === 'string'
            ? error.data
            : error.statusText;
  }

  return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle
              size={28}
              strokeWidth={1.8}
          />
        </div>

        <h1 className="mt-5 text-xl font-bold text-slate-950">
          {title}
        </h1>

        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {message}
        </p>

        <div className="mt-8 flex w-full max-w-sm gap-3">
          <button
              type="button"
              onClick={() =>
                  window.location.reload()
              }
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
          >
            <RefreshCw size={17} />

            다시 시도
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
