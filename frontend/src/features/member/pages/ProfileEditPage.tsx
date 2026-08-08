import {
  ArrowLeft,
  Save,
} from 'lucide-react';
import {
  type SubmitEvent,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getMe,
  updateMyProfile,
} from '@/features/member/api/memberApi';
import { getApiErrorMessage } from '@/lib/api/getApiErrorMessage';

export default function ProfileEditPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');

  const [zipCode, setZipCode] = useState('');
  const [roadAddress, setRoadAddress] =
      useState('');
  const [jibunAddress, setJibunAddress] =
      useState('');
  const [detailAddress, setDetailAddress] =
      useState('');

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] =
      useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
      useState(false);
  const [errorMessage, setErrorMessage] =
      useState('');

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const member = await getMe();

        if (!active) {
          return;
        }

        setName(member.name);
        setZipCode(member.address.zipCode);
        setRoadAddress(
            member.address.roadAddress,
        );
        setJibunAddress(
            member.address.jibunAddress,
        );
        setDetailAddress(
            member.address.detailAddress,
        );
        setLatitude(
            member.address.latitude,
        );
        setLongitude(
            member.address.longitude,
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(
            getApiErrorMessage(
                error,
                '회원 정보를 불러오지 못했습니다.',
            ),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(
      event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage(
          '이름을 입력해주세요.',
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await updateMyProfile({
        name: name.trim(),
        roadAddress: roadAddress.trim(),
        jibunAddress: jibunAddress.trim(),
        detailAddress: detailAddress.trim(),
        zipCode: zipCode.trim(),
        latitude,
        longitude,
      });

      navigate('/me', {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '프로필 수정에 실패했습니다.',
          ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
        </div>
    );
  }

  return (
      <div className="pb-10">
        <header className="flex h-14 items-center border-b border-slate-100 px-4">
          <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
              aria-label="뒤로가기"
          >
            <ArrowLeft size={22} />
          </button>

          <h2 className="ml-2 text-base font-semibold text-slate-900">
            프로필 수정
          </h2>
        </header>

        <form
            onSubmit={handleSubmit}
            className="px-5 py-6"
        >
          <section>
            <h3 className="text-lg font-bold text-slate-950">
              기본 정보
            </h3>

            <div className="mt-5">
              <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700"
              >
                이름
              </label>

              <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) =>
                      setName(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </section>

          <section className="mt-9">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                주소
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                현재는 직접 입력하며, 주소 검색은 별도 API
                연결 시 변경합니다.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-slate-700"
                >
                  우편번호
                </label>

                <input
                    id="zipCode"
                    type="text"
                    value={zipCode}
                    onChange={(event) =>
                        setZipCode(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                    htmlFor="roadAddress"
                    className="block text-sm font-medium text-slate-700"
                >
                  도로명 주소
                </label>

                <input
                    id="roadAddress"
                    type="text"
                    value={roadAddress}
                    onChange={(event) =>
                        setRoadAddress(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                    htmlFor="jibunAddress"
                    className="block text-sm font-medium text-slate-700"
                >
                  지번 주소
                </label>

                <input
                    id="jibunAddress"
                    type="text"
                    value={jibunAddress}
                    onChange={(event) =>
                        setJibunAddress(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                    htmlFor="detailAddress"
                    className="block text-sm font-medium text-slate-700"
                >
                  상세 주소
                </label>

                <input
                    id="detailAddress"
                    type="text"
                    value={detailAddress}
                    onChange={(event) =>
                        setDetailAddress(
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
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

          <button
              type="submit"
              disabled={submitting}
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Save size={18} />

            {submitting
                ? '저장 중...'
                : '변경사항 저장'}
          </button>
        </form>
      </div>
  );
}