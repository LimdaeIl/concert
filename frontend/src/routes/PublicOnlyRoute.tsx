import {
  Navigate,
  Outlet,
} from 'react-router-dom';

import { useAuthStore } from '@/features/auth/store/authStore';

export default function PublicOnlyRoute() {
  const accessToken = useAuthStore(
      (state) => state.accessToken,
  );

  if (accessToken) {
    return (
        <Navigate
            to="/"
            replace
        />
    );
  }

  return <Outlet />;
}
