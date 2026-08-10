import {
  Building2,
  DoorOpen,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  getAdminVenues,
  updateVenueStatus,
} from '../api/adminVenueApi';

import CreateVenueModal
  from '../components/CreateVenueModal';

import UpdateVenueModal
  from '../components/UpdateVenueModal';

import type {
  Venue,
} from '../types/adminVenue';

export default function AdminVenuePage() {
  const navigate =
      useNavigate();

  const [
    venues,
    setVenues,
  ] = useState<Venue[]>([]);

  const [
    keyword,
    setKeyword,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  const [
    createModalOpen,
    setCreateModalOpen,
  ] = useState(false);

  const [
    editingVenue,
    setEditingVenue,
  ] = useState<Venue | null>(null);

  const [
    changingStatusVenueId,
    setChangingStatusVenueId,
  ] = useState<number | null>(null);

  async function loadVenues() {
    setLoading(true);
    setErrorMessage('');

    try {
      const response =
          await getAdminVenues();

      setVenues(
          response.venues,
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '공연장 목록을 불러오지 못했습니다.',
          ),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVenues();
  }, []);

  const filteredVenues =
      useMemo(() => {
        const normalizedKeyword =
            keyword
            .trim()
            .toLowerCase();

        if (!normalizedKeyword) {
          return venues;
        }

        return venues.filter(
            (venue) => {
              const name =
                  venue.name
                  .toLowerCase();

              const roadAddress =
                  venue.roadAddress
                  .toLowerCase();

              const jibunAddress =
                  venue.jibunAddress
                  ?.toLowerCase() ??
                  '';

              return (
                  name.includes(
                      normalizedKeyword,
                  ) ||
                  roadAddress.includes(
                      normalizedKeyword,
                  ) ||
                  jibunAddress.includes(
                      normalizedKeyword,
                  )
              );
            },
        );
      }, [
        venues,
        keyword,
      ]);

  async function handleCreated() {
    setCreateModalOpen(false);

    setSuccessMessage(
        '공연장이 등록되었습니다.',
    );

    await loadVenues();
  }

  function handleUpdated(
      updatedVenue: Venue,
  ) {
    setVenues(
        (current) =>
            current.map(
                (venue) =>
                    venue.venueId ===
                    updatedVenue.venueId
                        ? updatedVenue
                        : venue,
            ),
    );

    setEditingVenue(null);

    setSuccessMessage(
        '공연장 정보가 수정되었습니다.',
    );

    setErrorMessage('');
  }

  async function handleStatusChange(
      venue: Venue,
  ) {
    const nextStatus =
        venue.status === 'ACTIVE'
            ? 'INACTIVE'
            : 'ACTIVE';

    const actionText =
        nextStatus === 'ACTIVE'
            ? '활성화'
            : '비활성화';

    const confirmed =
        window.confirm(
            `${venue.name} 공연장을 ${actionText}하시겠습니까?`,
        );

    if (!confirmed) {
      return;
    }

    setChangingStatusVenueId(
        venue.venueId,
    );

    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedVenue =
          await updateVenueStatus(
              venue.venueId,
              {
                status: nextStatus,
              },
          );

      setVenues(
          (current) =>
              current.map(
                  (item) =>
                      item.venueId ===
                      updatedVenue.venueId
                          ? updatedVenue
                          : item,
              ),
      );

      setSuccessMessage(
          `공연장이 ${actionText}되었습니다.`,
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              `공연장 ${actionText}에 실패했습니다.`,
          ),
      );
    } finally {
      setChangingStatusVenueId(
          null,
      );
    }
  }

  function handleVenueHalls(
      venue: Venue,
  ) {
    navigate(
        `/admin/venues/${venue.venueId}/halls`,
    );
  }

  function getAddressText(
      venue: Venue,
  ) {
    return [
      venue.roadAddress,
      venue.detailAddress,
    ]
    .filter(Boolean)
    .join(' ');
  }

  return (
      <>
        <div className="mx-auto max-w-[1600px]">
          {/* Page Header */}
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                공연장 관리
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                공연장 정보를 등록하고 관리합니다.
              </p>
            </div>

            <button
                type="button"
                onClick={() => {
                  setSuccessMessage('');
                  setCreateModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <Plus size={18} />

              공연장 등록
            </button>
          </header>

          {/* Success */}
          {successMessage && (
              <div
                  role="status"
                  className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {successMessage}
              </div>
          )}

          {/* Error */}
          {errorMessage && (
              <div
                  role="alert"
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </div>
          )}

          {/* Venue Table */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
              <div className="relative w-full max-w-sm">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="search"
                    value={keyword}
                    onChange={(event) =>
                        setKeyword(
                            event.target.value,
                        )
                    }
                    placeholder="공연장명 또는 주소 검색"
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                총{' '}
                <strong className="font-semibold text-slate-800">
                  {filteredVenues.length}
                </strong>
                개
              </span>

                <button
                    type="button"
                    onClick={() =>
                        void loadVenues()
                    }
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                      size={17}
                      className={
                        loading
                            ? 'animate-spin'
                            : ''
                      }
                  />

                  새로고침
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ID
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    공연장
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    전화번호
                  </th>

                  <th className="min-w-80 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    주소
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    상태
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    관리
                  </th>
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    <tr>
                      <td
                          colSpan={6}
                          className="px-5 py-16 text-center"
                      >
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <RefreshCw
                              size={22}
                              className="animate-spin"
                          />

                          <p className="text-sm">
                            공연장 정보를 불러오고 있습니다.
                          </p>
                        </div>
                      </td>
                    </tr>
                ) : filteredVenues.length ===
                0 ? (
                    <tr>
                      <td
                          colSpan={6}
                          className="px-5 py-16 text-center"
                      >
                        <div className="flex flex-col items-center">
                          <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <Building2
                                size={22}
                            />
                          </div>

                          <p className="mt-3 text-sm font-medium text-slate-600">
                            {keyword.trim()
                                ? '검색 결과가 없습니다.'
                                : '등록된 공연장이 없습니다.'}
                          </p>

                          {!keyword.trim() && (
                              <p className="mt-1 text-xs text-slate-400">
                                공연장을 등록하면
                                이곳에서 관리할 수 있습니다.
                              </p>
                          )}
                        </div>
                      </td>
                    </tr>
                ) : (
                    filteredVenues.map(
                        (venue) => {
                          const changingStatus =
                              changingStatusVenueId ===
                              venue.venueId;

                          const addressText =
                              getAddressText(
                                  venue,
                              );

                          return (
                              <tr
                                  key={
                                    venue.venueId
                                  }
                                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                              >
                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                                  {
                                    venue.venueId
                                  }
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex min-w-48 items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                      <Building2
                                          size={18}
                                      />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="truncate font-semibold text-slate-900">
                                        {
                                          venue.name
                                        }
                                      </p>

                                      {venue.zipCode && (
                                          <p className="mt-0.5 text-xs text-slate-400">
                                            우편번호{' '}
                                            {
                                              venue.zipCode
                                            }
                                          </p>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                  {venue.phone ||
                                      '-'}
                                </td>

                                <td className="max-w-lg px-5 py-4">
                                  <p className="text-sm text-slate-600">
                                    {addressText ||
                                        '-'}
                                  </p>

                                  {venue.jibunAddress && (
                                      <p className="mt-1 text-xs text-slate-400">
                                        {
                                          venue.jibunAddress
                                        }
                                      </p>
                                  )}
                                </td>

                                <td className="whitespace-nowrap px-5 py-4">
                            <span
                                className={[
                                  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                                  venue.status ===
                                  'ACTIVE'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-slate-100 text-slate-500',
                                ].join(
                                    ' ',
                                )}
                            >
                              {venue.status ===
                              'ACTIVE'
                                  ? '활성'
                                  : '비활성'}
                            </span>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4">
                                  <div className="flex justify-end gap-2">
                                    {/* 공연홀 관리 */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleVenueHalls(
                                                venue,
                                            )
                                        }
                                        className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                                    >
                                      <DoorOpen
                                          size={14}
                                      />

                                      공연홀
                                    </button>

                                    {/* 공연장 수정 */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                          setErrorMessage(
                                              '',
                                          );

                                          setSuccessMessage(
                                              '',
                                          );

                                          setEditingVenue(
                                              venue,
                                          );
                                        }}
                                        className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                      <Pencil
                                          size={14}
                                      />

                                      수정
                                    </button>

                                    {/* 상태 변경 */}
                                    <button
                                        type="button"
                                        disabled={
                                          changingStatus
                                        }
                                        onClick={() =>
                                            void handleStatusChange(
                                                venue,
                                            )
                                        }
                                        className={[
                                          'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',

                                          venue.status ===
                                          'ACTIVE'
                                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                                        ].join(
                                            ' ',
                                        )}
                                    >
                                      {venue.status ===
                                      'ACTIVE' ? (
                                          <PowerOff
                                              size={14}
                                          />
                                      ) : (
                                          <Power
                                              size={14}
                                          />
                                      )}

                                      {changingStatus
                                          ? '처리 중...'
                                          : venue.status ===
                                          'ACTIVE'
                                              ? '비활성화'
                                              : '활성화'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                          );
                        },
                    )
                )}
                </tbody>
              </table>
            </div>

            {!loading &&
                filteredVenues.length > 0 && (
                    <footer className="border-t border-slate-200 bg-slate-50/50 px-5 py-4 text-sm text-slate-500">
                      전체 {venues.length}개 중{' '}
                      <strong className="font-semibold text-slate-800">
                        {
                          filteredVenues.length
                        }
                      </strong>
                      개 표시
                    </footer>
                )}
          </section>
        </div>

        {/* Create Venue Modal */}
        {createModalOpen && (
            <CreateVenueModal
                onClose={() =>
                    setCreateModalOpen(false)
                }
                onCreated={() =>
                    void handleCreated()
                }
            />
        )}

        {/* Update Venue Modal */}
        {editingVenue && (
            <UpdateVenueModal
                venue={editingVenue}
                onClose={() =>
                    setEditingVenue(null)
                }
                onUpdated={
                  handleUpdated
                }
            />
        )}
      </>
  );
}
