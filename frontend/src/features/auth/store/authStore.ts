import { create } from 'zustand';

interface AuthState {
  memberId: number | null;
  accessToken: string | null;
  initialized: boolean;

  isAuthenticated: () => boolean;
  setAuthentication: (
      memberId: number,
      accessToken: string,
  ) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuthentication: () => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  memberId: null,
  accessToken: null,
  initialized: false,

  isAuthenticated: () => Boolean(get().accessToken),

  setAuthentication: (memberId, accessToken) => {
    set({
      memberId,
      accessToken,
    });
  },

  setAccessToken: (accessToken) => {
    set({
      accessToken,
    });
  },

  clearAuthentication: () => {
    set({
      memberId: null,
      accessToken: null,
    });
  },

  setInitialized: (initialized) => {
    set({
      initialized,
    });
  },
}));
