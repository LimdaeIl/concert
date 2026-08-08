import {createBrowserRouter} from 'react-router-dom';

import HomePage from '@/app/HomePage';
import AppLayout from '@/components/layout/AppLayout';
import PlainLayout from '@/components/layout/PlainLayout';

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

import SeatSelectionPage from '@/features/performance/pages/SeatSelectionPage';

import ReservationListPage from '@/features/reservation/pages/ReservationListPage';

import ProtectedRoute from '@/routes/ProtectedRoute';
import PublicOnlyRoute from '@/routes/PublicOnlyRoute';

import ReservationDetailPage from '@/features/reservation/pages/ReservationDetailPage';

import PaymentFailPage from '@/features/payment/pages/PaymentFailPage';
import PaymentPage from '@/features/payment/pages/PaymentPage';
import PaymentSuccessPage from '@/features/payment/pages/PaymentSuccessPage';
import NotFoundPage from "@/app/NotFoundPage.tsx";

import RouteErrorPage from '@/app/RouteErrorPage';

export const router = createBrowserRouter([
  {
    element: <AppLayout/>,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/',
        element: <HomePage/>,
      },
      {
        path: '/concerts',
        element: <ConcertListPage/>,
      },

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
            path: '/reservations/:reservationId',
            element: <ReservationDetailPage/>,
          },

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

  {
    element: <PlainLayout/>,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '*',
        element: <NotFoundPage />,
      },
      {
        path: '/concerts/:concertId',
        element: <ConcertDetailPage/>,
      },
      {
        path: '/performances/:performanceId/seats',
        element: <SeatSelectionPage/>,
      },

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

      {
        element: <ProtectedRoute/>,
        children: [
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
    ],
  },
]);
