import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AuthLayout } from './layouts/AuthLayout'

import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import RequireAccess from '@/features/auth/components/RequireAccess'

import AdminPage from '@/features/admin/pages/AdminPage'
import AdminAssociationsPage from '@/features/admin/pages/AdminAssociationsPage'

import DashboardPage from '@/features/dashboard/pages/DashboardPage'

import InterventionsPage from '@/features/interventions/pages/InterventionsPage'
import CreateInterventionPage from '@/features/interventions/pages/CreateInterventionPage'

import MapPage from '@/features/map/pages/MapPage'

import ModerationPage from '@/features/moderation/pages/ModerationPage'
import DuplicatePointsPage from '@/features/moderation/pages/DuplicatePointsPage'

import PointsPage from '@/features/points/pages/PointsPage'
import CreatePointPage from '@/features/points/pages/CreatePointPage'
import EditPointPage from '@/features/points/pages/EditPointPage'
import PointDetailsPage from '@/features/points/pages/PointDetailsPage'

import ProfilePage from '@/features/profile/pages/ProfilePage'

import AssociationsPage from '@/features/associations/pages/AssociationsPage'
import AssociationRequestsPage from '@/features/associations/pages/AssociationRequestsPage'
import AssociationRegisterPage from '@/features/associations/pages/AssociationRegisterPage'
import AssociationTeamPage from '@/features/associations/pages/AssociationTeamPage'

import PlanningPage from '@/features/planning/pages/PlanningPage'
import NotificationsPage from '@/features/notifications/pages/NotificationsPage'

import AppLayout from '@/shared/components/AppLayout'

export const router = createBrowserRouter([
  {
  path: '/',
  element: <Navigate to="/carte" replace />,
},

  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/associations/register',
        element: <AssociationRegisterPage />,
      },
    ],
  },

  {
    element: <AppLayout />,
    children: [
      {
        path: '/dashboard',
        element: (
          <RequireAccess permission="dashboard">
            <DashboardPage />
          </RequireAccess>
        ),
      },
      {
        path: '/carte',
        element: (
          <RequireAccess permission="view_map">
            <MapPage />
          </RequireAccess>
        ),
      },
      {
        path: '/notifications',
        element: (
          <RequireAccess permission="dashboard">
            <NotificationsPage />
          </RequireAccess>
        ),
      },
      {
        path: '/points',
        element: (
          <RequireAccess permission="view_points">
            <PointsPage />
          </RequireAccess>
        ),
      },
      {
        path: '/planning',
        element: (
          <RequireAccess permission="manage_interventions">
            <PlanningPage />
          </RequireAccess>
        ),
      },
      {
        path: '/points/new',
        element: (
          <RequireAccess permission="create_point">
            <CreatePointPage />
          </RequireAccess>
        ),
      },
      {
        path: '/points/:pointId',
        element: (
          <RequireAccess permission="view_points">
            <PointDetailsPage />
          </RequireAccess>
        ),
      },
      {
        path: '/points/:pointId/edit',
        element: (
          <RequireAccess permission="view_points">
            <EditPointPage />
          </RequireAccess>
        ),
      },
      {
        path: '/associations',
        element: (
          <RequireAccess permission="view_associations">
            <AssociationsPage />
          </RequireAccess>
        ),
      },
      {
        path: '/association/demandes',
        element: (
          <RequireAccess permission="manage_association_requests">
            <AssociationRequestsPage />
          </RequireAccess>
        ),
      },
      {
        path: '/association/equipe',
        element: (
          <RequireAccess permission="manage_association_requests">
            <AssociationTeamPage />
          </RequireAccess>
        ),
      },
      {
        path: '/interventions',
        element: (
          <RequireAccess permission="manage_interventions">
            <InterventionsPage />
          </RequireAccess>
        ),
      },
      {
        path: '/interventions/new',
        element: (
          <RequireAccess permission="manage_interventions">
            <CreateInterventionPage />
          </RequireAccess>
        ),
      },
      {
        path: '/moderation',
        element: (
          <RequireAccess permission="moderation">
            <ModerationPage />
          </RequireAccess>
        ),
      },
      {
        path: '/moderation/doublons',
        element: (
          <RequireAccess permission="moderation">
            <DuplicatePointsPage />
          </RequireAccess>
        ),
      },
      {
        path: '/administration',
        element: (
          <RequireAccess permission="administration">
            <AdminPage />
          </RequireAccess>
        ),
      },
      {
        path: '/administration/associations',
        element: (
          <RequireAccess permission="administration">
            <AdminAssociationsPage />
          </RequireAccess>
        ),
      },
      {
        path: '/profile',
        element: (
          <RequireAccess permission="profile">
            <ProfilePage />
          </RequireAccess>
        ),
      },
      {
  path: 'settings',
  element: (
    <RequireAccess permission="dashboard">
      <ProfilePage />
    </RequireAccess>
  ),
},
    ],
  },

  {
  path: '*',
  element: <Navigate to="/carte" replace />,
}
])