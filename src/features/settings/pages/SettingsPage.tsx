import {
  type ReactNode,
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { getCurrentProfile } from '@/features/auth/api/profile'
import { supabase } from '@/lib/supabase'

import {
  getThemePreference,
  setThemePreference,
  type ThemePreference,
} from '@/shared/theme/theme'

import {
  LANGUAGE_OPTIONS,
  getLanguage,
  setAppLanguage,
  type AppLanguage,
} from '@/shared/i18n/i18n'

/* =========================================================
   TYPES
========================================================= */

type ActiveModal =
  | 'profile'
  | 'password'
  | 'association'
  | 'delete-account'
  | null

type NotificationPreferences = {
  planning: boolean
  interventions: boolean
  associationRequests: boolean
  pulseNews: boolean
}

type AssociationSettings = {
  id: string
  nom: string | null
  description: string | null
  email: string | null
  telephone: string | null
  ville: string | null
  zone_action: string | null
  type_aide_principale: string | null
}

type EnabledLanguage =
  | 'fr'
  | 'en'
  | 'es'

/* =========================================================
   VALEURS PAR DÉFAUT
========================================================= */

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  planning: true,
  interventions: true,
  associationRequests: true,
  pulseNews: false,
}

/* =========================================================
   TRADUCTIONS FR
========================================================= */

const FR = {
  loadingSettings:
    'Chargement des réglages...',

  loadSettingsError:
    'Impossible de charger les réglages.',

  settings:
    'Réglages',

  settingsSubtitle:
    'Gère ton compte, tes informations, ta sécurité et tes préférences.',

  account:
    'Compte',

  accountDescription:
    'Informations liées à ton compte PULSE.',

  accountInfo:
    'Informations du compte',

  nameNotProvided:
    'Nom non renseigné',

  emailNotProvided:
    'E-mail non renseigné',

  edit:
    'Modifier',

  role:
    'Rôle',

  roles: {
    citoyen:
      'Citoyen',

    benevole:
      'Bénévole',

    association:
      'Association',

    moderateur:
      'Modérateur',

    admin:
      'Administrateur',
  },

  loading:
    'Chargement...',

  myAssociation:
    'Mon association',

  associationPublicInfo:
    'Nom et informations publiques de ton association.',

  viewProfile:
    'Voir mon profil',

  viewProfileDescription:
    'Consulte ton rôle, ton statut et tes permissions.',

  view:
    'Voir',

  notifications:
    'Notifications',

  notificationsDescription:
    'Choisis les informations que tu souhaites recevoir.',

  planning:
    'Planning',

  planningDescription:
    'Changements et nouvelles actions planifiées.',

  interventions:
    'Interventions',

  interventionsDescription:
    'Nouvelles interventions et modifications importantes.',

  volunteerRequests:
    'Demandes bénévoles',

  volunteerRequestsDescription:
    'Nouvelles demandes pour rejoindre ton association.',

  pulseNews:
    'Actualités PULSE',

  pulseNewsDescription:
    'Nouvelles fonctionnalités et informations importantes.',

  appearance:
    'Apparence',

  appearanceDescription:
    'Personnalise l’affichage de PULSE.',

  light:
    'Clair',

  dark:
    'Sombre',

  system:
    'Système',

  compact:
    'Affichage compact',

  compactDescription:
    'Réduit l’espace entre les éléments pour afficher davantage d’informations.',

  preferences:
    'Préférences',

  preferencesDescription:
    'Configure ton expérience PULSE.',

  language:
    'Langue',

  languageDescription:
    'Langue utilisée dans l’application.',

  security:
    'Confidentialité & sécurité',

  securityDescription:
    'Contrôle la sécurité de ton compte.',

  password:
    'Mot de passe',

  passwordDescription:
    'Modifie ton mot de passe de connexion.',

  manage:
    'Gérer',

  data:
    'Données',

  dataDescription:
    'Gestion des données associées à ton compte.',

  exportData:
    'Exporter mes données',

  exportDataDescription:
    'Télécharge une copie des données liées à ton compte.',

  soon:
    'Bientôt',

  about:
    'À propos',

  platformDescription:
    'Plateforme de coordination des actions solidaires.',

  terms:
    "Conditions d'utilisation",

  termsDescription:
    'Consulte les conditions d’utilisation de PULSE.',

  privacy:
    'Politique de confidentialité',

  privacyDescription:
    'Consulte la politique de confidentialité de PULSE.',

  support:
    'Aide & support',

  supportDescription:
    'Un espace d’assistance sera disponible ici.',

  session:
    'Session',

  sessionDescription:
    'Gestion de ta connexion à PULSE.',

  logout:
    'Déconnexion',

  dangerZone:
    'Zone sensible',

  deleteAccount:
    'Suppression du compte',

  deleteIrreversible:
    'La suppression de ton compte est définitive et ne peut pas être annulée.',

  deleteMyAccount:
    'Supprimer mon compte PULSE',

  deletePersonalDescription:
    'Ton compte et tes informations personnelles seront supprimés. Les points et interventions déjà créés seront conservés sans être rattachés à ton compte.',

  associationNotDeleted:
    'Ton association ne sera pas supprimée automatiquement. La suppression du compte et la suppression d’une association sont deux actions différentes.',

  deleteButton:
    'Supprimer mon compte',

  version:
    'Version 1.0',

  editAccountTitle:
    'Modifier mon compte',

  editAccountDescription:
    'Mets à jour les informations de ton compte.',

  accountName:
    'Nom du compte',

  name:
    'Nom',

  emailAddress:
    'Adresse e-mail',

  roleCannotChange:
    'Le rôle ne peut pas être modifié depuis ton compte.',

  save:
    'Enregistrer',

  saving:
    'Enregistrement...',

  close:
    'Fermer',

  passwordModalTitle:
    'Modifier mon mot de passe',

  passwordModalDescription:
    'Choisis un nouveau mot de passe sécurisé.',

  pulseSecurity:
    'Sécurité PULSE',

  passwordRules:
    'Minimum 15 caractères, avec au moins une majuscule, une minuscule et un chiffre.',

  newPassword:
    'Nouveau mot de passe',

  confirmPassword:
    'Confirmer le mot de passe',

  confirmPasswordPlaceholder:
    'Confirme ton mot de passe',

  modifying:
    'Modification...',

  modifyPassword:
    'Modifier le mot de passe',

  associationModalTitle:
    'Modifier mon association',

  associationModalDescription:
    'Mets à jour les informations publiques de ton association.',

  associationName:
    "Nom de l'association",

  phone:
    'Téléphone',

  city:
    'Ville',

  actionZone:
    "Zone d'action",

  mainAidType:
    "Type d'aide principale",

  description:
    'Description',

  associationDescriptionPlaceholder:
    'Présente ton association...',

  deleteModalTitle:
    'Supprimer mon compte',

  deleteModalDescription:
    'Cette action est définitive.',

  warningIrreversible:
    'Attention, cette action est irréversible.',

  cannotLoginAfterDelete:
    'Une fois ton compte supprimé, tu ne pourras plus te connecter à PULSE avec ce compte.',

  whatWillHappen:
    'Que va-t-il se passer ?',

  accountPermanentlyDeleted:
    'Ton compte PULSE sera définitivement supprimé.',

  personalDataDeleted:
    'Ton profil et tes informations personnelles associées au compte seront supprimés.',

  historyKept:
    'Les points et interventions déjà enregistrés resteront dans PULSE afin de conserver l’historique des actions.',

  associationKept:
    'Ton association ne sera pas supprimée automatiquement.',

  confirmationBefore:
    'Pour confirmer, écris',

  exactWord:
    'Le mot doit être écrit exactement comme indiqué.',

  deleting:
    'Suppression en cours...',

  deleteForever:
    'Supprimer définitivement mon compte',

  cancel:
    'Annuler',

  profileNameRequired:
    'Le nom ne peut pas être vide.',

  profileEmailRequired:
    "L'adresse e-mail ne peut pas être vide.",

  invalidEmail:
    "L'adresse e-mail n'est pas valide.",

  profileUpdated:
    'Tes informations ont bien été modifiées.',

  profileUpdatedEmail:
    "Informations enregistrées. Si la confirmation d'e-mail est activée, vérifie ta nouvelle adresse.",

  profileUpdateError:
    'Impossible de modifier tes informations.',

  passwordRequired:
    'Renseigne ton nouveau mot de passe.',

  passwordMin:
    'Le mot de passe doit contenir au moins 15 caractères.',

  passwordUpper:
    'Le mot de passe doit contenir au moins une majuscule.',

  passwordLower:
    'Le mot de passe doit contenir au moins une minuscule.',

  passwordNumber:
    'Le mot de passe doit contenir au moins un chiffre.',

  passwordMismatch:
    'Les deux mots de passe ne correspondent pas.',

  passwordUpdated:
    'Ton mot de passe a bien été modifié.',

  passwordUpdateError:
    'Impossible de modifier le mot de passe.',

  associationNameRequired:
    "Le nom de l'association est obligatoire.",

  associationUpdated:
    "Les informations de l'association ont bien été modifiées.",

  associationUpdateError:
    "Impossible de modifier l'association.",

  deleteConfirmationError:
    'Écris exactement SUPPRIMER pour confirmer.',

  deleteError:
    'Impossible de supprimer ton compte. Réessaie dans quelques instants.',
}

