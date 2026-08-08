import {
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export default function ErrorState({
                                     title = '문제가 발생했습니다.',
                                     message,
                                     retryLabel = '다시 시도',
                                     onRetry,
                                   }: ErrorStateProps) {
  return (
      <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertCircle
              size={28}
              strokeWidth={1.8}
          />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {message}
        </p>

        {onRetry && (
            <button
                type="button"
                onClick={onRetry}
                className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white"
            >
              <RefreshCw size={16} />

              {retryLabel}
            </button>
        )}
      </div>
  );
}