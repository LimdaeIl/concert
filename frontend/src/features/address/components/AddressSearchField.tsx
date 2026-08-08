import {
  CheckCircle2,
  MapPin,
  Search,
} from 'lucide-react';

import type { AddressValue } from '../types/address';

interface AddressSearchFieldProps {
  value: AddressValue;

  onChange: (
      value: AddressValue,
  ) => void;

  disabled?: boolean;
}

export default function AddressSearchField({
                                             value,
                                             onChange,
                                             disabled = false,
                                           }: AddressSearchFieldProps) {
  function handleAddressSearch() {
    if (
        typeof kakao === 'undefined' ||
        !kakao.Postcode
    ) {
      return;
    }

    new kakao.Postcode({
      oncomplete: (data) => {
        const roadAddress =
            data.roadAddress || '';

        const jibunAddress =
            data.jibunAddress || '';

        onChange({
          zipCode:
          data.zonecode,

          roadAddress,

          jibunAddress,

          detailAddress: '',
        });
      },
    }).open();
  }

  const addressSelected =
      Boolean(
          value.zipCode &&
          (
              value.roadAddress ||
              value.jibunAddress
          ),
      );

  return (
      <div>
        <div className="flex items-center gap-2">
          <MapPin
              size={19}
              className="text-indigo-600"
          />

          <h3 className="text-base font-semibold text-slate-900">
            주소
          </h3>

          {addressSelected && (
              <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <CheckCircle2 size={15} />

            주소 확인 완료
          </span>
          )}
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          카카오 주소 검색을 이용해 주소를 선택해주세요.
        </p>

        <div className="mt-4 flex gap-2">
          <input
              type="text"
              value={value.zipCode}
              readOnly
              placeholder="우편번호"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
          />

          <button
              type="button"
              disabled={disabled}
              onClick={handleAddressSearch}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Search size={16} />

            주소 검색
          </button>
        </div>

        <div className="mt-3">
          <label
              htmlFor="roadAddress"
              className="block text-xs font-medium text-slate-500"
          >
            도로명 주소
          </label>

          <input
              id="roadAddress"
              type="text"
              value={value.roadAddress}
              readOnly
              placeholder="도로명 주소"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
          />
        </div>

        <div className="mt-3">
          <label
              htmlFor="jibunAddress"
              className="block text-xs font-medium text-slate-500"
          >
            지번 주소
          </label>

          <input
              id="jibunAddress"
              type="text"
              value={value.jibunAddress}
              readOnly
              placeholder="지번 주소"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
          />
        </div>

        <div className="mt-3">
          <label
              htmlFor="detailAddress"
              className="block text-xs font-medium text-slate-500"
          >
            상세 주소
          </label>

          <input
              id="detailAddress"
              type="text"
              value={value.detailAddress}
              disabled={
                  disabled ||
                  !addressSelected
              }
              onChange={(event) =>
                  onChange({
                    ...value,
                    detailAddress:
                    event.target.value,
                  })
              }
              placeholder="동, 호수 등 상세주소"
              autoComplete="address-line2"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
          />
        </div>
      </div>
  );
}