/* =========================================================
   TRADUCTIONS EN
========================================================= */

const EN = {
  loadingSettings:
    'Loading settings...',

  loadSettingsError:
    'Unable to load settings.',

  settings:
    'Settings',

  settingsSubtitle:
    'Manage your account, information, security and preferences.',

  account:
    'Account',

  accountDescription:
    'Information related to your PULSE account.',

  accountInfo:
    'Account information',

  nameNotProvided:
    'Name not provided',

  emailNotProvided:
    'Email not provided',

  edit:
    'Edit',

  role:
    'Role',

  roles: {
    citoyen:
      'Citizen',

    benevole:
      'Volunteer',

    association:
      'Organization',

    moderateur:
      'Moderator',

    admin:
      'Administrator',
  },

  loading:
    'Loading...',

  myAssociation:
    'My organization',

  associationPublicInfo:
    'Name and public information of your organization.',

  viewProfile:
    'View my profile',

  viewProfileDescription:
    'View your role, status and permissions.',

  view:
    'View',

  notifications:
    'Notifications',

  notificationsDescription:
    'Choose the information you want to receive.',

  planning:
    'Planning',

  planningDescription:
    'Changes and newly scheduled actions.',

  interventions:
    'Interventions',

  interventionsDescription:
    'New interventions and important updates.',

  volunteerRequests:
    'Volunteer requests',

  volunteerRequestsDescription:
    'New requests to join your organization.',

  pulseNews:
    'PULSE news',

  pulseNewsDescription:
    'New features and important information.',

  appearance:
    'Appearance',

  appearanceDescription:
    'Customize how PULSE looks.',

  light:
    'Light',

  dark:
    'Dark',

  system:
    'System',

  compact:
    'Compact display',

  compactDescription:
    'Reduce spacing between elements to display more information.',

  preferences:
    'Preferences',

  preferencesDescription:
    'Configure your PULSE experience.',

  language:
    'Language',

  languageDescription:
    'Language used in the application.',

  security:
    'Privacy & security',

  securityDescription:
    'Manage your account security.',

  password:
    'Password',

  passwordDescription:
    'Change your login password.',

  manage:
    'Manage',

  data:
    'Data',

  dataDescription:
    'Manage data associated with your account.',

  exportData:
    'Export my data',

  exportDataDescription:
    'Download a copy of the data associated with your account.',

  soon:
    'Coming soon',

  about:
    'About',

  platformDescription:
    'Platform for coordinating solidarity actions.',

  terms:
    'Terms of use',

  termsDescription:
    'Read the PULSE terms of use.',

  privacy:
    'Privacy policy',

  privacyDescription:
    'Read the PULSE privacy policy.',

  support:
    'Help & support',

  supportDescription:
    'A support area will be available here.',

  session:
    'Session',

  sessionDescription:
    'Manage your PULSE login session.',

  logout:
    'Log out',

  dangerZone:
    'Danger zone',

  deleteAccount:
    'Delete account',

  deleteIrreversible:
    'Deleting your account is permanent and cannot be undone.',

  deleteMyAccount:
    'Delete my PULSE account',

  deletePersonalDescription:
    'Your account and personal information will be deleted. Points and interventions you already created will be kept without being linked to your account.',

  associationNotDeleted:
    'Your organization will not be deleted automatically. Deleting an account and deleting an organization are two separate actions.',

  deleteButton:
    'Delete my account',

  version:
    'Version 1.0',

  editAccountTitle:
    'Edit my account',

  editAccountDescription:
    'Update your account information.',

  accountName:
    'Account name',

  name:
    'Name',

  emailAddress:
    'Email address',

  roleCannotChange:
    'Your role cannot be changed from your account.',

  save:
    'Save',

  saving:
    'Saving...',

  close:
    'Close',

  passwordModalTitle:
    'Change my password',

  passwordModalDescription:
    'Choose a new secure password.',

  pulseSecurity:
    'PULSE security',

  passwordRules:
    'At least 15 characters, including one uppercase letter, one lowercase letter and one number.',

  newPassword:
    'New password',

  confirmPassword:
    'Confirm password',

  confirmPasswordPlaceholder:
    'Confirm your password',

  modifying:
    'Updating...',

  modifyPassword:
    'Change password',

  associationModalTitle:
    'Edit my organization',

  associationModalDescription:
    'Update your organization’s public information.',

  associationName:
    'Organization name',

  phone:
    'Phone',

  city:
    'City',

  actionZone:
    'Action area',

  mainAidType:
    'Main type of aid',

  description:
    'Description',

  associationDescriptionPlaceholder:
    'Introduce your organization...',

  deleteModalTitle:
    'Delete my account',

  deleteModalDescription:
    'This action is permanent.',

  warningIrreversible:
    'Warning, this action cannot be undone.',

  cannotLoginAfterDelete:
    'Once your account has been deleted, you will no longer be able to sign in to PULSE with this account.',

  whatWillHappen:
    'What will happen?',

  accountPermanentlyDeleted:
    'Your PULSE account will be permanently deleted.',

  personalDataDeleted:
    'Your profile and personal information associated with the account will be deleted.',

  historyKept:
    'Existing points and interventions will remain in PULSE to preserve the history of actions.',

  associationKept:
    'Your organization will not be deleted automatically.',

  confirmationBefore:
    'To confirm, type',

  exactWord:
    'The word must be entered exactly as shown.',

  deleting:
    'Deleting...',

  deleteForever:
    'Permanently delete my account',

  cancel:
    'Cancel',

  profileNameRequired:
    'The name cannot be empty.',

  profileEmailRequired:
    'The email address cannot be empty.',

  invalidEmail:
    'The email address is not valid.',

  profileUpdated:
    'Your information has been updated.',

  profileUpdatedEmail:
    'Information saved. If email confirmation is enabled, check your new email address.',

  profileUpdateError:
    'Unable to update your information.',

  passwordRequired:
    'Enter your new password.',

  passwordMin:
    'The password must contain at least 15 characters.',

  passwordUpper:
    'The password must contain at least one uppercase letter.',

  passwordLower:
    'The password must contain at least one lowercase letter.',

  passwordNumber:
    'The password must contain at least one number.',

  passwordMismatch:
    'The two passwords do not match.',

  passwordUpdated:
    'Your password has been updated.',

  passwordUpdateError:
    'Unable to update the password.',

  associationNameRequired:
    'The organization name is required.',

  associationUpdated:
    'The organization information has been updated.',

  associationUpdateError:
    'Unable to update the organization.',

  deleteConfirmationError:
    'Type SUPPRIMER exactly to confirm.',

  deleteError:
    'Unable to delete your account. Please try again in a few moments.',
}

