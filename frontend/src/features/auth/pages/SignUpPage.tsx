import {
  ArrowLeft,
  Check,
  Mail,
  Smartphone,
} from 'lucide-react';
import {
  type SubmitEvent,
  useState,
} from 'react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  sendEmailVerification,
  sendPhoneVerification,
  verifyEmail,
  verifyPhone,
} from '@/features/auth/api/authApi';
import { signUp } from '@/features/member/api/memberApi';
import { getApiErrorMessage } from '@/lib/api/getApiErrorMessage';

export function SignUpPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [
    emailVerificationToken,
    setEmailVerificationToken,
  ] = useState('');

  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [
    phoneVerificationToken,
    setPhoneVerificationToken,
  ] = useState('');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] =
      useState('');
  const [name, setName] = useState('');

  const [roadAddress, setRoadAddress] = useState('');
  const [jibunAddress, setJibunAddress] = useState('');
  const [detailAddress, setDetailAddress] =
      useState('');
  const [zipCode, setZipCode] = useState('');

  const [errorMessage, setErrorMessage] =
      useState('');
  const [successMessage, setSuccessMessage] =
      useState('');
  const [submitting, setSubmitting] =
      useState(false);

  const [sendingEmail, setSendingEmail] =
      useState(false);
  const [verifyingEmail, setVerifyingEmail] =
      useState(false);
  const [sendingPhone, setSendingPhone] =
      useState(false);
  const [verifyingPhone, setVerifyingPhone] =
      useState(false);

  const isEmailVerified =
      Boolean(emailVerificationToken);

  const isPhoneVerified =
      Boolean(phoneVerificationToken);

  async function handleSendEmailVerification() {
    if (!email.trim()) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    setSendingEmail(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await sendEmailVerification({
        email: email.trim(),
      });

      setSuccessMessage(
          '이메일 인증번호를 발송했습니다.',
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '이메일 인증번호 발송에 실패했습니다.',
          ),
      );
    } finally {
      setSendingEmail(false);
    }
  }

  async function handleVerifyEmail() {
    if (!email.trim() || !emailCode.trim()) {
      setErrorMessage(
          '이메일과 인증번호를 입력해주세요.',
      );
      return;
    }

    setVerifyingEmail(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await verifyEmail({
        email: email.trim(),
        verificationCode: emailCode.trim(),
      });

      setEmailVerificationToken(
          response.verificationToken,
      );

      setSuccessMessage(
          '이메일 인증이 완료되었습니다.',
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '이메일 인증에 실패했습니다.',
          ),
      );
    } finally {
      setVerifyingEmail(false);
    }
  }

  async function handleSendPhoneVerification() {
    if (!phone.trim()) {
      setErrorMessage(
          '휴대전화 번호를 입력해주세요.',
      );
      return;
    }

    setSendingPhone(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await sendPhoneVerification({
        phone: phone.trim(),
      });

      setSuccessMessage(
          '휴대전화 인증번호를 발송했습니다.',
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '휴대전화 인증번호 발송에 실패했습니다.',
          ),
      );
    } finally {
      setSendingPhone(false);
    }
  }

  async function handleVerifyPhone() {
    if (!phone.trim() || !phoneCode.trim()) {
      setErrorMessage(
          '휴대전화 번호와 인증번호를 입력해주세요.',
      );
      return;
    }

    setVerifyingPhone(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await verifyPhone({
        phone: phone.trim(),
        verificationCode: phoneCode.trim(),
      });

      setPhoneVerificationToken(
          response.verificationToken,
      );

      setSuccessMessage(
          '휴대전화 인증이 완료되었습니다.',
      );
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '휴대전화 인증에 실패했습니다.',
          ),
      );
    } finally {
      setVerifyingPhone(false);
    }
  }

  async function handleSubmit(
      event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!isEmailVerified) {
      setErrorMessage(
          '이메일 인증을 완료해주세요.',
      );
      return;
    }

    if (!isPhoneVerified) {
      setErrorMessage(
          '휴대전화 인증을 완료해주세요.',
      );
      return;
    }

    if (!name.trim()) {
      setErrorMessage('이름을 입력해주세요.');
      return;
    }

    if (!password) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage(
          '비밀번호가 일치하지 않습니다.',
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await signUp({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim(),

        roadAddress: roadAddress.trim(),
        jibunAddress: jibunAddress.trim(),
        detailAddress: detailAddress.trim(),
        zipCode: zipCode.trim(),

        latitude: 0,
        longitude: 0,

        emailVerificationToken,
        phoneVerificationToken,
      });

      navigate('/login', {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
          getApiErrorMessage(
              error,
              '회원가입에 실패했습니다.',
          ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <main className="mx-auto min-h-dvh w-full max-w-[640px] bg-white">
        <header className="sticky top-0 z-20 flex h-14 items-center border-b border-slate-100 bg-white px-5">
          <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex size-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100"
              aria-label="뒤로가기"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="ml-2 text-base font-semibold text-slate-900">
            회원가입
          </h1>
        </header>

        <form
            onSubmit={handleSubmit}
            className="px-5 pb-12 pt-6"
        >
          <section>
            <p className="text-sm font-semibold text-indigo-600">
              CONCERT
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              계정을 만들어보세요
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              이메일과 휴대전화 인증 후 회원가입을
              완료할 수 있습니다.
            </p>
          </section>

          <section className="mt-9">
            <div className="flex items-center gap-2">
              <Mail
                  size={19}
                  className="text-indigo-600"
              />

              <h3 className="text-base font-semibold text-slate-900">
                이메일 인증
              </h3>

              {isEmailVerified && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <Check size={15} />
                인증 완료
              </span>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  disabled={isEmailVerified}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setEmailVerificationToken('');
                  }}
                  placeholder="user@example.com"
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
              />

              <button
                  type="button"
                  disabled={
                      sendingEmail || isEmailVerified
                  }
                  onClick={() =>
                      void handleSendEmailVerification()
                  }
                  className="shrink-0 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                {sendingEmail ? '발송 중' : '인증번호 발송'}
              </button>
            </div>

            {!isEmailVerified && (
                <div className="mt-3 flex gap-2">
                  <input
                      type="text"
                      inputMode="numeric"
                      value={emailCode}
                      onChange={(event) =>
                          setEmailCode(event.target.value)
                      }
                      placeholder="인증번호"
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />

                  <button
                      type="button"
                      disabled={verifyingEmail}
                      onClick={() =>
                          void handleVerifyEmail()
                      }
                      className="shrink-0 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:bg-slate-300"
                  >
                    {verifyingEmail ? '확인 중' : '인증'}
                  </button>
                </div>
            )}
          </section>

          <section className="mt-9">
            <div className="flex items-center gap-2">
              <Smartphone
                  size={19}
                  className="text-indigo-600"
              />

              <h3 className="text-base font-semibold text-slate-900">
                휴대전화 인증
              </h3>

              {isPhoneVerified && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <Check size={15} />
                인증 완료
              </span>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  disabled={isPhoneVerified}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setPhoneVerificationToken('');
                  }}
                  placeholder="01012345678"
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
              />

              <button
                  type="button"
                  disabled={
                      sendingPhone || isPhoneVerified
                  }
                  onClick={() =>
                      void handleSendPhoneVerification()
                  }
                  className="shrink-0 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                {sendingPhone ? '발송 중' : '인증번호 발송'}
              </button>
            </div>

            {!isPhoneVerified && (
                <div className="mt-3 flex gap-2">
                  <input
                      type="text"
                      inputMode="numeric"
                      value={phoneCode}
                      onChange={(event) =>
                          setPhoneCode(event.target.value)
                      }
                      placeholder="인증번호"
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />

                  <button
                      type="button"
                      disabled={verifyingPhone}
                      onClick={() =>
                          void handleVerifyPhone()
                      }
                      className="shrink-0 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:bg-slate-300"
                  >
                    {verifyingPhone ? '확인 중' : '인증'}
                  </button>
                </div>
            )}
          </section>

          <section className="mt-10 space-y-5">
            <h3 className="text-base font-semibold text-slate-900">
              회원 정보
            </h3>

            <div>
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
                  placeholder="이름"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
              >
                비밀번호
              </label>

              <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                      setPassword(event.target.value)
                  }
                  placeholder="비밀번호"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                  htmlFor="passwordConfirm"
                  className="block text-sm font-medium text-slate-700"
              >
                비밀번호 확인
              </label>

              <input
                  id="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(event) =>
                      setPasswordConfirm(
                          event.target.value,
                      )
                  }
                  placeholder="비밀번호 다시 입력"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </section>

          <section className="mt-10 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                주소
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                주소 검색 API는 이후 별도로 연결합니다.
              </p>
            </div>

            <input
                type="text"
                value={zipCode}
                onChange={(event) =>
                    setZipCode(event.target.value)
                }
                placeholder="우편번호"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <input
                type="text"
                value={roadAddress}
                onChange={(event) =>
                    setRoadAddress(event.target.value)
                }
                placeholder="도로명 주소"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <input
                type="text"
                value={jibunAddress}
                onChange={(event) =>
                    setJibunAddress(event.target.value)
                }
                placeholder="지번 주소"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <input
                type="text"
                value={detailAddress}
                onChange={(event) =>
                    setDetailAddress(event.target.value)
                }
                placeholder="상세 주소"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </section>

          {errorMessage && (
              <p
                  role="alert"
                  className="mt-7 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </p>
          )}

          {successMessage && (
              <p
                  role="status"
                  className="mt-7 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {successMessage}
              </p>
          )}

          <button
              type="submit"
              disabled={submitting}
              className="mt-8 h-13 w-full rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting
                ? '회원가입 중...'
                : '회원가입'}
          </button>

          <p className="mt-7 text-center text-sm text-slate-500">
            이미 계정이 있나요?{' '}
            <Link
                to="/login"
                className="font-semibold text-indigo-600"
            >
              로그인
            </Link>
          </p>
        </form>
      </main>
  );
}
