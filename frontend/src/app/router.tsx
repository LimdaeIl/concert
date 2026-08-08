import { createBrowserRouter } from 'react-router-dom';

import HomePage from '@/app/HomePage';
import NotFoundPage from '@/app/NotFoundPage';
import RouteErrorPage from '@/app/RouteErrorPage';

import AppLayout from '@/components/layout/AppLayout';
import PlainLayout from '@/components/layout/PlainLayout';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignUpPage } from '@/features/auth/pages/SignUpPage';

import ConcertDetailPage from '@/features/concert/pages/ConcertDetailPage';
import ConcertListPage from '@/features/concert/pages/ConcertListPage';

import AccountSettingsPage from '@/features/member/pages/AccountSettingsPage';
import ChangeEmailPage from '@/features/member/pages/ChangeEmailPage';
import ChangePhonePage from '@/features/member/pages/ChangePhonePage';
import DeleteAccountPage from '@/features/member/pages/DeleteAccountPage';
import MyPage from '@/features/member/pages/MyPage';
import ProfileEditPage from '@/features/member/pages/ProfileEditPage';

import PaymentFailPage from '@/features/payment/pages/PaymentFailPage';
import PaymentPage from '@/features/payment/pages/PaymentPage';
import PaymentSuccessPage from '@/features/payment/pages/PaymentSuccessPage';

import SeatSelectionPage from '@/features/performance/pages/SeatSelectionPage';

import ReservationDetailPage from '@/features/reservation/pages/ReservationDetailPage';
import ReservationListPage from '@/features/reservation/pages/ReservationListPage';

import ProtectedRoute from '@/routes/ProtectedRoute';
import PublicOnlyRoute from '@/routes/PublicOnlyRoute';

export const router = createBrowserRouter([
  /*
   * 공통 Header + Bottom Navigation을 사용하는 화면
   */
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/concerts',
        element: <ConcertListPage />,
      },

      /*
       * 로그인 후 메인 네비게이션에서 접근하는 화면
       */
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/reservations',
            element: <ReservationListPage />,
          },
          {
            path: '/me',
            element: <MyPage />,
          },
        ],
      },
    ],
  },

  /*
   * 공통 Header / Bottom Navigation이 없는
   * 상세 화면, 인증 화면, 결제 화면
   */
  {
    element: <PlainLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      /*
       * 로그인 없이 조회 가능한 화면
       */
      {
        path: '/concerts/:concertId',
        element: <ConcertDetailPage />,
      },
      {
        path: '/performances/:performanceId/seats',
        element: <SeatSelectionPage />,
      },

      /*
       * 비로그인 사용자만 접근
       */
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            path: '/login',
            element: <LoginPage />,
          },
          {
            path: '/sign-up',
            element: <SignUpPage />,
          },
        ],
      },

      /*
       * 로그인 사용자만 접근
       */
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/reservations/:reservationId',
            element: <ReservationDetailPage />,
          },
          {
            path: '/reservations/:reservationId/payment',
            element: <PaymentPage />,
          },

          {
            path: '/payments/:paymentId/success',
            element: <PaymentSuccessPage />,
          },
          {
            path: '/payments/:paymentId/fail',
            element: <PaymentFailPage />,
          },

          {
            path: '/me/profile',
            element: <ProfileEditPage />,
          },
          {
            path: '/me/settings',
            element: <AccountSettingsPage />,
          },
          {
            path: '/me/settings/email',
            element: <ChangeEmailPage />,
          },
          {
            path: '/me/settings/phone',
            element: <ChangePhonePage />,
          },
          {
            path: '/me/settings/delete',
            element: <DeleteAccountPage />,
          },
        ],
      },

      /*
       * 반드시 마지막 fallback
       */
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
