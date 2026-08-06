import { Link } from 'react-router-dom';

export function SignUpPage() {
  return (
      <main className="px-5 py-8">
        <Link
            to="/login"
            className="text-sm font-medium text-indigo-600"
        >
          로그인으로 돌아가기
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-slate-950">
          회원가입
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          이메일 및 휴대전화 인증 기능을 다음 단계에서
          구현합니다.
        </p>
      </main>
  );
}
