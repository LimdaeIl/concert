import {
  type PropsWithChildren,
  useEffect,
} from 'react';

import { reissue } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';

export function AuthInitializer({children,}: PropsWithChildren) {
  const initialized = useAuthStore(
      (state) => state.initialized,
  );

  const setAuthentication = useAuthStore(
      (state) => state.setAuthentication,
  );

  const clearAuthentication = useAuthStore(
      (state) => state.clearAuthentication,
  );

  const setInitialized = useAuthStore(
      (state) => state.setInitialized,
  );

  useEffect(() => {
    let active = true;

    async function initializeAuthentication() {
      try {
        const authentication = await reissue();

        if (!active) {
          return;
        }

        setAuthentication(
            authentication.id,
            authentication.accessToken,
        );
      } catch {
        if (active) {
          clearAuthentication();
        }
      } finally {
        if (active) {
          setInitialized(true);
        }
      }
    }

    void initializeAuthentication();

    return () => {
      active = false;
    };
  }, [
    clearAuthentication,
    setAuthentication,
    setInitialized,
  ]);

  if (!initialized) {
    return (
        <div className="min-h-dvh bg-slate-100">
          <div className="mx-auto flex min-h-dvh w-full max-w-[640px] items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3">
              <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

              <p className="text-sm text-slate-500">
                로그인 상태를 확인하고 있습니다.
              </p>
            </div>
          </div>
        </div>
    );
  }

  return children;
}
