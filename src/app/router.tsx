import { createBrowserRouter, Navigate } from 'react-router-dom'

import { RootLayout } from './layouts/RootLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { GuestOnly, RequireAuth, RequireRole } from '@/features/auth/components/RouteGuards'

import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import { ForbiddenPage } from '@/features/auth/pages/ForbiddenPage'
import { MfaRequiredPage } from '@/features/auth/pages/MfaRequiredPage'
import AdminPage from '@/features/admin/pages/AdminPage'
import AdminAssociationsPage from '@/features/admin/pages/AdminAssociationsPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import InterventionsPage from '@/features/interventions/pages/InterventionsPage'
import CreateInterventionPage from '@/features/interventions/pages/CreateInterventionPage'
import MapPage from '@/features/map/pages/MapPage'
import ModerationPage from '@/features/moderation/pages/ModerationPage'
import PointsPage from '@/features/points/pages/PointsPage'
import CreatePointPage from '@/features/points/pages/CreatePointPage'
import EditPointPage from '@/features/points/pages/EditPointPage'
import PointDetailsPage from '@/features/points/pages/PointDetailsPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { SecurityCenterPage } from '@/features/security/pages/SecurityCenterPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  {
    element: <AuthLayout />,
    children: [
      {
        element: <GuestOnly />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      { path: '/forbidden', element: <ForbiddenPage /> },
      { path: '/mfa-required', element: <MfaRequiredPage /> },
    ],
  },

  {
    element: <RequireAuth />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/carte', element: <MapPage /> },
          { path: '/points', element: <PointsPage /> },
          { path: '/points/new', element: <CreatePointPage /> },
          { path: '/points/:pointId', element: <PointDetailsPage /> },
          {
            element: (
              <RequireRole allowedRoles={['benevole', 'association', 'moderateur', 'admin']} />
            ),
            children: [{ path: '/points/:pointId/edit', element: <EditPointPage /> }],
          },
          {
            element: (
              <RequireRole allowedRoles={['benevole', 'association', 'moderateur', 'admin']} />
            ),
            children: [{ path: '/interventions', element: <InterventionsPage /> }],
          },
          {
            element: (
              <RequireRole allowedRoles={['benevole', 'association', 'moderateur', 'admin']} />
            ),
            children: [{ path: '/interventions/new', element: <CreateInterventionPage /> }],
          },
          {
            element: <RequireRole allowedRoles={['moderateur', 'admin']} />,
            children: [{ path: '/moderation', element: <ModerationPage /> }],
          },
          {
            element: <RequireRole allowedRoles={['admin']} />,
            children: [
              { path: '/administration', element: <AdminPage /> },
              { path: '/administration/associations', element: <AdminAssociationsPage /> },
              { path: '/administration/security', element: <SecurityCenterPage /> },
            ],
          },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
])
