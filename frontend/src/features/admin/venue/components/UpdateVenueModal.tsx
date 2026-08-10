import {
  type SubmitEvent,
  useState,
} from 'react';

import {
  MapPin,
  X,
} from 'lucide-react';

import AddressSearchField
  from '@/features/address/components/AddressSearchField.tsx';

import type {
  AddressValue,
} from '@/features/address/types/address.ts';

import {
  getApiErrorMessage,
} from '@/lib/api/getApiErrorMessage.ts';

import {
  updateVenue,
} from '../api/adminVenueApi.ts';

import type {
  Venue,
} from '../types/adminVenue.ts';

interface UpdateVenueModalProps {
  venue: Venue;
  onClose: () => void;
  onUpdated: (
      venue: Venue,
  ) => void;
}

export default function UpdateVenueModal({
                                           venue,
                                           onClose,
                                           onUpdated,
                                         }: UpdateVenueModalProps) {
  const [
    name,
    setName,
  ] = useState(
      venue.name,
  );

  const [
    phone,
    setPhone,
  ] = useState(
      venue.phone ?? '',
  );

  const [
    address,
    setAddress,
  ] = useState<AddressValue>({
    roadAddress:
    venue.roadAddress,

    jibunAddress:
        venue.jibunAddress ?? '',

    detailAddress:
        venue.detailAddress ?? '',

    zipCode:
        venue.zipCode ?? '',
  });

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  async function handleSubmit(
      event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage(
          '공연장 이름을 입력해주세요.',
      );

      return;
    }

    if (!address.roadAddress) {
      setErrorMessage(
          '주소를 입력해주세요.',
      );

      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const updatedVenue =
          await updateVenue(
              venue.venueId,
              {
                name:
                    name.trim(),

                phone:
                    phone.trim() ||
                    null,

                roadAddress:
                address.roadAddress,

                jibunAddress:
                    address.jibunAddress ||
                    null,

                detailAddress:
                    address.detailAddress
                    .trim() ||
                    null,

                zipCode:
                    address.zipCode ||
                    null,

                latitude:
                venue.latitude,

                longitude:
                venue.longitude,
              },
          );

      onUpdated(
          updatedVenue,
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '공연장 수정에 실패했습니다.',
          ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-6">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
          <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                공연장 수정
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                공연장 기본 정보를
                수정합니다.
              </p>
            </div>

            <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                aria-label="닫기"
            >
              <X size={19} />
            </button>
          </header>

          <form
              onSubmit={handleSubmit}
              className="p-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                    htmlFor="update-venue-name"
                    className="text-sm font-medium text-slate-700"
                >
                  공연장명
                </label>

                <input
                    id="update-venue-name"
                    value={name}
                    disabled={submitting}
                    onChange={(event) =>
                        setName(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                    htmlFor="update-venue-phone"
                    className="text-sm font-medium text-slate-700"
                >
                  전화번호
                </label>

                <input
                    id="update-venue-phone"
                    value={phone}
                    disabled={submitting}
                    onChange={(event) =>
                        setPhone(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-3 flex items-center gap-2">
                <MapPin
                    size={18}
                    className="text-indigo-600"
                />

                <h3 className="text-sm font-semibold text-slate-900">
                  주소
                </h3>
              </div>

              <AddressSearchField
                  value={address}
                  onChange={setAddress}
                  disabled={submitting}
              />
            </div>

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
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                취소
              </button>

              <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-slate-300"
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
