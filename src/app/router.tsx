import {
  createBrowserRouter,
  Navigate,
} from 'react-router-dom'

import { AuthLayout } from './layouts/AuthLayout'

import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage'
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
import SettingsPage from '@/features/settings/pages/SettingsPage'

import TermsPage from '@/features/legal/pages/TermsPage'
import PrivacyPage from '@/features/legal/pages/PrivacyPage'
import LegalNoticePage from '@/features/legal/pages/LegalNoticePage'

import AssociationsPage from '@/features/associations/pages/AssociationsPage'
import AssociationRequestsPage from '@/features/associations/pages/AssociationRequestsPage'
import AssociationRegisterPage from '@/features/associations/pages/AssociationRegisterPage'
import AssociationTeamPage from '@/features/associations/pages/AssociationTeamPage'

import PlanningPage from '@/features/planning/pages/PlanningPage'
import NotificationsPage from '@/features/notifications/pages/NotificationsPage'

import AppLayout from '@/shared/components/AppLayout'

export const router = createBrowserRouter([
  // =========================================================
  // PAGES LÉGALES PUBLIQUES
  // =========================================================

  {
    path: '/terms',
    element: <TermsPage />,
  },

  {
    path: '/conditions-utilisation',
    element: <TermsPage />,
  },

  {
    path: '/privacy',
    element: <PrivacyPage />,
  },

  {
    path: '/politique-confidentialite',
    element: <PrivacyPage />,
  },

  {
    path: '/mentions-legales',
    element: <LegalNoticePage />,
  },

  // =========================================================
  // RACINE
  // =========================================================

  {
    path: '/',
    element: <Navigate to="/carte" replace />,
  },

  // =========================================================
  // AUTHENTIFICATION
  // =========================================================

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
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },

      {
        path: '/reset-password',
        element: <ResetPasswordPage />,
      },

      {
        path: '/associations/register',
        element: <AssociationRegisterPage />,
      },
    ],
  },

  // =========================================================
  // APPLICATION CONNECTÉE
  //
  // AppLayout contient :
  // - Header PULSE
  // - Menu hamburger
  // - BottomNavigation
  // =========================================================

  {
    element: <AppLayout />,
    children: [
      // =====================================================
      // DASHBOARD
      // =====================================================

      {
        path: '/dashboard',
        element: (
          <RequireAccess permission="dashboard">
            <DashboardPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // CARTE
      // =====================================================

      {
        path: '/carte',
        element: (
          <RequireAccess permission="view_map">
            <MapPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // NOTIFICATIONS
      // =====================================================

      {
        path: '/notifications',
        element: (
          <RequireAccess permission="dashboard">
            <NotificationsPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // LISTE DES POINTS
      // =====================================================

      {
        path: '/points',
        element: (
          <RequireAccess permission="view_points">
            <PointsPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // SIGNALER UN POINT
      // =====================================================

      {
        path: '/points/new',
        element: (
          <RequireAccess permission="create_point">
            <CreatePointPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // DÉTAIL D'UN POINT
      // =====================================================

      {
        path: '/points/:pointId',
        element: (
          <RequireAccess permission="view_points">
            <PointDetailsPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // MODIFIER UN POINT
      // =====================================================

      {
        path: '/points/:pointId/edit',
        element: (
          <RequireAccess permission="edit_point">
            <EditPointPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // PLANNING
      // =====================================================

      {
        path: '/planning',
        element: (
          <RequireAccess permission="planning">
            <PlanningPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // ASSOCIATIONS
      // =====================================================

      {
        path: '/associations',
        element: (
          <RequireAccess permission="view_associations">
            <AssociationsPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // DEMANDES BÉNÉVOLES
      // =====================================================

      {
        path: '/association/demandes',
        element: (
          <RequireAccess permission="manage_association_requests">
            <AssociationRequestsPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // ÉQUIPE ASSOCIATION
      // =====================================================

      {
        path: '/association/equipe',
        element: (
          <RequireAccess permission="manage_association_requests">
            <AssociationTeamPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // INTERVENTIONS
      // =====================================================

      {
        path: '/interventions',
        element: (
          <RequireAccess permission="manage_interventions">
            <InterventionsPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // CRÉER UNE INTERVENTION
      // =====================================================

      {
        path: '/interventions/new',
        element: (
          <RequireAccess permission="manage_interventions">
            <CreateInterventionPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // MODÉRATION
      // =====================================================

      {
        path: '/moderation',
        element: (
          <RequireAccess permission="moderation">
            <ModerationPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // DOUBLONS
      // =====================================================

      {
        path: '/moderation/doublons',
        element: (
          <RequireAccess permission="moderation">
            <DuplicatePointsPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // ADMINISTRATION
      // =====================================================

      {
        path: '/administration',
        element: (
          <RequireAccess permission="administration">
            <AdminPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // ADMINISTRATION ASSOCIATIONS
      // =====================================================

      {
        path: '/administration/associations',
        element: (
          <RequireAccess permission="administration">
            <AdminAssociationsPage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // PROFIL
      // =====================================================

      {
        path: '/profile',
        element: (
          <RequireAccess permission="profile">
            <ProfilePage />
          </RequireAccess>
        ),
      },

      // =====================================================
      // RÉGLAGES
      // =====================================================

      {
        path: '/settings',
        element: (
          <RequireAccess permission="profile">
            <SettingsPage />
          </RequireAccess>
        ),
      },
    ],
  },

  // =========================================================
  // ROUTE INCONNUE
  // =========================================================

  {
    path: '*',
    element: <Navigate to="/carte" replace />,
  },
])