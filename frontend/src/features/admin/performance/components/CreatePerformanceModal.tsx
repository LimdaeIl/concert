import {
  type SubmitEvent,
  useEffect,
  useState,
} from 'react';

import {
  CalendarPlus,
  X,
} from 'lucide-react';

import {
  getAdminVenues,
} from '@/features/admin/venue/api/adminVenueApi';

import type {
  Venue,
} from '@/features/admin/venue/types/adminVenue';

import {
  getAdminVenueHalls,
} from '@/features/admin/venuehall/api/adminVenueHallApi';

import type {
  AdminVenueHall,
} from '@/features/admin/venuehall/types/adminVenueHall';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  createPerformance,
} from '../api/adminPerformanceApi';

interface CreatePerformanceModalProps {
  concertId: number;

  onClose: () => void;
  onCreated: () => void;
}

export default function CreatePerformanceModal({
                                                 concertId,
                                                 onClose,
                                                 onCreated,
                                               }: CreatePerformanceModalProps) {
  const [
    venues,
    setVenues,
  ] = useState<Venue[]>([]);

  const [
    halls,
    setHalls,
  ] = useState<AdminVenueHall[]>([]);

  const [
    venueId,
    setVenueId,
  ] = useState('');

  const [
    venueHallId,
    setVenueHallId,
  ] = useState('');

  const [
    startsAt,
    setStartsAt,
  ] = useState('');

  const [
    endsAt,
    setEndsAt,
  ] = useState('');

  const [
    reservationOpensAt,
    setReservationOpensAt,
  ] = useState('');

  const [
    reservationClosesAt,
    setReservationClosesAt,
  ] = useState('');

  const [
    maxTicketsPerMember,
    setMaxTicketsPerMember,
  ] = useState('2');

  const [
    loadingVenues,
    setLoadingVenues,
  ] = useState(true);

  const [
    loadingHalls,
    setLoadingHalls,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  useEffect(() => {
    async function loadVenues() {
      setLoadingVenues(true);

      try {
        const response =
            await getAdminVenues();

        setVenues(
            response.venues.filter(
                (venue) =>
                    venue.status ===
                    'ACTIVE',
            ),
        );
      } catch (error) {
        setErrorMessage(
            getApiErrorMessage(
                error,
                '공연장 목록을 불러오지 못했습니다.',
            ),
        );
      } finally {
        setLoadingVenues(false);
      }
    }

    void loadVenues();
  }, []);

  useEffect(() => {
    if (!venueId) {
      setHalls([]);
      setVenueHallId('');
      return;
    }

    async function loadHalls() {
      setLoadingHalls(true);
      setVenueHallId('');

      try {
        const response =
            await getAdminVenueHalls(
                Number(venueId),
                {
                  page: 0,
                  size: 100,
                  status: 'ACTIVE',
                },
            );

        setHalls(
            response.halls,
        );
      } catch (error) {
        setErrorMessage(
            getApiErrorMessage(
                error,
                '공연홀 목록을 불러오지 못했습니다.',
            ),
        );
      } finally {
        setLoadingHalls(false);
      }
    }

    void loadHalls();
  }, [
    venueId,
  ]);

  async function handleSubmit(
      event:
      SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const hallId =
        Number(venueHallId);

    const maxTickets =
        Number(
            maxTicketsPerMember,
        );

    if (
        !Number.isInteger(hallId) ||
        hallId <= 0
    ) {
      setErrorMessage(
          '공연홀을 선택해주세요.',
      );

      return;
    }

    if (
        !startsAt ||
        !endsAt ||
        !reservationOpensAt ||
        !reservationClosesAt
    ) {
      setErrorMessage(
          '공연 및 예매 일시를 모두 입력해주세요.',
      );

      return;
    }

    if (
        new Date(endsAt) <=
        new Date(startsAt)
    ) {
      setErrorMessage(
          '공연 종료일시는 시작일시보다 늦어야 합니다.',
      );

      return;
    }

    if (
        new Date(
            reservationClosesAt,
        ) <=
        new Date(
            reservationOpensAt,
        )
    ) {
      setErrorMessage(
          '예매 종료일시는 예매 시작일시보다 늦어야 합니다.',
      );

      return;
    }

    if (
        new Date(
            reservationClosesAt,
        ) >
        new Date(startsAt)
    ) {
      setErrorMessage(
          '예매 종료일시는 공연 시작일시 이후일 수 없습니다.',
      );

      return;
    }

    if (
        !Number.isInteger(
            maxTickets,
        ) ||
        maxTickets <= 0
    ) {
      setErrorMessage(
          '회원별 최대 예매 매수는 1 이상이어야 합니다.',
      );

      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await createPerformance(
          concertId,
          {
            venueHallId:
            hallId,

            startsAt,

            endsAt,

            reservationOpensAt,

            reservationClosesAt,

            maxTicketsPerMember:
            maxTickets,
          },
      );

      onCreated();
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '공연 회차 등록에 실패했습니다.',
          ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-6">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
          <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <CalendarPlus
                    size={20}
                    className="text-indigo-600"
                />

                <h2 className="text-lg font-bold text-slate-950">
                  공연 회차 등록
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                새 회차는 SCHEDULED 상태로
                생성됩니다.
              </p>
            </div>

            <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="닫기"
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </header>

          <form
              onSubmit={handleSubmit}
              className="p-6"
          >
            <section>
              <h3 className="text-sm font-semibold text-slate-900">
                공연 장소
              </h3>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <label
                      htmlFor="performance-venue"
                      className="text-sm font-medium text-slate-700"
                  >
                    공연장
                  </label>

                  <select
                      id="performance-venue"
                      value={venueId}
                      disabled={
                          submitting ||
                          loadingVenues
                      }
                      onChange={(event) =>
                          setVenueId(
                              event.target.value,
                          )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="">
                      공연장 선택
                    </option>

                    {venues.map(
                        (venue) => (
                            <option
                                key={
                                  venue.venueId
                                }
                                value={
                                  venue.venueId
                                }
                            >
                              {venue.name}
                            </option>
                        ),
                    )}
                  </select>
                </div>

                <div>
                  <label
                      htmlFor="performance-hall"
                      className="text-sm font-medium text-slate-700"
                  >
                    공연홀
                  </label>

                  <select
                      id="performance-hall"
                      value={
                        venueHallId
                      }
                      disabled={
                          submitting ||
                          !venueId ||
                          loadingHalls
                      }
                      onChange={(event) =>
                          setVenueHallId(
                              event.target.value,
                          )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="">
                      {loadingHalls
                          ? '불러오는 중...'
                          : '공연홀 선택'}
                    </option>

                    {halls.map(
                        (hall) => (
                            <option
                                key={
                                  hall.venueHallId
                                }
                                value={
                                  hall.venueHallId
                                }
                            >
                              {hall.name}
                              {hall.floor
                                  ? ` (${hall.floor})`
                                  : ''}
                            </option>
                        ),
                    )}
                  </select>
                </div>
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-sm font-semibold text-slate-900">
                공연 일시
              </h3>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <label
                      htmlFor="performance-start"
                      className="text-sm font-medium text-slate-700"
                  >
                    공연 시작
                  </label>

                  <input
                      id="performance-start"
                      type="datetime-local"
                      value={startsAt}
                      disabled={submitting}
                      onChange={(event) =>
                          setStartsAt(
                              event.target.value,
                          )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                      htmlFor="performance-end"
                      className="text-sm font-medium text-slate-700"
                  >
                    공연 종료
                  </label>

                  <input
                      id="performance-end"
                      type="datetime-local"
                      value={endsAt}
                      disabled={submitting}
                      onChange={(event) =>
                          setEndsAt(
                              event.target.value,
                          )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-sm font-semibold text-slate-900">
                예매 기간
              </h3>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <label
                      htmlFor="reservation-open"
                      className="text-sm font-medium text-slate-700"
                  >
                    예매 시작
                  </label>

                  <input
                      id="reservation-open"
                      type="datetime-local"
                      value={
                        reservationOpensAt
                      }
                      disabled={submitting}
                      onChange={(event) =>
                          setReservationOpensAt(
                              event.target.value,
                          )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                      htmlFor="reservation-close"
                      className="text-sm font-medium text-slate-700"
                  >
                    예매 종료
                  </label>

                  <input
                      id="reservation-close"
                      type="datetime-local"
                      value={
                        reservationClosesAt
                      }
                      disabled={submitting}
                      onChange={(event) =>
                          setReservationClosesAt(
                              event.target.value,
                          )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </section>

            <section className="mt-8">
              <div className="max-w-xs">
                <label
                    htmlFor="max-tickets"
                    className="text-sm font-medium text-slate-700"
                >
                  회원별 최대 예매 매수
                </label>

                <input
                    id="max-tickets"
                    type="number"
                    min={1}
                    value={
                      maxTicketsPerMember
                    }
                    disabled={submitting}
                    onChange={(event) =>
                        setMaxTicketsPerMember(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </section>

            {errorMessage && (
                <p
                    role="alert"
                    className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {errorMessage}
                </p>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                취소
              </button>

              <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-slate-300"
              >
                {submitting
                    ? '등록 중...'
                    : '회차 등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
