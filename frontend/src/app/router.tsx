import {createBrowserRouter,} from 'react-router-dom';

import HomePage from '@/app/HomePage';

import NotFoundPage from '@/app/NotFoundPage';

import RouteErrorPage from '@/app/RouteErrorPage';

import AppLayout from '@/components/layout/AppLayout';

import PlainLayout from '@/components/layout/PlainLayout';

import AdminLayout from '@/features/admin/layouts/AdminLayout';

import AdminConcertPage from '@/features/admin/concert/pages/AdminConcertPage';

import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage';

import AdminPerformancePage from '@/features/admin/performance/pages/AdminPerformancePage';

import AdminPerformanceSeatPage
  from '@/features/admin/performanceSeat/pages/AdminPerformanceSeatPage';

import AdminRouteGuard from '@/features/admin/routes/AdminRouteGuard';

import AdminSeatPage from '@/features/admin/seat/pages/AdminSeatPage';

import AdminVenuePage from '@/features/admin/venue/pages/AdminVenuePage';

import AdminVenueHallPage from '@/features/admin/venuehall/pages/AdminVenueHallPage';

import {LoginPage,} from '@/features/auth/pages/LoginPage';

import {SignUpPage,} from '@/features/auth/pages/SignUpPage';

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

export const router =
    createBrowserRouter([
      /*
       * ============================================================
       * 일반 사용자 영역
       *
       * AppLayout
       * - Header
       * - Bottom Navigation
       * ============================================================
       */
      {
        element:
            <AppLayout/>,

        errorElement:
            <RouteErrorPage/>,

        children: [
          /*
           * 공개 화면
           */
          {
            path: '/',
            element:
                <HomePage/>,
          },

          {
            path: '/concerts',
            element:
                <ConcertListPage/>,
          },

          /*
           * 로그인 사용자만 접근
           */
          {
            element:
                <ProtectedRoute/>,

            children: [
              {
                path:
                    '/reservations',

                element:
                    <ReservationListPage/>,
              },

              {
                path:
                    '/me',

                element:
                    <MyPage/>,
              },
            ],
          },
        ],
      },

      /*
       * ============================================================
       * 상세 / 인증 / 결제 영역
       *
       * PlainLayout
       * - 공통 Header 없음
       * - Bottom Navigation 없음
       * ============================================================
       */
      {
        element:
            <PlainLayout/>,

        errorElement:
            <RouteErrorPage/>,

        children: [
          /*
           * 로그인 없이 접근 가능
           */
          {
            path:
                '/concerts/:concertId',

            element:
                <ConcertDetailPage/>,
          },

          {
            path:
                '/performances/:performanceId/seats',

            element:
                <SeatSelectionPage/>,
          },

          /*
           * 비로그인 사용자만 접근
           */
          {
            element:
                <PublicOnlyRoute/>,

            children: [
              {
                path:
                    '/login',

                element:
                    <LoginPage/>,
              },

              {
                path:
                    '/sign-up',

                element:
                    <SignUpPage/>,
              },
            ],
          },

          /*
           * 로그인 사용자만 접근
           */
          {
            element:
                <ProtectedRoute/>,

            children: [
              {
                path:
                    '/reservations/:reservationId',

                element:
                    <ReservationDetailPage/>,
              },

              {
                path:
                    '/reservations/:reservationId/payment',

                element:
                    <PaymentPage/>,
              },

              {
                path:
                    '/payments/:paymentId/success',

                element:
                    <PaymentSuccessPage/>,
              },

              {
                path:
                    '/payments/:paymentId/fail',

                element:
                    <PaymentFailPage/>,
              },

              {
                path:
                    '/me/profile',

                element:
                    <ProfileEditPage/>,
              },

              {
                path:
                    '/me/settings',

                element:
                    <AccountSettingsPage/>,
              },

              {
                path:
                    '/me/settings/email',

                element:
                    <ChangeEmailPage/>,
              },

              {
                path:
                    '/me/settings/phone',

                element:
                    <ChangePhonePage/>,
              },

              {
                path:
                    '/me/settings/delete',

                element:
                    <DeleteAccountPage/>,
              },
            ],
          },

          /*
           * 일반 사용자 영역 fallback
           */
          {
            path: '*',

            element:
                <NotFoundPage/>,
          },
        ],
      },

      /*
       * ============================================================
       * 관리자 영역
       *
       * AdminRouteGuard
       *        ↓
       * AdminLayout
       *        ↓
       * 관리자 페이지
       *
       * 현재 구현된 관리자 기능만 연결
       * ============================================================
       */
      {
        element:
            <AdminRouteGuard/>,

        errorElement:
            <RouteErrorPage/>,

        children: [
          {
            path:
                '/admin',

            element:
                <AdminLayout/>,

            children: [
              /*
               * 관리자 대시보드
               *
               * /admin
               */
              {
                index: true,

                element:
                    <AdminDashboardPage/>,
              },

              /*
               * =====================================================
               * 공연장 관리
               * =====================================================
               */

              /*
               * 공연장 목록 / 생성 / 수정 / 상태 관리
               *
               * /admin/venues
               */
              {
                path:
                    'venues',

                element:
                    <AdminVenuePage/>,
              },

              /*
               * 특정 공연장의 공연홀 관리
               *
               * /admin/venues/:venueId/halls
               */
              {
                path:
                    'venues/:venueId/halls',

                element:
                    <AdminVenueHallPage/>,
              },

              /*
               * 특정 공연홀의 물리 좌석 관리
               *
               * /admin/halls/:venueHallId/seats
               */
              {
                path:
                    'halls/:venueHallId/seats',

                element:
                    <AdminSeatPage/>,
              },

              /*
               * =====================================================
               * 공연 관리
               * =====================================================
               */

              /*
               * 공연 목록 / 생성 / 수정 / 상태 관리
               *
               * /admin/concerts
               */
              {
                path:
                    'concerts',

                element:
                    <AdminConcertPage/>,
              },

              /*
               * 특정 공연의 회차 관리
               *
               * /admin/concerts/:concertId/performances
               */
              {
                path:
                    'concerts/:concertId/performances',

                element:
                    <AdminPerformancePage/>,
              },

              /*
               * 특정 회차의 판매 좌석 관리
               *
               * /admin/performances/:performanceId/seats
               */
              {
                path:
                    'performances/:performanceId/seats',

                element:
                    <AdminPerformanceSeatPage/>,
              },

              /*
               * 관리자 영역 fallback
               *
               * 잘못된 /admin/... 접근도
               * 일반 사용자 fallback에 떨어지지 않도록
               * 관리자 내부에서 처리한다.
               */
              {
                path: '*',

                element:
                    <NotFoundPage/>,
              },
            ],
          },
        ],
      },
    ]);
