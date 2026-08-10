import {
  ArrowLeft,
  Armchair,
  Building2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage';

import {
  getAdminVenueHalls,
  updateVenueHallStatus,
} from '../api/adminVenueHallApi';

import CreateVenueHallModal
  from '../components/CreateVenueHallModal';

import UpdateVenueHallModal
  from '../components/UpdateVenueHallModal';

import type {
  AdminVenueHall,
  GetAdminVenueHallsResponse,
  VenueHallStatus,
} from '../types/adminVenueHall';

const PAGE_SIZE = 20;

export default function AdminVenueHallPage() {
  const navigate =
      useNavigate();

  const {
    venueId: venueIdParam,
  } = useParams();

  const venueId =
      Number(venueIdParam);

  const [
    data,
    setData,
  ] =
      useState<GetAdminVenueHallsResponse | null>(
          null,
      );

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    keywordInput,
    setKeywordInput,
  ] = useState('');

  const [
    keyword,
    setKeyword,
  ] = useState('');

  const [
    status,
    setStatus,
  ] =
      useState<VenueHallStatus | ''>(
          '',
      );

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
    editingHall,
    setEditingHall,
  ] =
      useState<AdminVenueHall | null>(
          null,
      );

  const [
    changingStatusId,
    setChangingStatusId,
  ] =
      useState<number | null>(
          null,
      );

  async function loadHalls(
      targetPage = page,
  ) {
    if (
        !Number.isInteger(
            venueId,
        ) ||
        venueId <= 0
    ) {
      setErrorMessage(
          '올바르지 않은 공연장입니다.',
      );

      setLoading(false);

      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response =
          await getAdminVenueHalls(
              venueId,
              {
                page:
                targetPage,

                size:
                PAGE_SIZE,

                keyword:
                    keyword ||
                    undefined,

                status:
                    status ||
                    undefined,
              },
          );

      setData(response);
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '공연홀 목록을 불러오지 못했습니다.',
          ),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHalls(page);
  }, [
    page,
    keyword,
    status,
  ]);

  function handleSearch() {
    const normalized =
        keywordInput.trim();

    setPage(0);
    setKeyword(
        normalized,
    );
  }

  function handleSearchKeyDown(
      event:
      React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (
        event.key === 'Enter'
    ) {
      handleSearch();
    }
  }

  async function handleCreated() {
    setCreateModalOpen(
        false,
    );

    setSuccessMessage(
        '공연홀이 등록되었습니다.',
    );

    /*
     * 새 데이터가 첫 페이지 상단에
     * 나타날 가능성이 높으므로
     * 생성 후 첫 페이지로 이동한다.
     */
    if (page !== 0) {
      setPage(0);
      return;
    }

    await loadHalls(0);
  }

  async function handleUpdated() {
    setEditingHall(
        null,
    );

    setSuccessMessage(
        '공연홀 정보가 수정되었습니다.',
    );

    await loadHalls(page);
  }

  async function handleStatusChange(
      hall: AdminVenueHall,
      nextStatus: VenueHallStatus,
  ) {
    if (
        hall.status ===
        nextStatus
    ) {
      return;
    }

    const confirmed =
        window.confirm(
            `${hall.name}의 상태를 ${nextStatus}(으)로 변경하시겠습니까?`,
        );

    if (!confirmed) {
      return;
    }

    setChangingStatusId(
        hall.venueHallId,
    );

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await updateVenueHallStatus(
          hall.venueHallId,
          {
            status:
            nextStatus,
          },
      );

      setSuccessMessage(
          '공연홀 상태가 변경되었습니다.',
      );

      await loadHalls(page);
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '공연홀 상태 변경에 실패했습니다.',
          ),
      );
    } finally {
      setChangingStatusId(
          null,
      );
    }
  }

  function handleSeats(
      hall: AdminVenueHall,
  ) {
    navigate(
        `/admin/halls/${hall.venueHallId}/seats`,
    );
  }

  const halls =
      data?.halls ??
      [];

  return (
      <>
        <div className="mx-auto max-w-[1600px]">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <button
                  type="button"
                  onClick={() =>
                      navigate(
                          '/admin/venues',
                      )
                  }
                  className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft
                    size={17}
                />

                공연장 목록
              </button>

              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                공연홀 관리
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                공연장 #{venueId}의 공연홀을
                관리합니다.
              </p>
            </div>

            <button
                type="button"
                onClick={() => {
                  setSuccessMessage(
                      '',
                  );

                  setCreateModalOpen(
                      true,
                  );
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <Plus size={18} />

              공연홀 등록
            </button>
          </header>

          {successMessage && (
              <div
                  role="status"
                  className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {successMessage}
              </div>
          )}

          {errorMessage && (
              <div
                  role="alert"
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </div>
          )}

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative w-full max-w-sm">
                  <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                      type="search"
                      value={
                        keywordInput
                      }
                      onChange={(event) =>
                          setKeywordInput(
                              event.target.value,
                          )
                      }
                      onKeyDown={
                        handleSearchKeyDown
                      }
                      placeholder="공연홀명 검색"
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <button
                    type="button"
                    onClick={
                      handleSearch
                    }
                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  검색
                </button>

                <select
                    value={status}
                    onChange={(event) => {
                      setPage(0);

                      setStatus(
                          event.target
                              .value as
                              | VenueHallStatus
                              | '',
                      );
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="">
                    전체 상태
                  </option>

                  <option value="ACTIVE">
                    활성
                  </option>

                  <option value="INACTIVE">
                    비활성
                  </option>

                  <option value="MAINTENANCE">
                    유지보수
                  </option>
                </select>
              </div>

              <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                      void loadHalls(
                          page,
                      )
                  }
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    ID
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    공연홀
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    위치
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    수용 인원
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    상태
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">
                    관리
                  </th>
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    <tr>
                      <td
                          colSpan={6}
                          className="px-5 py-16 text-center text-sm text-slate-400"
                      >
                        공연홀 정보를
                        불러오고 있습니다.
                      </td>
                    </tr>
                ) : halls.length ===
                0 ? (
                    <tr>
                      <td
                          colSpan={6}
                          className="px-5 py-16 text-center"
                      >
                        <Building2
                            size={26}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm text-slate-500">
                          조회된 공연홀이
                          없습니다.
                        </p>
                      </td>
                    </tr>
                ) : (
                    halls.map(
                        (hall) => (
                            <tr
                                key={
                                  hall.venueHallId
                                }
                                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4 text-sm text-slate-500">
                                {
                                  hall.venueHallId
                                }
                              </td>

                              <td className="px-5 py-4">
                                <p className="font-semibold text-slate-900">
                                  {
                                    hall.name
                                  }
                                </p>
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {hall.floor ??
                                    '-'}
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {hall.capacity.toLocaleString()}
                                명
                              </td>

                              <td className="px-5 py-4">
                                <select
                                    value={
                                      hall.status
                                    }
                                    disabled={
                                        changingStatusId ===
                                        hall.venueHallId
                                    }
                                    onChange={(event) =>
                                        void handleStatusChange(
                                            hall,
                                            event.target
                                                .value as VenueHallStatus,
                                        )
                                    }
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none disabled:opacity-50"
                                >
                                  <option value="ACTIVE">
                                    활성
                                  </option>

                                  <option value="INACTIVE">
                                    비활성
                                  </option>

                                  <option value="MAINTENANCE">
                                    유지보수
                                  </option>
                                </select>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                      type="button"
                                      onClick={() =>
                                          handleSeats(
                                              hall,
                                          )
                                      }
                                      className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                                  >
                                    <Armchair
                                        size={14}
                                    />

                                    좌석
                                  </button>

                                  <button
                                      type="button"
                                      onClick={() =>
                                          setEditingHall(
                                              hall,
                                          )
                                      }
                                      className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                  >
                                    <Pencil
                                        size={14}
                                    />

                                    수정
                                  </button>
                                </div>
                              </td>
                            </tr>
                        ),
                    )
                )}
                </tbody>
              </table>
            </div>

            {data && (
                <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/50 px-5 py-4">
                  <p className="text-sm text-slate-500">
                    총{' '}
                    <strong className="text-slate-800">
                      {data.totalElements.toLocaleString()}
                    </strong>
                    개
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={
                            data.first ||
                            loading
                        }
                        onClick={() =>
                            setPage(
                                (current) =>
                                    Math.max(
                                        0,
                                        current - 1,
                                    ),
                            )
                        }
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft
                          size={17}
                      />
                    </button>

                    <span className="min-w-24 text-center text-sm text-slate-600">
                  {data.totalPages ===
                  0
                      ? '0 / 0'
                      : `${data.page + 1} / ${data.totalPages}`}
                </span>

                    <button
                        type="button"
                        disabled={
                            data.last ||
                            loading
                        }
                        onClick={() =>
                            setPage(
                                (current) =>
                                    current + 1,
                            )
                        }
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight
                          size={17}
                      />
                    </button>
                  </div>
                </footer>
            )}
          </section>
        </div>

        {createModalOpen && (
            <CreateVenueHallModal
                venueId={venueId}
                onClose={() =>
                    setCreateModalOpen(
                        false,
                    )
                }
                onCreated={() =>
                    void handleCreated()
                }
            />
        )}

        {editingHall && (
            <UpdateVenueHallModal
                hall={editingHall}
                onClose={() =>
                    setEditingHall(
                        null,
                    )
                }
                onUpdated={() =>
                    void handleUpdated()
                }
            />
        )}
      </>
  );
}
