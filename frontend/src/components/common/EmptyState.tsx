import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
                                     icon,
                                     title,
                                     description,
                                     actionLabel,
                                     onAction,
                                   }: EmptyStateProps) {
  return (
      <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
        {icon && (
            <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              {icon}
            </div>
        )}

        <h2 className="mt-5 text-base font-semibold text-slate-700">
          {title}
        </h2>

        {description && (
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
              {description}
            </p>
        )}

        {actionLabel && onAction && (
            <button
                type="button"
                onClick={onAction}
                className="mt-6 h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white"
            >
              {actionLabel}
            </button>
        )}
      </div>
  );
}