/* =========================================================
   TRADUCTIONS ES
========================================================= */

const ES = {
  loadingSettings:
    'Cargando ajustes...',

  loadSettingsError:
    'No se pueden cargar los ajustes.',

  settings:
    'Ajustes',

  settingsSubtitle:
    'Gestiona tu cuenta, información, seguridad y preferencias.',

  account:
    'Cuenta',

  accountDescription:
    'Información relacionada con tu cuenta PULSE.',

  accountInfo:
    'Información de la cuenta',

  nameNotProvided:
    'Nombre no indicado',

  emailNotProvided:
    'Correo no indicado',

  edit:
    'Modificar',

  role:
    'Rol',

  roles: {
    citoyen:
      'Ciudadano',

    benevole:
      'Voluntario',

    association:
      'Asociación',

    moderateur:
      'Moderador',

    admin:
      'Administrador',
  },

  loading:
    'Cargando...',

  myAssociation:
    'Mi asociación',

  associationPublicInfo:
    'Nombre e información pública de tu asociación.',

  viewProfile:
    'Ver mi perfil',

  viewProfileDescription:
    'Consulta tu rol, estado y permisos.',

  view:
    'Ver',

  notifications:
    'Notificaciones',

  notificationsDescription:
    'Elige la información que deseas recibir.',

  planning:
    'Planificación',

  planningDescription:
    'Cambios y nuevas acciones planificadas.',

  interventions:
    'Intervenciones',

  interventionsDescription:
    'Nuevas intervenciones y cambios importantes.',

  volunteerRequests:
    'Solicitudes de voluntarios',

  volunteerRequestsDescription:
    'Nuevas solicitudes para unirse a tu asociación.',

  pulseNews:
    'Noticias PULSE',

  pulseNewsDescription:
    'Nuevas funciones e información importante.',

  appearance:
    'Apariencia',

  appearanceDescription:
    'Personaliza la apariencia de PULSE.',

  light:
    'Claro',

  dark:
    'Oscuro',

  system:
    'Sistema',

  compact:
    'Vista compacta',

  compactDescription:
    'Reduce el espacio entre los elementos para mostrar más información.',

  preferences:
    'Preferencias',

  preferencesDescription:
    'Configura tu experiencia PULSE.',

  language:
    'Idioma',

  languageDescription:
    'Idioma utilizado en la aplicación.',

  security:
    'Privacidad y seguridad',

  securityDescription:
    'Controla la seguridad de tu cuenta.',

  password:
    'Contraseña',

  passwordDescription:
    'Modifica tu contraseña de acceso.',

  manage:
    'Gestionar',

  data:
    'Datos',

  dataDescription:
    'Gestión de los datos asociados a tu cuenta.',

  exportData:
    'Exportar mis datos',

  exportDataDescription:
    'Descarga una copia de los datos relacionados con tu cuenta.',

  soon:
    'Próximamente',

  about:
    'Acerca de',

  platformDescription:
    'Plataforma de coordinación de acciones solidarias.',

  terms:
    'Condiciones de uso',

  termsDescription:
    'Consulta las condiciones de uso de PULSE.',

  privacy:
    'Política de privacidad',

  privacyDescription:
    'Consulta la política de privacidad de PULSE.',

  support:
    'Ayuda y soporte',

  supportDescription:
    'Aquí estará disponible un espacio de asistencia.',

  session:
    'Sesión',

  sessionDescription:
    'Gestiona tu conexión a PULSE.',

  logout:
    'Cerrar sesión',

  dangerZone:
    'Zona sensible',

  deleteAccount:
    'Eliminar cuenta',

  deleteIrreversible:
    'La eliminación de tu cuenta es definitiva y no se puede cancelar.',

  deleteMyAccount:
    'Eliminar mi cuenta PULSE',

  deletePersonalDescription:
    'Tu cuenta y tus datos personales serán eliminados. Los puntos e intervenciones ya creados se conservarán sin estar vinculados a tu cuenta.',

  associationNotDeleted:
    'Tu asociación no se eliminará automáticamente. Eliminar una cuenta y eliminar una asociación son dos acciones diferentes.',

  deleteButton:
    'Eliminar mi cuenta',

  version:
    'Versión 1.0',

  editAccountTitle:
    'Modificar mi cuenta',

  editAccountDescription:
    'Actualiza la información de tu cuenta.',

  accountName:
    'Nombre de la cuenta',

  name:
    'Nombre',

  emailAddress:
    'Correo electrónico',

  roleCannotChange:
    'El rol no se puede modificar desde tu cuenta.',

  save:
    'Guardar',

  saving:
    'Guardando...',

  close:
    'Cerrar',

  passwordModalTitle:
    'Modificar mi contraseña',

  passwordModalDescription:
    'Elige una nueva contraseña segura.',

  pulseSecurity:
    'Seguridad PULSE',

  passwordRules:
    'Mínimo 15 caracteres, con al menos una mayúscula, una minúscula y un número.',

  newPassword:
    'Nueva contraseña',

  confirmPassword:
    'Confirmar contraseña',

  confirmPasswordPlaceholder:
    'Confirma tu contraseña',

  modifying:
    'Modificando...',

  modifyPassword:
    'Modificar contraseña',

  associationModalTitle:
    'Modificar mi asociación',

  associationModalDescription:
    'Actualiza la información pública de tu asociación.',

  associationName:
    'Nombre de la asociación',

  phone:
    'Teléfono',

  city:
    'Ciudad',

  actionZone:
    'Zona de acción',

  mainAidType:
    'Tipo de ayuda principal',

  description:
    'Descripción',

  associationDescriptionPlaceholder:
    'Presenta tu asociación...',

  deleteModalTitle:
    'Eliminar mi cuenta',

  deleteModalDescription:
    'Esta acción es definitiva.',

  warningIrreversible:
    'Atención, esta acción es irreversible.',

  cannotLoginAfterDelete:
    'Una vez eliminada tu cuenta, ya no podrás iniciar sesión en PULSE con ella.',

  whatWillHappen:
    '¿Qué ocurrirá?',

  accountPermanentlyDeleted:
    'Tu cuenta PULSE será eliminada definitivamente.',

  personalDataDeleted:
    'Tu perfil y los datos personales asociados a la cuenta serán eliminados.',

  historyKept:
    'Los puntos e intervenciones existentes permanecerán en PULSE para conservar el historial de las acciones.',

  associationKept:
    'Tu asociación no se eliminará automáticamente.',

  confirmationBefore:
    'Para confirmar, escribe',

  exactWord:
    'La palabra debe escribirse exactamente como se indica.',

  deleting:
    'Eliminando...',

  deleteForever:
    'Eliminar definitivamente mi cuenta',

  cancel:
    'Cancelar',

  profileNameRequired:
    'El nombre no puede estar vacío.',

  profileEmailRequired:
    'El correo electrónico no puede estar vacío.',

  invalidEmail:
    'El correo electrónico no es válido.',

  profileUpdated:
    'Tu información se ha actualizado correctamente.',

  profileUpdatedEmail:
    'Información guardada. Si la confirmación por correo está activada, revisa tu nueva dirección.',

  profileUpdateError:
    'No se puede modificar tu información.',

  passwordRequired:
    'Introduce tu nueva contraseña.',

  passwordMin:
    'La contraseña debe contener al menos 15 caracteres.',

  passwordUpper:
    'La contraseña debe contener al menos una mayúscula.',

  passwordLower:
    'La contraseña debe contener al menos una minúscula.',

  passwordNumber:
    'La contraseña debe contener al menos un número.',

  passwordMismatch:
    'Las dos contraseñas no coinciden.',

  passwordUpdated:
    'Tu contraseña se ha modificado correctamente.',

  passwordUpdateError:
    'No se puede modificar la contraseña.',

  associationNameRequired:
    'El nombre de la asociación es obligatorio.',

  associationUpdated:
    'La información de la asociación se ha actualizado.',

  associationUpdateError:
    'No se puede modificar la asociación.',

  deleteConfirmationError:
    'Escribe exactamente SUPPRIMER para confirmar.',

  deleteError:
    'No se puede eliminar tu cuenta. Inténtalo de nuevo en unos instantes.',
}

