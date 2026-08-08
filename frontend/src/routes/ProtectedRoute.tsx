import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import { useAuthStore } from '@/features/auth/store/authStore';

export default function ProtectedRoute() {
  const location =
      useLocation();

  const accessToken =
      useAuthStore(
          (state) =>
              state.accessToken,
      );

  if (!accessToken) {
    return (
        <Navigate
            to="/login"
            replace
            state={{
              from:
                  location.pathname +
                  location.search,
            }}
        />
    );
  }

  return <Outlet />;
}
