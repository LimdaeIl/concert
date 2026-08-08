interface LoadingStateProps {
  message?: string;
  minHeightClassName?: string;
}

export default function LoadingState({
                                       message = '불러오고 있습니다.',
                                       minHeightClassName = 'min-h-[420px]',
                                     }: LoadingStateProps) {
  return (
      <div
          className={[
            'flex items-center justify-center px-5',
            minHeightClassName,
          ].join(' ')}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="text-sm text-slate-500">
            {message}
          </p>
        </div>
      </div>
  );
}