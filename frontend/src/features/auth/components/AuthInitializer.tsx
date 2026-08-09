import {
  type PropsWithChildren,
  useEffect,
} from 'react';

import { reissue } from '@/features/auth/api/authApi';
import { hasAuthSession } from '@/features/auth/lib/authSession';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getMe } from '@/features/member/api/memberApi';

let initializationPromise:
    Promise<void> | null = null;

export function AuthInitializer({
                                  children,
                                }: PropsWithChildren) {
  const initialized =
      useAuthStore(
          (state) =>
              state.initialized,
      );

  const setAuthentication =
      useAuthStore(
          (state) =>
              state.setAuthentication,
      );

  const setMember =
      useAuthStore(
          (state) =>
              state.setMember,
      );

  const clearAuthentication =
      useAuthStore(
          (state) =>
              state.clearAuthentication,
      );

  const setInitialized =
      useAuthStore(
          (state) =>
              state.setInitialized,
      );

  useEffect(() => {
    let active = true;

    if (!hasAuthSession()) {
      setInitialized(true);

      return () => {
        active = false;
      };
    }

    async function initializeAuthentication() {
      try {
        const authentication =
            await reissue();

        if (!active) {
          return;
        }

        setAuthentication(
            authentication.id,
            authentication.accessToken,
        );

        const member =
            await getMe();

        if (!active) {
          return;
        }

        setMember({
          id:
          member.id,
          name:
          member.name,
          email:
          member.email,
        });
      } catch {
        if (active) {
          clearAuthentication();
        }
      }
    }

    if (!initializationPromise) {
      initializationPromise =
          initializeAuthentication();
    }

    void initializationPromise.finally(
        () => {
          if (active) {
            setInitialized(true);
          }

          initializationPromise = null;
        },
    );

    return () => {
      active = false;
    };
  }, [
    clearAuthentication,
    setAuthentication,
    setInitialized,
    setMember,
  ]);

  if (!initialized) {
    return (
        <div className="min-h-dvh bg-slate-100">
          <div className="mx-auto flex min-h-dvh w-full max-w-[640px] items-center justify-center bg-white">
            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          </div>
        </div>
    );
  }

  return children;
}
