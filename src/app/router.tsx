import { createBrowserRouter, Navigate } from 'react-router-dom'

import { RootLayout } from './layouts/RootLayout'
import { AuthLayout } from './layouts/AuthLayout'

// Pages – Auth
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'

import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { MapPage } from '@/features/map/pages/MapPage'
import { PointsPage } from '@/features/points/pages/PointsPage'
import { InterventionsPage } from '@/features/interventions/pages/InterventionsPage'
import { ModerationPage } from '@/features/moderation/pages/ModerationPage'
import { AdminPage } from '@/features/admin/pages/AdminPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  {
    element: <RootLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/carte', element: <MapPage /> },
      { path: '/points', element: <PointsPage /> },
      { path: '/interventions', element: <InterventionsPage /> },
      { path: '/moderation', element: <ModerationPage /> },
      { path: '/administration', element: <AdminPage /> },
    ],
  },
])