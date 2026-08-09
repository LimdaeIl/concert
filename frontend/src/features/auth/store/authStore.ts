import { create } from 'zustand';

import {
  clearAuthSession,
  markAuthSession,
} from '@/features/auth/lib/authSession';

interface AuthMember {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  memberId: number | null;
  accessToken: string | null;

  member: AuthMember | null;

  initialized: boolean;

  isAuthenticated: () => boolean;

  setAuthentication: (
      memberId: number,
      accessToken: string,
  ) => void;

  setMember: (
      member: AuthMember,
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
          member: null,
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

          setMember: (
              member,
          ) => {
            set({
              member,
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
              member: null,
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

