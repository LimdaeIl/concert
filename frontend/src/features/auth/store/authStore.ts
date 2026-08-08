import { create } from 'zustand';

import {
  clearAuthSession,
  markAuthSession,
} from '@/features/auth/lib/authSession';

interface AuthState {
  memberId: number | null;
  accessToken: string | null;
  initialized: boolean;

  isAuthenticated: () => boolean;

  setAuthentication: (
      memberId: number,
      accessToken: string,
  ) => void;

  setAccessToken: (
      accessToken: string,
  ) => void;

  clearAuthentication: () => void;

  setInitialized: (
      initialized: boolean,
  ) => void;
}

export const useAuthStore =
    create<AuthState>(
        (set, get) => ({
          memberId: null,
          accessToken: null,
          initialized: false,

          isAuthenticated: () =>
              Boolean(
                  get().accessToken,
              ),

          setAuthentication: (
              memberId,
              accessToken,
          ) => {
            markAuthSession();

            set({
              memberId,
              accessToken,
            });
          },

          setAccessToken: (
              accessToken,
          ) => {
            set({
              accessToken,
            });
          },

          clearAuthentication: () => {
            clearAuthSession();

            set({
              memberId: null,
              accessToken: null,
            });
          },

          setInitialized: (
              initialized,
          ) => {
            set({
              initialized,
            });
          },
        }),
    );