/* =========================================================
   LANGUES
========================================================= */

const COPY = {
  fr: FR,
  en: EN,
  es: ES,
}

function getCopy(
  language: AppLanguage
) {
  if (language === 'en') {
    return EN
  }

  if (language === 'es') {
    return ES
  }

  return FR
}

function getInitialLanguage(): AppLanguage {
  const savedLanguage =
    getLanguage()

  if (savedLanguage === 'ar') {
    setAppLanguage('fr')

    localStorage.setItem(
      'pulse-language',
      'fr'
    )

    return 'fr'
  }

  return savedLanguage
}

function getStoredNotifications(): NotificationPreferences {
  try {
    const value =
      localStorage.getItem(
        'pulse-notification-preferences'
      )

    if (!value) {
      return DEFAULT_NOTIFICATIONS
    }

    return {
      ...DEFAULT_NOTIFICATIONS,
      ...JSON.parse(value),
    }
  } catch {
    return DEFAULT_NOTIFICATIONS
  }
}

/* =========================================================
   COMPOSANTS
========================================================= */

function SettingToggle({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() =>
        onChange(!enabled)
      }
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        enabled
          ? 'bg-[#d94a0b]'
          : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
          enabled
            ? 'left-6'
            : 'left-1'
        }`}
      />
    </button>
  )
}

function SectionTitle({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-black text-slate-950 dark:text-slate-50 sm:text-2xl">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  )
}

function SettingsSection({
  children,
}: {
  children: ReactNode
}) {
  return (
    <section className="border-b border-slate-200 bg-transparent py-6 dark:border-slate-800">
      {children}
    </section>
  )
}

function SettingRow({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex min-h-[76px] items-center gap-4 border-b border-slate-200 py-4 last:border-b-0 dark:border-slate-800">
      <div className="min-w-0 flex-1">
        <p className="font-black text-slate-950 dark:text-slate-50">
          {title}
        </p>

        {description && (
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}

function ActionButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-black text-[#d94a0b] transition hover:text-[#b93607] dark:text-orange-400 dark:hover:text-orange-300"
    >
      {children}
    </button>
  )
}

function Modal({
  title,
  description,
  closeLabel,
  onClose,
  children,
}: {
  title: string
  description?: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 max-h-[92dvh] w-full overflow-y-auto bg-white shadow-2xl dark:bg-slate-900 sm:max-w-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div>
            <h2 className="text-xl font-black text-slate-950 dark:text-slate-50 sm:text-2xl">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center text-2xl font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="min-h-12 w-full border border-slate-300 bg-transparent px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800"
      />
    </div>
  )
}

/* =========================================================
   PAGE
========================================================= */

export default function SettingsPage() {
  const navigate =
    useNavigate()

  const queryClient =
    useQueryClient()

  const [
    language,
    setLanguage,
  ] =
    useState<AppLanguage>(
      getInitialLanguage
    )

  const copy =
    getCopy(language)

  /* =========================================================
     PROFIL
  ========================================================= */

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      'current-profile',
    ],

    queryFn:
      getCurrentProfile,

    retry:
      false,
  })

  const associationId =
    profile?.association_id ??
    null

  /* =========================================================
     ASSOCIATION
  ========================================================= */

  const {
    data: association,
    isLoading:
      associationLoading,
  } = useQuery({
    queryKey: [
      'profile-association-settings',
      associationId,
    ],

    queryFn:
      async (): Promise<AssociationSettings | null> => {
        if (!associationId) {
          return null
        }

        const {
          data,
          error,
        } =
          await supabase
            .from(
              'associations'
            )
            .select(`
              id,
              nom,
              description,
              email,
              telephone,
              ville,
              zone_action,
              type_aide_principale
            `)
            .eq(
              'id',
              associationId
            )
            .maybeSingle()

        if (error) {
          throw error
        }

        return data
      },

    enabled:
      Boolean(
        associationId
      ),
  })

  /* =========================================================
     ÉTATS GÉNÉRAUX
  ========================================================= */

  const [
    activeModal,
    setActiveModal,
  ] =
    useState<ActiveModal>(
      null
    )

  const [
    theme,
    setTheme,
  ] =
    useState<ThemePreference>(
      () =>
        getThemePreference()
    )

  const [
    notifications,
    setNotifications,
  ] =
    useState<NotificationPreferences>(
      getStoredNotifications
    )

  const [
    compactMode,
    setCompactMode,
  ] =
    useState(
      () =>
        localStorage.getItem(
          'pulse-compact-mode'
        ) === 'true'
    )

  /* =========================================================
     MODIFICATION PROFIL
  ========================================================= */

  const [
    profileName,
    setProfileName,
  ] =
    useState('')

  const [
    profileEmail,
    setProfileEmail,
  ] =
    useState('')

  const [
    profileSaving,
    setProfileSaving,
  ] =
    useState(false)

  const [
    profileError,
    setProfileError,
  ] =
    useState<
      string | null
    >(null)

  const [
    profileSuccess,
    setProfileSuccess,
  ] =
    useState<
      string | null
    >(null)

  /* =========================================================
     MOT DE PASSE
  ========================================================= */

  const [
    newPassword,
    setNewPassword,
  ] =
    useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState('')

  const [
    passwordSaving,
    setPasswordSaving,
  ] =
    useState(false)

  const [
    passwordError,
    setPasswordError,
  ] =
    useState<
      string | null
    >(null)

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] =
    useState<
      string | null
    >(null)

  /* =========================================================
     MODIFICATION ASSOCIATION
  ========================================================= */

  const [
    associationName,
    setAssociationName,
  ] =
    useState('')

  const [
    associationEmail,
    setAssociationEmail,
  ] =
    useState('')

  const [
    associationPhone,
    setAssociationPhone,
  ] =
    useState('')

  const [
    associationCity,
    setAssociationCity,
  ] =
    useState('')

  const [
    associationZone,
    setAssociationZone,
  ] =
    useState('')

  const [
    associationAidType,
    setAssociationAidType,
  ] =
    useState('')

  const [
    associationDescription,
    setAssociationDescription,
  ] =
    useState('')

  const [
    associationSaving,
    setAssociationSaving,
  ] =
    useState(false)

  const [
    associationError,
    setAssociationError,
  ] =
    useState<
      string | null
    >(null)

  const [
    associationSuccess,
    setAssociationSuccess,
  ] =
    useState<
      string | null
    >(null)

  /* =========================================================
     SUPPRESSION
  ========================================================= */

  const [
    deleteConfirmation,
    setDeleteConfirmation,
  ] =
    useState('')

  const [
    deleteAccountLoading,
    setDeleteAccountLoading,
  ] =
    useState(false)

  const [
    deleteAccountError,
    setDeleteAccountError,
  ] =
    useState<
      string | null
    >(null)

  /* =========================================================
     INITIALISATION PROFIL
  ========================================================= */

  useEffect(() => {
    if (!profile) {
      return
    }

    setProfileName(
      profile.nom ?? ''
    )

    setProfileEmail(
      profile.email ?? ''
    )
  }, [profile])

  /* =========================================================
     INITIALISATION ASSOCIATION
  ========================================================= */

  useEffect(() => {
    if (!association) {
      return
    }

    setAssociationName(
      association.nom ?? ''
    )

    setAssociationEmail(
      association.email ??
        ''
    )

    setAssociationPhone(
      association.telephone ??
        ''
    )

    setAssociationCity(
      association.ville ??
        ''
    )

    setAssociationZone(
      association.zone_action ??
        ''
    )

    setAssociationAidType(
      association.type_aide_principale ??
        ''
    )

    setAssociationDescription(
      association.description ??
        ''
    )
  }, [association])

  /* =========================================================
     LANGUE
  ========================================================= */

  useEffect(() => {
    document.documentElement.lang =
      language

    // L'arabe étant désactivé,
    // l'application reste en LTR.
    document.documentElement.dir =
      'ltr'
  }, [language])

  /* =========================================================
     MODE COMPACT
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      'pulse-compact-mode',
      String(compactMode)
    )

    document
      .documentElement
      .classList
      .toggle(
        'compact',
        compactMode
      )
  }, [compactMode])

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      'pulse-notification-preferences',
      JSON.stringify(
        notifications
      )
    )
  }, [notifications])

  /* =========================================================
     CHANGEMENT LANGUE
  ========================================================= */

  function handleLanguageChange(
    nextLanguage:
      AppLanguage
  ) {
    if (
      nextLanguage ===
      'ar'
    ) {
      return
    }

    setLanguage(
      nextLanguage
    )

    setAppLanguage(
      nextLanguage
    )

    localStorage.setItem(
      'pulse-language',
      nextLanguage
    )

    document.documentElement.lang =
      nextLanguage

    document.documentElement.dir =
      'ltr'
  }

  /* =========================================================
     CHANGEMENT THÈME
  ========================================================= */

  function handleThemeChange(
    nextTheme:
      ThemePreference
  ) {
    setTheme(
      nextTheme
    )

    setThemePreference(
      nextTheme
    )
  }

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  function updateNotification(
    key:
      keyof NotificationPreferences,

    value:
      boolean
  ) {
    setNotifications(
      (
        current
      ) => ({
        ...current,
        [key]:
          value,
      })
    )
  }

  /* =========================================================
     OUVERTURE MODALES
  ========================================================= */

  function openProfileModal() {
    if (profile) {
      setProfileName(
        profile.nom ?? ''
      )

      setProfileEmail(
        profile.email ?? ''
      )
    }

    setProfileError(
      null
    )

    setProfileSuccess(
      null
    )

    setActiveModal(
      'profile'
    )
  }

  function openPasswordModal() {
    setNewPassword(
      ''
    )

    setConfirmPassword(
      ''
    )

    setPasswordError(
      null
    )

    setPasswordSuccess(
      null
    )

    setActiveModal(
      'password'
    )
  }

  function openAssociationModal() {
    if (association) {
      setAssociationName(
        association.nom ??
          ''
      )

      setAssociationEmail(
        association.email ??
          ''
      )

      setAssociationPhone(
        association.telephone ??
          ''
      )

      setAssociationCity(
        association.ville ??
          ''
      )

      setAssociationZone(
        association.zone_action ??
          ''
      )

      setAssociationAidType(
        association.type_aide_principale ??
          ''
      )

      setAssociationDescription(
        association.description ??
          ''
      )
    }

    setAssociationError(
      null
    )

    setAssociationSuccess(
      null
    )

    setActiveModal(
      'association'
    )
  }

  function openDeleteAccountModal() {
    setDeleteConfirmation(
      ''
    )

    setDeleteAccountError(
      null
    )

    setActiveModal(
      'delete-account'
    )
  }

  /* =========================================================
     ENREGISTRER PROFIL
  ========================================================= */

  async function handleSaveProfile() {
    if (!profile) {
      return
    }

    setProfileError(
      null
    )

    setProfileSuccess(
      null
    )

    const cleanName =
      profileName.trim()

    const cleanEmail =
      profileEmail
        .trim()
        .toLowerCase()

    if (!cleanName) {
      setProfileError(
        copy
          .profileNameRequired
      )

      return
    }

    if (!cleanEmail) {
      setProfileError(
        copy
          .profileEmailRequired
      )

      return
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      setProfileError(
        copy.invalidEmail
      )

      return
    }

    try {
      setProfileSaving(
        true
      )

      const emailChanged =
        cleanEmail !==
        (
          profile.email ??
          ''
        ).toLowerCase()

      const authPayload: {
        email?: string

        data?: {
          nom: string
        }
      } = {
        data: {
          nom:
            cleanName,
        },
      }

      if (emailChanged) {
        authPayload.email =
          cleanEmail
      }

      const {
        error:
          authError,
      } =
        await supabase
          .auth
          .updateUser(
            authPayload
          )

      if (authError) {
        throw authError
      }

      const {
        error:
          profileUpdateError,
      } =
        await supabase
          .from(
            'profiles'
          )
          .update({
            nom:
              cleanName,

            email:
              cleanEmail,

            updated_at:
              new Date()
                .toISOString(),
          })
          .eq(
            'id',
            profile.id
          )

      if (
        profileUpdateError
      ) {
        throw profileUpdateError
      }

      await queryClient
        .invalidateQueries({
          queryKey: [
            'current-profile',
          ],
        })

      setProfileSuccess(
        emailChanged
          ? copy
              .profileUpdatedEmail
          : copy
              .profileUpdated
      )
    } catch (
      error
    ) {
      setProfileError(
        error instanceof Error
          ? error.message
          : copy
              .profileUpdateError
      )
    } finally {
      setProfileSaving(
        false
      )
    }
  }

  /* =========================================================
     ENREGISTRER MOT DE PASSE
  ========================================================= */

  async function handleSavePassword() {
    setPasswordError(
      null
    )

    setPasswordSuccess(
      null
    )

    if (!newPassword) {
      setPasswordError(
        copy.passwordRequired
      )

      return
    }

    if (
      newPassword.length <
      15
    ) {
      setPasswordError(
        copy.passwordMin
      )

      return
    }

    if (
      !/[A-Z]/.test(
        newPassword
      )
    ) {
      setPasswordError(
        copy.passwordUpper
      )

      return
    }

    if (
      !/[a-z]/.test(
        newPassword
      )
    ) {
      setPasswordError(
        copy.passwordLower
      )

      return
    }

    if (
      !/[0-9]/.test(
        newPassword
      )
    ) {
      setPasswordError(
        copy.passwordNumber
      )

      return
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setPasswordError(
        copy.passwordMismatch
      )

      return
    }

    try {
      setPasswordSaving(
        true
      )

      const {
        error,
      } =
        await supabase
          .auth
          .updateUser({
            password:
              newPassword,
          })

      if (error) {
        throw error
      }

      setNewPassword(
        ''
      )

      setConfirmPassword(
        ''
      )

      setPasswordSuccess(
        copy.passwordUpdated
      )
    } catch (
      error
    ) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : copy
              .passwordUpdateError
      )
    } finally {
      setPasswordSaving(
        false
      )
    }
  }

  /* =========================================================
     ENREGISTRER ASSOCIATION
  ========================================================= */

  async function handleSaveAssociation() {
    if (!association) {
      return
    }

    setAssociationError(
      null
    )

    setAssociationSuccess(
      null
    )

    if (
      !associationName.trim()
    ) {
      setAssociationError(
        copy
          .associationNameRequired
      )

      return
    }

    try {
      setAssociationSaving(
        true
      )

      const {
        error,
      } =
        await supabase
          .from(
            'associations'
          )
          .update({
            nom:
              associationName
                .trim(),

            email:
              associationEmail
                .trim() ||
              null,

            telephone:
              associationPhone
                .trim() ||
              null,

            ville:
              associationCity
                .trim() ||
              null,

            zone_action:
              associationZone
                .trim() ||
              null,

            type_aide_principale:
              associationAidType
                .trim() ||
              null,

            description:
              associationDescription
                .trim() ||
              null,

            updated_at:
              new Date()
                .toISOString(),
          })
          .eq(
            'id',
            association.id
          )

      if (error) {
        throw error
      }

      await queryClient
        .invalidateQueries({
          queryKey: [
            'profile-association-settings',
            associationId,
          ],
        })

      await queryClient
        .invalidateQueries({
          queryKey: [
            'profile-association',
            associationId,
          ],
        })

      await queryClient
        .invalidateQueries({
          queryKey: [
            'interventions',
          ],
        })

      setAssociationSuccess(
        copy.associationUpdated
      )
    } catch (
      error
    ) {
      setAssociationError(
        error instanceof Error
          ? error.message
          : copy
              .associationUpdateError
      )
    } finally {
      setAssociationSaving(
        false
      )
    }
  }

  /* =========================================================
     SUPPRIMER COMPTE
  ========================================================= */

  async function handleDeleteAccount() {
    if (
      deleteConfirmation
        .trim() !==
      'SUPPRIMER'
    ) {
      setDeleteAccountError(
        copy
          .deleteConfirmationError
      )

      return
    }

    setDeleteAccountError(
      null
    )

    try {
      setDeleteAccountLoading(
        true
      )

      const {
        data,
        error:
          functionError,
      } =
        await supabase
          .functions
          .invoke(
            'delete-account',
            {
              body: {
                confirmation:
                  deleteConfirmation
                    .trim(),
              },
            }
          )

      if (
        functionError
      ) {
        throw functionError
      }

      if (
        data &&
        data.success ===
          false
      ) {
        throw new Error(
          data.error ||
            copy.deleteError
        )
      }

      try {
        await supabase
          .auth
          .signOut({
            scope:
              'local',
          })
      } catch {
        // Le compte peut déjà
        // être supprimé côté serveur.
      }

      queryClient.clear()

      localStorage
        .removeItem(
          'pulse-notification-preferences'
        )

      localStorage
        .removeItem(
          'pulse-compact-mode'
        )

      localStorage
        .removeItem(
          'pulse-language'
        )

      navigate(
        '/login',
        {
          replace:
            true,
        }
      )
    } catch (
      error
    ) {
      console.error(
        'Erreur suppression compte :',
        error
      )

      setDeleteAccountError(
        error instanceof Error
          ? error.message
          : copy.deleteError
      )
    } finally {
      setDeleteAccountLoading(
        false
      )
    }
  }

  /* =========================================================
     DÉCONNEXION
  ========================================================= */

  async function handleLogout() {
    await supabase
      .auth
      .signOut()

    queryClient.clear()

    navigate(
      '/login',
      {
        replace:
          true,
      }
    )
  }

  /* =========================================================
     CHARGEMENT
  ========================================================= */

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl border-b border-slate-200 py-8 font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {
            copy.loadingSettings
          }
        </div>
      </div>
    )
  }

  /* =========================================================
     ERREUR
  ========================================================= */

  if (
    isError ||
    !profile
  ) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl border-b border-red-300 py-8 font-semibold text-red-700 dark:border-red-900 dark:text-red-300">
          {
            (
              error as Error
            )?.message ||
            copy
              .loadSettingsError
          }
        </div>
      </div>
    )
  }

  /* =========================================================
     INFORMATIONS CALCULÉES
  ========================================================= */

  const isAssociation =
    profile.role ===
      'association' &&
    Boolean(
      profile.association_id
    )

  const roleLabel =
    copy.roles[
      profile.role as keyof typeof copy.roles
    ] ??
    profile.role

  const availableLanguages =
    LANGUAGE_OPTIONS.filter(
      (
        option
      ) =>
        option.value !==
        'ar'
    )

  /* =========================================================
     RENDU
  ========================================================= */

  return (
    <>
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 pb-32 pt-6 transition-colors duration-200 dark:bg-slate-950 sm:px-6 lg:px-8 lg:pb-12">
        <div className="mx-auto max-w-4xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d94a0b] dark:text-orange-400 sm:text-sm">
              PULSE
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
              {copy.settings}
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              {
                copy.settingsSubtitle
              }
            </p>
          </header>

          <div>

            {/* =================================================
                COMPTE
            ================================================= */}

            <SettingsSection>
              <SectionTitle
                title={
                  copy.account
                }
                description={
                  copy.accountDescription
                }
              />

              <SettingRow
                title={
                  isAssociation
                    ? copy.accountInfo
                    : profile.nom ||
                      copy.nameNotProvided
                }
                description={
                  profile.email ||
                  copy.emailNotProvided
                }
                action={
                  <ActionButton
                    onClick={
                      openProfileModal
                    }
                  >
                    {copy.edit}
                  </ActionButton>
                }
              />

              <SettingRow
                title={
                  copy.role
                }
                description={
                  roleLabel
                }
              />

              {isAssociation && (
                <SettingRow
                  title={
                    associationLoading
                      ? copy.loading
                      : association?.nom ||
                        copy.myAssociation
                  }
                  description={
                    copy.associationPublicInfo
                  }
                  action={
                    <ActionButton
                      onClick={
                        openAssociationModal
                      }
                    >
                      {copy.edit}
                    </ActionButton>
                  }
                />
              )}

              <SettingRow
                title={
                  copy.viewProfile
                }
                description={
                  copy.viewProfileDescription
                }
                action={
                  <Link
                    to="/profile"
                    className="text-sm font-black text-[#d94a0b] transition hover:text-[#b93607] dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    {copy.view}
                  </Link>
                }
              />
            </SettingsSection>

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <SettingsSection>
              <SectionTitle
                title={
                  copy.notifications
                }
                description={
                  copy.notificationsDescription
                }
              />

              <SettingRow
                title={
                  copy.planning
                }
                description={
                  copy.planningDescription
                }
                action={
                  <SettingToggle
                    enabled={
                      notifications.planning
                    }
                    onChange={(
                      value
                    ) =>
                      updateNotification(
                        'planning',
                        value
                      )
                    }
                  />
                }
              />

              <SettingRow
                title={
                  copy.interventions
                }
                description={
                  copy.interventionsDescription
                }
                action={
                  <SettingToggle
                    enabled={
                      notifications.interventions
                    }
                    onChange={(
                      value
                    ) =>
                      updateNotification(
                        'interventions',
                        value
                      )
                    }
                  />
                }
              />

              {profile.role ===
                'association' && (
                <SettingRow
                  title={
                    copy.volunteerRequests
                  }
                  description={
                    copy.volunteerRequestsDescription
                  }
                  action={
                    <SettingToggle
                      enabled={
                        notifications
                          .associationRequests
                      }
                      onChange={(
                        value
                      ) =>
                        updateNotification(
                          'associationRequests',
                          value
                        )
                      }
                    />
                  }
                />
              )}

              <SettingRow
                title={
                  copy.pulseNews
                }
                description={
                  copy.pulseNewsDescription
                }
                action={
                  <SettingToggle
                    enabled={
                      notifications.pulseNews
                    }
                    onChange={(
                      value
                    ) =>
                      updateNotification(
                        'pulseNews',
                        value
                      )
                    }
                  />
                }
              />
            </SettingsSection>

            {/* =================================================
                APPARENCE
            ================================================= */}

            <SettingsSection>
              <SectionTitle
                title={
                  copy.appearance
                }
                description={
                  copy.appearanceDescription
                }
              />

              <div className="grid grid-cols-3 border border-slate-200 dark:border-slate-800">
                {[
                  {
                    value:
                      'light',

                    label:
                      copy.light,

                    icon:
                      '☀️',
                  },

                  {
                    value:
                      'dark',

                    label:
                      copy.dark,

                    icon:
                      '🌙',
                  },

                  {
                    value:
                      'system',

                    label:
                      copy.system,

                    icon:
                      '💻',
                  },
                ].map(
                  (
                    option,
                    index
                  ) => {
                    const active =
                      theme ===
                      option.value

                    return (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() =>
                          handleThemeChange(
                            option.value as ThemePreference
                          )
                        }
                        className={`p-4 text-center transition ${
                          index !==
                          0
                            ? 'border-l border-slate-200 dark:border-slate-800'
                            : ''
                        } ${
                          active
                            ? 'bg-[#d94a0b] text-white'
                            : 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className="text-2xl">
                          {
                            option.icon
                          }
                        </div>

                        <p className="mt-2 text-xs font-black sm:text-sm">
                          {
                            option.label
                          }
                        </p>
                      </button>
                    )
                  }
                )}
              </div>

              <div className="mt-4">
                <SettingRow
                  title={
                    copy.compact
                  }
                  description={
                    copy.compactDescription
                  }
                  action={
                    <SettingToggle
                      enabled={
                        compactMode
                      }
                      onChange={
                        setCompactMode
                      }
                    />
                  }
                />
              </div>
            </SettingsSection>

            {/* =================================================
                PRÉFÉRENCES
            ================================================= */}

            <SettingsSection>
              <SectionTitle
                title={
                  copy.preferences
                }
                description={
                  copy.preferencesDescription
                }
              />

              <SettingRow
                title={
                  copy.language
                }
                description={
                  copy.languageDescription
                }
                action={
                  <select
                    value={
                      language ===
                      'ar'
                        ? 'fr'
                        : language
                    }
                    onChange={(
                      event
                    ) =>
                      handleLanguageChange(
                        event
                          .target
                          .value as AppLanguage
                      )
                    }
                    className="min-h-10 border border-slate-300 bg-transparent px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#d94a0b] dark:border-slate-700 dark:text-slate-200"
                  >
                    {availableLanguages.map(
                      (
                        option
                      ) => (
                        <option
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {
                            option.label
                          }
                        </option>
                      )
                    )}
                  </select>
                }
              />
            </SettingsSection>

            {/* =================================================
                CONFIDENTIALITÉ
            ================================================= */}

            <SettingsSection>
              <SectionTitle
                title={
                  copy.security
                }
                description={
                  copy.securityDescription
                }
              />

              <SettingRow
                title={
                  copy.password
                }
                description={
                  copy.passwordDescription
                }
                action={
                  <ActionButton
                    onClick={
                      openPasswordModal
                    }
                  >
                    {copy.manage}
                  </ActionButton>
                }
              />
            </SettingsSection>

            {/* =================================================
                DONNÉES
            ================================================= */}

            <SettingsSection>
              <SectionTitle
                title={
                  copy.data
                }
                description={
                  copy.dataDescription
                }
              />

              <SettingRow
                title={
                  copy.exportData
                }
                description={
                  copy.exportDataDescription
                }
                action={
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500">
                    {copy.soon}
                  </span>
                }
              />
            </SettingsSection>

            {/* =================================================
                À PROPOS
            ================================================= */}

            <SettingsSection>
              <SectionTitle
                title={
                  copy.about
                }
              />

              <SettingRow
                title="PULSE"
                description={
                  copy.platformDescription
                }
                action={
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500">
                    v1.0
                  </span>
                }
              />

              <SettingRow
                title={
                  copy.terms
                }
                description={
                  copy.termsDescription
                }
                action={
                  <Link
                    to="/conditions-utilisation"
                    aria-label={
                      copy.terms
                    }
                    className="text-lg font-black text-[#d94a0b] transition hover:text-[#b93607] dark:text-orange-400"
                  >
                    →
                  </Link>
                }
              />

              <SettingRow
                title={
                  copy.privacy
                }
                description={
                  copy.privacyDescription
                }
                action={
                  <Link
                    to="/politique-confidentialite"
                    aria-label={
                      copy.privacy
                    }
                    className="text-lg font-black text-[#d94a0b] transition hover:text-[#b93607] dark:text-orange-400"
                  >
                    →
                  </Link>
                }
              />

              <SettingRow
                title={
                  copy.support
                }
                description={
                  copy.supportDescription
                }
                action={
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500">
                    {copy.soon}
                  </span>
                }
              />
            </SettingsSection>

            {/* =================================================
                SESSION
            ================================================= */}

            <SettingsSection>
              <SectionTitle
                title={
                  copy.session
                }
                description={
                  copy.sessionDescription
                }
              />

              <button
                type="button"
                onClick={
                  handleLogout
                }
                className="min-h-12 w-full border border-slate-300 bg-transparent px-5 text-sm font-black text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                {copy.logout}
              </button>
            </SettingsSection>

            {/* =================================================
                ZONE SENSIBLE
            ================================================= */}

            <section className="border-b border-red-300 bg-transparent py-6 dark:border-red-900">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500 dark:text-red-400">
                  {
                    copy.dangerZone
                  }
                </p>

                <h2 className="mt-2 text-xl font-black text-red-700 dark:text-red-300 sm:text-2xl">
                  {
                    copy.deleteAccount
                  }
                </h2>

                <p className="mt-2 text-sm font-semibold leading-relaxed text-red-600/80 dark:text-red-400">
                  {
                    copy.deleteIrreversible
                  }
                </p>
              </div>

              <div className="border-t border-red-200 py-5 dark:border-red-900">
                <p className="font-black text-slate-950 dark:text-slate-50">
                  {
                    copy.deleteMyAccount
                  }
                </p>

                <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
                  {
                    copy.deletePersonalDescription
                  }
                </p>

                {isAssociation && (
                  <p className="mt-3 text-xs font-bold leading-relaxed text-orange-700 dark:text-orange-300">
                    {
                      copy.associationNotDeleted
                    }
                  </p>
                )}

                <button
                  type="button"
                  onClick={
                    openDeleteAccountModal
                  }
                  className="mt-5 min-h-12 w-full bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                >
                  {
                    copy.deleteButton
                  }
                </button>
              </div>
            </section>

            <p className="pb-4 pt-6 text-center text-xs font-bold text-slate-400 dark:text-slate-600">
              PULSE •{' '}
              {copy.version}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          MODAL PROFIL
      ===================================================== */}

      {activeModal ===
        'profile' && (
        <Modal
          title={
            copy.editAccountTitle
          }
          description={
            copy.editAccountDescription
          }
          closeLabel={
            copy.close
          }
          onClose={() =>
            setActiveModal(
              null
            )
          }
        >
          <div className="space-y-5">
            <Field
              label={
                isAssociation
                  ? copy.accountName
                  : copy.name
              }
              value={
                profileName
              }
              onChange={
                setProfileName
              }
              placeholder={
                copy.name
              }
            />

            <Field
              label={
                copy.emailAddress
              }
              type="email"
              value={
                profileEmail
              }
              onChange={
                setProfileEmail
              }
              placeholder="example@email.com"
            />

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
                {copy.role}
              </label>

              <div className="border border-slate-300 bg-transparent px-4 py-3 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                {roleLabel}
              </div>

              <p className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                {
                  copy.roleCannotChange
                }
              </p>
            </div>

            {profileError && (
              <div className="border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
                {
                  profileError
                }
              </div>
            )}

            {profileSuccess && (
              <div className="border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
                {
                  profileSuccess
                }
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={
                  profileSaving
                }
                onClick={
                  handleSaveProfile
                }
                className="min-h-12 flex-1 bg-[#d94a0b] px-5 text-sm font-black text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {profileSaving
                  ? copy.saving
                  : copy.save}
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveModal(
                    null
                  )
                }
                className="min-h-12 border border-slate-300 bg-transparent px-5 text-sm font-black text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {copy.close}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =====================================================
          MODAL MOT DE PASSE
      ===================================================== */}

      {activeModal ===
        'password' && (
        <Modal
          title={
            copy.passwordModalTitle
          }
          description={
            copy.passwordModalDescription
          }
          closeLabel={
            copy.close
          }
          onClose={() =>
            setActiveModal(
              null
            )
          }
        >
          <div className="space-y-5">
            <div className="border-l-4 border-[#d94a0b] py-2 pl-4">
              <p className="text-sm font-black text-orange-800 dark:text-orange-300">
                {
                  copy.pulseSecurity
                }
              </p>

              <p className="mt-1 text-xs font-semibold leading-relaxed text-orange-700 dark:text-orange-400">
                {
                  copy.passwordRules
                }
              </p>
            </div>

            <Field
              label={
                copy.newPassword
              }
              type="password"
              value={
                newPassword
              }
              onChange={
                setNewPassword
              }
              placeholder={
                copy.newPassword
              }
            />

            <Field
              label={
                copy.confirmPassword
              }
              type="password"
              value={
                confirmPassword
              }
              onChange={
                setConfirmPassword
              }
              placeholder={
                copy.confirmPasswordPlaceholder
              }
            />

            {passwordError && (
              <div className="border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
                {
                  passwordError
                }
              </div>
            )}

            {passwordSuccess && (
              <div className="border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
                {
                  passwordSuccess
                }
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={
                  passwordSaving
                }
                onClick={
                  handleSavePassword
                }
                className="min-h-12 flex-1 bg-[#d94a0b] px-5 text-sm font-black text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordSaving
                  ? copy.modifying
                  : copy.modifyPassword}
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveModal(
                    null
                  )
                }
                className="min-h-12 border border-slate-300 bg-transparent px-5 text-sm font-black text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {copy.close}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =====================================================
          MODAL ASSOCIATION
      ===================================================== */}

      {activeModal ===
        'association' &&
        association && (
          <Modal
            title={
              copy.associationModalTitle
            }
            description={
              copy.associationModalDescription
            }
            closeLabel={
              copy.close
            }
            onClose={() =>
              setActiveModal(
                null
              )
            }
          >
            <div className="space-y-5">
              <Field
                label={
                  copy.associationName
                }
                value={
                  associationName
                }
                onChange={
                  setAssociationName
                }
                placeholder={
                  copy.associationName
                }
              />

              <Field
                label={
                  copy.emailAddress
                }
                type="email"
                value={
                  associationEmail
                }
                onChange={
                  setAssociationEmail
                }
                placeholder="contact@association.fr"
              />

              <Field
                label={
                  copy.phone
                }
                type="tel"
                value={
                  associationPhone
                }
                onChange={
                  setAssociationPhone
                }
                placeholder="06..."
              />

              <Field
                label={
                  copy.city
                }
                value={
                  associationCity
                }
                onChange={
                  setAssociationCity
                }
                placeholder={
                  copy.city
                }
              />

              <Field
                label={
                  copy.actionZone
                }
                value={
                  associationZone
                }
                onChange={
                  setAssociationZone
                }
                placeholder="Val-d'Oise"
              />

              <Field
                label={
                  copy.mainAidType
                }
                value={
                  associationAidType
                }
                onChange={
                  setAssociationAidType
                }
                placeholder="Maraudes"
              />

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
                  {
                    copy.description
                  }
                </label>

                <textarea
                  rows={5}
                  value={
                    associationDescription
                  }
                  onChange={(
                    event
                  ) =>
                    setAssociationDescription(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder={
                    copy.associationDescriptionPlaceholder
                  }
                  className="w-full border border-slate-300 bg-transparent px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              {associationError && (
                <div className="border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
                  {
                    associationError
                  }
                </div>
              )}

              {associationSuccess && (
                <div className="border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
                  {
                    associationSuccess
                  }
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={
                    associationSaving
                  }
                  onClick={
                    handleSaveAssociation
                  }
                  className="min-h-12 flex-1 bg-[#d94a0b] px-5 text-sm font-black text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {associationSaving
                    ? copy.saving
                    : copy.save}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveModal(
                      null
                    )
                  }
                  className="min-h-12 border border-slate-300 bg-transparent px-5 text-sm font-black text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {copy.close}
                </button>
              </div>
            </div>
          </Modal>
        )}

      {/* =====================================================
          MODAL SUPPRESSION
      ===================================================== */}

      {activeModal ===
        'delete-account' && (
        <Modal
          title={
            copy.deleteModalTitle
          }
          description={
            copy.deleteModalDescription
          }
          closeLabel={
            copy.close
          }
          onClose={() => {
            if (
              !deleteAccountLoading
            ) {
              setActiveModal(
                null
              )
            }
          }}
        >
          <div className="space-y-5">

            <div className="border-l-4 border-red-600 py-2 pl-4">
              <p className="font-black text-red-800 dark:text-red-300">
                {
                  copy.warningIrreversible
                }
              </p>

              <p className="mt-2 text-sm font-semibold leading-relaxed text-red-700 dark:text-red-400">
                {
                  copy.cannotLoginAfterDelete
                }
              </p>
            </div>

            <div className="border-y border-slate-200 py-5 dark:border-slate-800">
              <p className="text-sm font-black text-slate-950 dark:text-slate-50">
                {
                  copy.whatWillHappen
                }
              </p>

              <div className="mt-4 space-y-4">

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-sm font-black text-red-600 dark:text-red-400">
                    ×
                  </span>

                  <p className="text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                    {
                      copy.accountPermanentlyDeleted
                    }
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-sm font-black text-red-600 dark:text-red-400">
                    ×
                  </span>

                  <p className="text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                    {
                      copy.personalDataDeleted
                    }
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ✓
                  </span>

                  <p className="text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                    {
                      copy.historyKept
                    }
                  </p>
                </div>

                {isAssociation && (
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-sm font-black text-emerald-600 dark:text-emerald-400">
                      ✓
                    </span>

                    <p className="text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                      {
                        copy.associationKept
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-800 dark:text-slate-200">
                {
                  copy.confirmationBefore
                }{' '}
                <span className="text-red-600 dark:text-red-400">
                  SUPPRIMER
                </span>
              </label>

              <input
                type="text"
                autoComplete="off"
                value={
                  deleteConfirmation
                }
                disabled={
                  deleteAccountLoading
                }
                onChange={(
                  event
                ) => {
                  setDeleteConfirmation(
                    event.target.value
                  )

                  if (
                    deleteAccountError
                  ) {
                    setDeleteAccountError(
                      null
                    )
                  }
                }}
                placeholder="SUPPRIMER"
                className="min-h-12 w-full border border-slate-300 bg-transparent px-4 text-sm font-black uppercase tracking-wide text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-red-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-600 dark:disabled:bg-slate-800"
              />

              <p className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                {copy.exactWord}
              </p>
            </div>

            {deleteAccountError && (
              <div className="border border-red-300 bg-red-50 p-4 text-sm font-bold leading-relaxed text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
                {
                  deleteAccountError
                }
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={
                  deleteAccountLoading ||
                  deleteConfirmation
                    .trim() !==
                    'SUPPRIMER'
                }
                onClick={
                  handleDeleteAccount
                }
                className="min-h-12 w-full bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 dark:hover:bg-red-500 dark:disabled:bg-red-950 dark:disabled:text-red-700"
              >
                {deleteAccountLoading
                  ? copy.deleting
                  : copy.deleteForever}
              </button>

              <button
                type="button"
                disabled={
                  deleteAccountLoading
                }
                onClick={() =>
                  setActiveModal(
                    null
                  )
                }
                className="min-h-12 w-full border border-slate-300 bg-transparent px-5 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {copy.cancel}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}