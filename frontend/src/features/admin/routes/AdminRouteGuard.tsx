import {
  Navigate,
  Outlet,
} from 'react-router-dom';

import { useAuthStore } from '@/features/auth/store/authStore';

export default function AdminRouteGuard() {
  const accessToken =
      useAuthStore(
          (state) => state.accessToken,
      );

  const member =
      useAuthStore(
          (state) => state.member,
      );

  if (!accessToken) {
    return (
        <Navigate
            to="/login"
            replace
        />
    );
  }

  if (!member) {
    return null;
  }

  if (member.role !== 'ADMIN') {
    return (
        <Navigate
            to="/"
            replace
        />
    );
  }

  return <Outlet />;
}
