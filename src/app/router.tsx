import { createBrowserRouter } from 'react-router-dom'

import { RootLayout } from './layouts/RootLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { GuestOnly, RequireAuth, RequireRole } from '@/features/auth/components/RouteGuards'

import { LoginPage } from '@/features/auth/pages/LoginPage'
import { ForbiddenPage } from '@/features/auth/pages/ForbiddenPage'
import { MfaRequiredPage } from '@/features/auth/pages/MfaRequiredPage'

import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { MapPage } from '@/features/map/pages/MapPage'
import { PointsPage } from '@/features/points/pages/PointsPage'
import { InterventionsPage } from '@/features/interventions/pages/InterventionsPage'
import { ModerationPage } from '@/features/moderation/pages/ModerationPage'
import { AdminPage } from '@/features/admin/pages/AdminPage'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        element: <GuestOnly />,
        children: [{ path: '/login', element: <LoginPage /> }],
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
          { path: '/', element: <DashboardPage /> },
          { path: '/map', element: <MapPage /> },
          { path: '/points', element: <PointsPage /> },
          {
            element: (
              <RequireRole
                allowedRoles={['benevole', 'association', 'moderateur', 'admin']}
              />
            ),
            children: [{ path: '/interventions', element: <InterventionsPage /> }],
          },
          {
            element: <RequireRole allowedRoles={['moderateur', 'admin']} />,
            children: [{ path: '/moderation', element: <ModerationPage /> }],
          },
          {
            element: <RequireRole allowedRoles={['admin']} />,
            children: [{ path: '/admin', element: <AdminPage /> }],
          },
        ],
      },
    ],
  },
])
