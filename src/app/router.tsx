import { createBrowserRouter } from 'react-router-dom'

import { RootLayout } from './layouts/RootLayout'
import { AuthLayout } from './layouts/AuthLayout'

// Pages – Auth
import { LoginPage } from '@/features/auth/pages/LoginPage'

// Pages – App
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { MapPage } from '@/features/map/pages/MapPage'
import { PointsPage } from '@/features/points/pages/PointsPage'
import { InterventionsPage } from '@/features/interventions/pages/InterventionsPage'
import { ModerationPage } from '@/features/moderation/pages/ModerationPage'
import { AdminPage } from '@/features/admin/pages/AdminPage'

export const router = createBrowserRouter([
  // ── Routes publiques (auth) ──────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },

  // ── Routes privées (app) ─────────────────────────────────────────────
  {
    element: <RootLayout />,
    children: [
      { path: '/',              element: <DashboardPage /> },
      { path: '/map',           element: <MapPage /> },
      { path: '/points',        element: <PointsPage /> },
      { path: '/interventions', element: <InterventionsPage /> },
      { path: '/moderation',    element: <ModerationPage /> },
      { path: '/admin',         element: <AdminPage /> },
    ],
  },
])
