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
import SettingsPage from '@/features/settings/pages/SettingsPage'

import AssociationsPage from '@/features/associations/pages/AssociationsPage'
import AssociationRequestsPage from '@/features/associations/pages/AssociationRequestsPage'
import AssociationRegisterPage from '@/features/associations/pages/AssociationRegisterPage'
import AssociationTeamPage from '@/features/associations/pages/AssociationTeamPage'

import PlanningPage from '@/features/planning/pages/PlanningPage'
import NotificationsPage from '@/features/notifications/pages/NotificationsPage'

import AppLayout from '@/shared/components/AppLayout'

export const router = createBrowserRouter([
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
      //
      // Association validée
      // Modérateur
      // Admin
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
      //
      // Bénévole validé
      // Association validée
      // Modérateur
      // Admin
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
      //
      // Le bénévole validé peut consulter.
      // Il ne peut PAS modifier.
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
      //
      // Citoyen
      // Bénévole
      // Association validée
      // Modérateur
      // Admin
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
      //
      // Le bénévole validé peut consulter.
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
      //
      // IMPORTANT :
      // Le bénévole NE PEUT PAS modifier un point.
      //
      // Association validée
      // Modérateur
      // Admin
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
      //
      // Bénévole validé : consultation OUI
      // Association validée
      // Modérateur
      // Admin
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
      //
      // Permet à un bénévole non rattaché de rejoindre
      // une association.
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
      //
      // Association validée uniquement
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
      //
      // Association validée uniquement
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
      //
      // IMPORTANT :
      // Le bénévole N'A PAS accès à la gestion
      // des interventions.
      //
      // Association validée
      // Modérateur
      // Admin
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
      //
      // Le bénévole NE PEUT PAS créer une intervention.
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
      //
      // Modérateur
      // Admin
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
      //
      // Modérateur
      // Admin
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
      //
      // Admin uniquement
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
      //
      // Admin uniquement
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
      //
      // Tous les utilisateurs connectés
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
      //
      // Tous les utilisateurs connectés
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