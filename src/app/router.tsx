import { createBrowserRouter, Navigate } from 'react-router-dom'

import { RootLayout } from './layouts/RootLayout'
import { AuthLayout } from './layouts/AuthLayout'

import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import { AdminPage } from '@/features/admin/pages/AdminPage'
import  DashboardPage  from '@/features/dashboard/pages/DashboardPage'
import  InterventionsPage  from '@/features/interventions/pages/InterventionsPage'
import  MapPage  from '@/features/map/pages/MapPage'
import ModerationPage  from '@/features/moderation/pages/ModerationPage'
import  PointsPage  from '@/features/points/pages/PointsPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import CreatePointPage from '@/features/points/pages/CreatePointPage'
import EditPointPage from '@/features/points/pages/EditPointPage'
import PointDetailsPage from '@/features/points/pages/PointDetailsPage'
import CreateInterventionPage from '@/features/interventions/pages/CreateInterventionPage'

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
      { path: '/profile', element: <ProfilePage /> },
      { path: '/points/new', element: <CreatePointPage /> },
      { path: '/points/:pointId/edit', element: <EditPointPage /> },
      { path: '/points/:pointId', element: <PointDetailsPage /> },
      { path: '/carte', element: <MapPage /> },
      { path: '/interventions/new', element: <CreateInterventionPage /> },
    ],
  },
])
