import {createBrowserRouter} from 'react-router-dom';

import HomePage from '@/app/HomePage';
import NotFoundPage from '@/app/NotFoundPage';
import RouteErrorPage from '@/app/RouteErrorPage';

import AppLayout from '@/components/layout/AppLayout';
import PlainLayout from '@/components/layout/PlainLayout';

import AdminLayout from '@/features/admin/layouts/AdminLayout';
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage';
import AdminRouteGuard from '@/features/admin/routes/AdminRouteGuard';
import AdminVenuePage from '@/features/admin/venue/pages/AdminVenuePage';

import {LoginPage} from '@/features/auth/pages/LoginPage';
import {SignUpPage} from '@/features/auth/pages/SignUpPage';

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

import AdminVenueHallPage from '@/features/admin/venuehall/pages/AdminVenueHallPage';
import AdminSeatPage from '@/features/admin/seat/pages/AdminSeatPage';

import AdminConcertPage from '@/features/admin/concert/pages/AdminConcertPage';

import AdminPerformancePage from '@/features/admin/performance/pages/AdminPerformancePage';

import AdminPerformanceSeatPage from '@/features/admin/performanceSeat/pages/AdminPerformanceSeatPage';

export const router = createBrowserRouter([
  /*
   * ============================================================
   * 일반 사용자 영역
   * 공통 Header + Bottom Navigation 사용
   * ============================================================
   */
  {
    element: <AppLayout/>,
    errorElement: <RouteErrorPage/>,

    children: [
      /*
       * 공개 화면
       */
      {
        path: '/',
        element: <HomePage/>,
      },

      {
        path: '/concerts',
        element: <ConcertListPage/>,
      },

      /*
       * 로그인 사용자만 접근
       */
      {
        element: <ProtectedRoute/>,

        children: [
          {
            path: '/reservations',
            element: <ReservationListPage/>,
          },

          {
            path: '/me',
            element: <MyPage/>,
          },
        ],
      },
    ],
  },

  /*
   * ============================================================
   * 상세 / 인증 / 결제 영역
   * Header / Bottom Navigation 없음
   * ============================================================
   */
  {
    element: <PlainLayout/>,
    errorElement: <RouteErrorPage/>,

    children: [
      /*
       * 로그인 없이 접근 가능
       */
      {
        path: '/concerts/:concertId',
        element: <ConcertDetailPage/>,
      },

      {
        path: '/performances/:performanceId/seats',
        element: <SeatSelectionPage/>,
      },

      /*
       * 비로그인 사용자만 접근
       */
      {
        element: <PublicOnlyRoute/>,

        children: [
          {
            path: '/login',
            element: <LoginPage/>,
          },

          {
            path: '/sign-up',
            element: <SignUpPage/>,
          },
        ],
      },

      /*
       * 로그인 사용자만 접근
       */
      {
        element: <ProtectedRoute/>,

        children: [
          {
            path: '/reservations/:reservationId',
            element: <ReservationDetailPage/>,
          },

          {
            path: '/reservations/:reservationId/payment',
            element: <PaymentPage/>,
          },

          {
            path: '/payments/:paymentId/success',
            element: <PaymentSuccessPage/>,
          },

          {
            path: '/payments/:paymentId/fail',
            element: <PaymentFailPage/>,
          },

          {
            path: '/me/profile',
            element: <ProfileEditPage/>,
          },

          {
            path: '/me/settings',
            element: <AccountSettingsPage/>,
          },

          {
            path: '/me/settings/email',
            element: <ChangeEmailPage/>,
          },

          {
            path: '/me/settings/phone',
            element: <ChangePhonePage/>,
          },

          {
            path: '/me/settings/delete',
            element: <DeleteAccountPage/>,
          },
        ],
      },

      /*
       * 일반 사용자 영역 fallback
       */
      {
        path: '*',
        element: <NotFoundPage/>,
      },
    ],
  },

  /*
   * ============================================================
   * 관리자 영역
   *
   * AppLayout / PlainLayout과 분리
   *
   * AdminRouteGuard
   *      ↓
   * AdminLayout
   *      ↓
   * 각 관리자 페이지
   * ============================================================
   */
  {
    element: <AdminRouteGuard/>,
    errorElement: <RouteErrorPage/>,

    children: [
      {
        path: '/admin',
        element: <AdminLayout/>,

        children: [
          /*
           * /admin
           */
          {
            index: true,
            element: <AdminDashboardPage/>,
          },

          /*
           * /admin/venues
           */
          {
            path: 'venues',
            element: <AdminVenuePage/>,
          },
          {
            path: 'venues/:venueId/halls',
            element: <AdminVenueHallPage/>,
          },
          {
            path: 'venues',
            element: <AdminVenuePage/>,
          },

          {
            path: 'venues/:venueId/halls',
            element: <AdminVenueHallPage/>,
          },

          {
            path: 'halls/:venueHallId/seats',
            element: <AdminSeatPage/>,
          },
          {
            path: 'concerts',
            element: <AdminConcertPage/>,
          },

          {
            path: 'concerts/:concertId/performances',
            element: <AdminPerformancePage/>,
          },

          {
            path: 'performances/:performanceId/seats',
            element: <AdminPerformanceSeatPage/>,
          },

          /*
           * 이후 추가 예정

           *
           * {
           *   path: 'payments',
           *   element: <AdminPaymentPage />,
           * },
           *
           * {
           *   path: 'members',
           *   element: <AdminMemberPage />,
           * },
           */
        ],
      },
    ],
  },
]);
