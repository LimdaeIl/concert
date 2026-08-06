import {
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import { getApiErrorMessage } from '@/lib/api/getApiErrorMessage';

import { getMe } from '../api/memberApi';
import type { Member } from '../types/member';

export function MyPage() {
  const [member, setMember] = useState<Member | null>(
      null,
  );

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadMember() {
      try {
        const response = await getMe();

        if (active) {
          setMember(response);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
              getApiErrorMessage(
                  error,
                  '회원 정보를 불러오지 못했습니다.',
              ),
          );
        }
      }
    }

    void loadMember();

    return () => {
      active = false;
    };
  }, []);

  if (errorMessage) {
    return (
        <main className="px-5 py-8">
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </p>
        </main>
    );
  }

  if (!member) {
    return (
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">
            회원 정보를 불러오고 있습니다.
          </p>
        </main>
    );
  }

  return (
      <main className="px-5 py-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              마이페이지
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">
              {member.name}
            </h1>
          </div>

          <Link
              to="/"
              className="text-sm font-medium text-indigo-600"
          >
            홈
          </Link>
        </header>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
          <dl className="divide-y divide-slate-200">
            <InfoItem
                label="회원 번호"
                value={String(member.memberId)}
            />
            <InfoItem
                label="이메일"
                value={member.email}
            />
            <InfoItem
                label="휴대전화"
                value={member.phone}
            />
            <InfoItem
                label="권한"
                value={member.role}
            />
            <InfoItem
                label="상태"
                value={member.status}
            />
          </dl>
        </section>
      </main>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({
                    label,
                    value,
                  }: InfoItemProps) {
  return (
      <div className="grid grid-cols-[100px_1fr] gap-4 px-4 py-4">
        <dt className="text-sm text-slate-500">
          {label}
        </dt>
        <dd className="break-all text-sm font-medium text-slate-900">
          {value}
        </dd>
      </div>
  );
}
