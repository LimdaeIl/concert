import {
  type SubmitEvent,
  useEffect,
  useState,
} from 'react';

import {
  CalendarClock,
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
  updatePerformance,
} from '../api/adminPerformanceApi';

import type {
  AdminPerformance,
} from '../types/adminPerformance';

interface UpdatePerformanceModalProps {
  performance: AdminPerformance;

  onClose: () => void;
  onUpdated: () => void;
}

function toDateTimeLocal(
    value: string,
) {
  return value.slice(
      0,
      16,
  );
}

export default function UpdatePerformanceModal({
                                                 performance,
                                                 onClose,
                                                 onUpdated,
                                               }: UpdatePerformanceModalProps) {
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
  ] = useState(
      String(
          performance.venueHallId,
      ),
  );

  const [
    startsAt,
    setStartsAt,
  ] = useState(
      toDateTimeLocal(
          performance.startsAt,
      ),
  );

  const [
    endsAt,
    setEndsAt,
  ] = useState(
      toDateTimeLocal(
          performance.endsAt,
      ),
  );

  const [
    reservationOpensAt,
    setReservationOpensAt,
  ] = useState(
      toDateTimeLocal(
          performance.reservationOpensAt,
      ),
  );

  const [
    reservationClosesAt,
    setReservationClosesAt,
  ] = useState(
      toDateTimeLocal(
          performance.reservationClosesAt,
      ),
  );

  const [
    maxTicketsPerMember,
    setMaxTicketsPerMember,
  ] = useState(
      String(
          performance.maxTicketsPerMember,
      ),
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  useEffect(() => {
    async function initialize() {
      setLoading(true);

      try {
        const venueResponse =
            await getAdminVenues();

        const activeVenues =
            venueResponse.venues.filter(
                (venue) =>
                    venue.status ===
                    'ACTIVE',
            );

        setVenues(
            activeVenues,
        );

        /*
         * 현재 회차 응답에는 venueId가 없기 때문에
         * 현재 venueHallId가 어느 공연장 소속인지
         * 공연장별 hall 목록을 조회해 찾는다.
         */
        for (
            const venue
            of activeVenues
            ) {
          const hallResponse =
              await getAdminVenueHalls(
                  venue.venueId,
                  {
                    page: 0,
                    size: 100,
                    status: 'ACTIVE',
                  },
              );

          const found =
              hallResponse.halls.find(
                  (hall) =>
                      hall.venueHallId ===
                      performance.venueHallId,
              );

          if (found) {
            setVenueId(
                String(
                    venue.venueId,
                ),
            );

            setHalls(
                hallResponse.halls,
            );

            return;
          }
        }
      } catch (error) {
        setErrorMessage(
            getApiErrorMessage(
                error,
                '공연장 정보를 불러오지 못했습니다.',
            ),
        );
      } finally {
        setLoading(false);
      }
    }

    void initialize();
  }, [
    performance.venueHallId,
  ]);

  async function handleVenueChange(
      nextVenueId: string,
  ) {
    setVenueId(
        nextVenueId,
    );

    setVenueHallId('');
    setHalls([]);

    if (!nextVenueId) {
      return;
    }

    try {
      const response =
          await getAdminVenueHalls(
              Number(
                  nextVenueId,
              ),
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
    }
  }

  async function handleSubmit(
      event:
      SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const hallId =
        Number(
            venueHallId,
        );

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
      await updatePerformance(
          performance.performanceId,
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

      onUpdated();
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '공연 회차 수정에 실패했습니다.',
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
            <div className="flex items-center gap-2">
              <CalendarClock
                  size={20}
                  className="text-indigo-600"
              />

              <h2 className="text-lg font-bold text-slate-950">
                공연 회차 수정
              </h2>
            </div>

            <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="닫기"
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X size={19} />
            </button>
          </header>

          <form
              onSubmit={handleSubmit}
              className="p-6"
          >
            {loading ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  공연장 정보를 불러오고 있습니다.
                </p>
            ) : (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        공연장
                      </label>

                      <select
                          value={venueId}
                          disabled={submitting}
                          onChange={(event) =>
                              void handleVenueChange(
                                  event.target.value,
                              )
                          }
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
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
                      <label className="text-sm font-medium text-slate-700">
                        공연홀
                      </label>

                      <select
                          value={
                            venueHallId
                          }
                          disabled={
                              submitting ||
                              !venueId
                          }
                          onChange={(event) =>
                              setVenueHallId(
                                  event.target.value,
                              )
                          }
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
                      >
                        <option value="">
                          공연홀 선택
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
                                </option>
                            ),
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        공연 시작
                      </label>

                      <input
                          type="datetime-local"
                          value={startsAt}
                          onChange={(event) =>
                              setStartsAt(
                                  event.target.value,
                              )
                          }
                          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        공연 종료
                      </label>

                      <input
                          type="datetime-local"
                          value={endsAt}
                          onChange={(event) =>
                              setEndsAt(
                                  event.target.value,
                              )
                          }
                          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        예매 시작
                      </label>

                      <input
                          type="datetime-local"
                          value={
                            reservationOpensAt
                          }
                          onChange={(event) =>
                              setReservationOpensAt(
                                  event.target.value,
                              )
                          }
                          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        예매 종료
                      </label>

                      <input
                          type="datetime-local"
                          value={
                            reservationClosesAt
                          }
                          onChange={(event) =>
                              setReservationClosesAt(
                                  event.target.value,
                              )
                          }
                          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        회원별 최대 예매 매수
                      </label>

                      <input
                          type="number"
                          min={1}
                          value={
                            maxTicketsPerMember
                          }
                          onChange={(event) =>
                              setMaxTicketsPerMember(
                                  event.target.value,
                              )
                          }
                          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                </>
            )}

            {errorMessage && (
                <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                취소
              </button>

              <button
                  type="submit"
                  disabled={
                      loading ||
                      submitting
                  }
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300"
              >
                {submitting
                    ? '수정 중...'
                    : '수정'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
