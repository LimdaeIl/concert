import {
  CalendarDays,
} from 'lucide-react';

import ConcertPoster from './ConcertPoster';

import type {
  Concert,
} from '../types/concert';

interface ConcertCardProps {
  concert: Concert;
  onClick: () => void;
  variant?: 'grid' | 'horizontal';
}

export default function ConcertCard({
                                      concert,
                                      onClick,
                                      variant = 'grid',
                                    }: ConcertCardProps) {
  if (
      variant ===
      'horizontal'
  ) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full gap-4 rounded-2xl border border-slate-200 bg-white p-3 text-left transition-colors hover:bg-slate-50"
        >
          <div className="aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            <ConcertPoster
                src={
                  concert.posterUrl
                }
                alt={`${concert.title} 포스터`}
                className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1 py-1">
            <p className="text-xs font-semibold text-indigo-600">
              {concert.category}
            </p>

            <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-6 text-slate-900">
              {concert.title}
            </h3>

            {concert.subtitle && (
                <p className="mt-2 truncate text-sm text-slate-500">
                  {concert.subtitle}
                </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {concert.runningTime && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                <CalendarDays
                    size={11}
                    className="mr-1 inline"
                />

                    {concert.runningTime}
                    분
              </span>
              )}

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
              {concert.ageRating}
            </span>
            </div>
          </div>
        </button>
    );
  }

  return (
      <button
          type="button"
          onClick={onClick}
          className="group min-w-0 text-left"
      >
        <div className="aspect-[3/4] overflow-hidden rounded-xl bg-slate-100">
          <ConcertPoster
              src={
                concert.posterUrl
              }
              alt={`${concert.title} 포스터`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>

        <p className="mt-3 text-xs font-semibold text-indigo-600">
          {concert.category}
        </p>

        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
          {concert.title}
        </h3>

        {concert.subtitle && (
            <p className="mt-1 truncate text-xs text-slate-500">
              {concert.subtitle}
            </p>
        )}
      </button>
  );
}
