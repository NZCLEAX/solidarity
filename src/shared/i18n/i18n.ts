import i18n from 'i18next'
import {
  initReactI18next,
  useTranslation as useReactI18next,
} from 'react-i18next'
import frExtracted from '@/locales/fr/translation.json'
import enExtracted from '@/locales/en/translation.json'
import esExtracted from '@/locales/es/translation.json'
import arExtracted from '@/locales/ar/translation.json'

export type AppLanguage =
  | 'fr'
  | 'en'
  | 'es'
  | 'ar'

const LANGUAGE_STORAGE_KEY = 'pulse-language'

export const LANGUAGE_OPTIONS: {
  value: AppLanguage
  label: string
  flag: string
}[] = [
  {
    value: 'fr',
    label: 'Français',
    flag: '🇫🇷',
  },
  {
    value: 'en',
    label: 'English',
    flag: '🇬🇧',
  },
  {
    value: 'es',
    label: 'Español',
    flag: '🇪🇸',
  },
  {
    value: 'ar',
    label: 'العربية',
    flag: '🇸🇦',
  },
]

const translations = {
  fr: {
    // Rôles
    'role.citoyen': 'Citoyen',
    'role.benevole': 'Bénévole',
    'role.association': 'Association',
    'role.moderateur': 'Modérateur',
    'role.admin': 'Administrateur',

    // Navigation
    'nav.home': 'Accueil',
    'nav.planning': 'Planning',
    'nav.map': 'Carte',
    'nav.interventions': 'Interventions',
    'nav.administration': 'Administration',
    'nav.profile': 'Espace',
    'nav.report': 'Signaler',

    // Général
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.manage': 'Gérer',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.close': 'Fermer',
    'common.loading': 'Chargement...',
    'common.logout': 'Déconnexion',
    'common.soon': 'Bientôt',
    'common.yes': 'Oui',
    'common.no': 'Non',

    // Réglages
    'settings.title': 'Réglages',
    'settings.subtitle':
      'Gère ton compte, tes informations, ta sécurité et tes préférences.',

    'settings.account': 'Compte',
    'settings.accountDescription':
      'Informations liées à ton compte PULSE.',
    'settings.accountInfo':
      'Informations du compte',
    'settings.role': 'Rôle',
    'settings.viewProfile':
      'Voir mon profil',
    'settings.viewProfileDescription':
      'Consulte ton rôle, ton statut et tes permissions.',

    'settings.notifications':
      'Notifications',
    'settings.notificationsDescription':
      'Choisis les informations que tu souhaites recevoir.',
    'settings.planning': 'Planning',
    'settings.planningDescription':
      'Changements et nouvelles actions planifiées.',
    'settings.interventions':
      'Interventions',
    'settings.interventionsDescription':
      'Nouvelles interventions et modifications importantes.',
    'settings.volunteerRequests':
      'Demandes bénévoles',
    'settings.volunteerRequestsDescription':
      'Nouvelles demandes pour rejoindre ton association.',
    'settings.pulseNews':
      'Actualités PULSE',
    'settings.pulseNewsDescription':
      'Nouvelles fonctionnalités et informations importantes.',

    'settings.appearance': 'Apparence',
    'settings.appearanceDescription':
      'Personnalise l’affichage de PULSE.',
    'settings.light': 'Clair',
    'settings.dark': 'Sombre',
    'settings.system': 'Système',

    'settings.compact':
      'Affichage compact',
    'settings.compactDescription':
      'Réduit l’espace entre les éléments pour afficher davantage d’informations.',

    'settings.preferences':
      'Préférences',
    'settings.preferencesDescription':
      'Configure ton expérience PULSE.',
    'settings.language': 'Langue',
    'settings.languageDescription':
      'Langue utilisée dans l’application.',

    'settings.security':
      'Confidentialité & sécurité',
    'settings.securityDescription':
      'Contrôle la sécurité de ton compte.',
    'settings.password':
      'Mot de passe',
    'settings.passwordDescription':
      'Modifie ton mot de passe de connexion.',

    'settings.data': 'Données',
    'settings.dataDescription':
      'Gestion des données associées à ton compte.',
    'settings.export':
      'Exporter mes données',
    'settings.exportDescription':
      'Télécharge une copie des données liées à ton compte.',

    'settings.about': 'À propos',
    'settings.terms':
      "Conditions d'utilisation",
    'settings.privacy':
      'Politique de confidentialité',
    'settings.support':
      'Aide & support',

    'settings.session': 'Session',
    'settings.sessionDescription':
      'Gestion de ta connexion à PULSE.',

    'settings.dangerZone':
      'Zone sensible',
    'settings.deleteAccount':
      'Suppression du compte',
    'settings.deleteAccountButton':
      'Supprimer mon compte',

    // Planning
    'planning.title': 'Planning',
    'planning.subtitle':
      'Visualise les actions prévues et organise les interventions terrain.',
    'planning.create':
      'Déclarer une intervention',
    'planning.actions': 'Actions',
    'planning.meals': 'Repas',
    'planning.volunteers': 'Bénévoles',
    'planning.today': "Aujourd'hui",
    'planning.week': 'Semaine',
    'planning.month': 'Mois',
    'planning.filters': 'Filtres',
    'planning.fieldActions':
      'Actions terrain',
    'planning.todayInterventions':
      'Interventions du jour',

    // Carte
    'map.title': 'Carte terrain',
    'map.realtime': 'Vue temps réel',
    'map.points': 'Points',
    'map.urgent': 'Urgents',
    'map.interventions':
      'Interventions',
    'map.hide': 'Masquer',
    'map.show': 'Afficher',
    'map.search': 'Rechercher...',
    'map.filters': 'Filtres',
    'map.report': 'Signaler',
    'map.emergency': 'Urgence',
    'map.critical': 'Crit.',
    'map.high': 'Haute',
    'map.medium': 'Moy.',
    'map.low': 'Basse',
  },

  en: {
    // Roles
    'role.citoyen': 'Citizen',
    'role.benevole': 'Volunteer',
    'role.association': 'Organization',
    'role.moderateur': 'Moderator',
    'role.admin': 'Administrator',

    // Navigation
    'nav.home': 'Home',
    'nav.planning': 'Planning',
    'nav.map': 'Map',
    'nav.interventions': 'Interventions',
    'nav.administration': 'Administration',
    'nav.profile': 'Profile',
    'nav.report': 'Report',

    // General
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.manage': 'Manage',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.logout': 'Log out',
    'common.soon': 'Coming soon',
    'common.yes': 'Yes',
    'common.no': 'No',

    // Settings
    'settings.title': 'Settings',
    'settings.subtitle':
      'Manage your account, information, security and preferences.',

    'settings.account': 'Account',
    'settings.accountDescription':
      'Information related to your PULSE account.',
    'settings.accountInfo':
      'Account information',
    'settings.role': 'Role',
    'settings.viewProfile':
      'View my profile',
    'settings.viewProfileDescription':
      'View your role, status and permissions.',

    'settings.notifications':
      'Notifications',
    'settings.notificationsDescription':
      'Choose which information you want to receive.',
    'settings.planning': 'Planning',
    'settings.planningDescription':
      'Changes and newly scheduled actions.',
    'settings.interventions':
      'Interventions',
    'settings.interventionsDescription':
      'New interventions and important updates.',
    'settings.volunteerRequests':
      'Volunteer requests',
    'settings.volunteerRequestsDescription':
      'New requests to join your organization.',
    'settings.pulseNews':
      'PULSE news',
    'settings.pulseNewsDescription':
      'New features and important information.',

    'settings.appearance':
      'Appearance',
    'settings.appearanceDescription':
      'Customize how PULSE looks.',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.system': 'System',

    'settings.compact':
      'Compact display',
    'settings.compactDescription':
      'Reduce spacing between elements to display more information.',

    'settings.preferences':
      'Preferences',
    'settings.preferencesDescription':
      'Configure your PULSE experience.',
    'settings.language': 'Language',
    'settings.languageDescription':
      'Language used in the application.',

    'settings.security':
      'Privacy & security',
    'settings.securityDescription':
      'Manage your account security.',
    'settings.password':
      'Password',
    'settings.passwordDescription':
      'Change your login password.',

    'settings.data': 'Data',
    'settings.dataDescription':
      'Manage data associated with your account.',
    'settings.export':
      'Export my data',
    'settings.exportDescription':
      'Download a copy of the data linked to your account.',

    'settings.about': 'About',
    'settings.terms':
      'Terms of use',
    'settings.privacy':
      'Privacy policy',
    'settings.support':
      'Help & support',

    'settings.session': 'Session',
    'settings.sessionDescription':
      'Manage your PULSE session.',

    'settings.dangerZone':
      'Danger zone',
    'settings.deleteAccount':
      'Account deletion',
    'settings.deleteAccountButton':
      'Delete my account',

    // Planning
    'planning.title': 'Planning',
    'planning.subtitle':
      'View scheduled actions and organize field interventions.',
    'planning.create':
      'Create an intervention',
    'planning.actions': 'Actions',
    'planning.meals': 'Meals',
    'planning.volunteers': 'Volunteers',
    'planning.today': 'Today',
    'planning.week': 'Week',
    'planning.month': 'Month',
    'planning.filters': 'Filters',
    'planning.fieldActions':
      'Field actions',
    'planning.todayInterventions':
      "Today's interventions",

    // Map
    'map.title': 'Field map',
    'map.realtime': 'Real-time view',
    'map.points': 'Points',
    'map.urgent': 'Urgent',
    'map.interventions':
      'Interventions',
    'map.hide': 'Hide',
    'map.show': 'Show',
    'map.search': 'Search...',
    'map.filters': 'Filters',
    'map.report': 'Report',
    'map.emergency': 'Urgency',
    'map.critical': 'Crit.',
    'map.high': 'High',
    'map.medium': 'Med.',
    'map.low': 'Low',
  },

  es: {
    // Roles
    'role.citoyen': 'Ciudadano',
    'role.benevole': 'Voluntario',
    'role.association': 'Asociación',
    'role.moderateur': 'Moderador',
    'role.admin': 'Administrador',

    // Navegación
    'nav.home': 'Inicio',
    'nav.planning': 'Planificación',
    'nav.map': 'Mapa',
    'nav.interventions': 'Intervenciones',
    'nav.administration': 'Administración',
    'nav.profile': 'Perfil',
    'nav.report': 'Reportar',

    // General
    'common.edit': 'Modificar',
    'common.view': 'Ver',
    'common.manage': 'Gestionar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.close': 'Cerrar',
    'common.loading': 'Cargando...',
    'common.logout': 'Cerrar sesión',
    'common.soon': 'Próximamente',
    'common.yes': 'Sí',
    'common.no': 'No',

    // Ajustes
    'settings.title': 'Ajustes',
    'settings.subtitle':
      'Gestiona tu cuenta, información, seguridad y preferencias.',

    'settings.account': 'Cuenta',
    'settings.accountDescription':
      'Información relacionada con tu cuenta PULSE.',
    'settings.accountInfo':
      'Información de la cuenta',
    'settings.role': 'Rol',
    'settings.viewProfile':
      'Ver mi perfil',
    'settings.viewProfileDescription':
      'Consulta tu rol, estado y permisos.',

    'settings.notifications':
      'Notificaciones',
    'settings.notificationsDescription':
      'Elige la información que deseas recibir.',
    'settings.planning':
      'Planificación',
    'settings.planningDescription':
      'Cambios y nuevas acciones planificadas.',
    'settings.interventions':
      'Intervenciones',
    'settings.interventionsDescription':
      'Nuevas intervenciones y cambios importantes.',
    'settings.volunteerRequests':
      'Solicitudes de voluntarios',
    'settings.volunteerRequestsDescription':
      'Nuevas solicitudes para unirse a tu asociación.',
    'settings.pulseNews':
      'Noticias de PULSE',
    'settings.pulseNewsDescription':
      'Nuevas funciones e información importante.',

    'settings.appearance':
      'Apariencia',
    'settings.appearanceDescription':
      'Personaliza la apariencia de PULSE.',
    'settings.light': 'Claro',
    'settings.dark': 'Oscuro',
    'settings.system': 'Sistema',

    'settings.compact':
      'Vista compacta',
    'settings.compactDescription':
      'Reduce el espacio entre elementos para mostrar más información.',

    'settings.preferences':
      'Preferencias',
    'settings.preferencesDescription':
      'Configura tu experiencia PULSE.',
    'settings.language': 'Idioma',
    'settings.languageDescription':
      'Idioma utilizado en la aplicación.',

    'settings.security':
      'Privacidad y seguridad',
    'settings.securityDescription':
      'Controla la seguridad de tu cuenta.',
    'settings.password':
      'Contraseña',
    'settings.passwordDescription':
      'Cambia tu contraseña de acceso.',

    'settings.data': 'Datos',
    'settings.dataDescription':
      'Gestión de los datos asociados a tu cuenta.',
    'settings.export':
      'Exportar mis datos',
    'settings.exportDescription':
      'Descarga una copia de los datos vinculados a tu cuenta.',

    'settings.about':
      'Acerca de',
    'settings.terms':
      'Condiciones de uso',
    'settings.privacy':
      'Política de privacidad',
    'settings.support':
      'Ayuda y soporte',

    'settings.session':
      'Sesión',
    'settings.sessionDescription':
      'Gestiona tu sesión de PULSE.',

    'settings.dangerZone':
      'Zona sensible',
    'settings.deleteAccount':
      'Eliminación de la cuenta',
    'settings.deleteAccountButton':
      'Eliminar mi cuenta',

    // Planificación
    'planning.title':
      'Planificación',
    'planning.subtitle':
      'Visualiza las acciones previstas y organiza las intervenciones sobre el terreno.',
    'planning.create':
      'Crear una intervención',
    'planning.actions': 'Acciones',
    'planning.meals': 'Comidas',
    'planning.volunteers':
      'Voluntarios',
    'planning.today': 'Hoy',
    'planning.week': 'Semana',
    'planning.month': 'Mes',
    'planning.filters': 'Filtros',
    'planning.fieldActions':
      'Acciones sobre el terreno',
    'planning.todayInterventions':
      'Intervenciones del día',

    // Mapa
    'map.title': 'Mapa de terreno',
    'map.realtime':
      'Vista en tiempo real',
    'map.points': 'Puntos',
    'map.urgent': 'Urgentes',
    'map.interventions':
      'Intervenciones',
    'map.hide': 'Ocultar',
    'map.show': 'Mostrar',
    'map.search': 'Buscar...',
    'map.filters': 'Filtros',
    'map.report': 'Reportar',
    'map.emergency': 'Urgencia',
    'map.critical': 'Crít.',
    'map.high': 'Alta',
    'map.medium': 'Media',
    'map.low': 'Baja',
  },

  ar: {
    // الأدوار
    'role.citoyen': 'مواطن',
    'role.benevole': 'متطوع',
    'role.association': 'جمعية',
    'role.moderateur': 'مشرف',
    'role.admin': 'مدير',

    // التنقل
    'nav.home': 'الرئيسية',
    'nav.planning': 'التخطيط',
    'nav.map': 'الخريطة',
    'nav.interventions': 'التدخلات',
    'nav.administration': 'الإدارة',
    'nav.profile': 'الملف الشخصي',
    'nav.report': 'إبلاغ',

    // عام
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.manage': 'إدارة',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.close': 'إغلاق',
    'common.loading': 'جارٍ التحميل...',
    'common.logout': 'تسجيل الخروج',
    'common.soon': 'قريبًا',
    'common.yes': 'نعم',
    'common.no': 'لا',

    // الإعدادات
    'settings.title':
      'الإعدادات',
    'settings.subtitle':
      'إدارة حسابك ومعلوماتك وأمانك وتفضيلاتك.',

    'settings.account':
      'الحساب',
    'settings.accountDescription':
      'المعلومات المرتبطة بحساب PULSE الخاص بك.',
    'settings.accountInfo':
      'معلومات الحساب',
    'settings.role':
      'الدور',
    'settings.viewProfile':
      'عرض ملفي الشخصي',
    'settings.viewProfileDescription':
      'عرض دورك وحالتك وصلاحياتك.',

    'settings.notifications':
      'الإشعارات',
    'settings.notificationsDescription':
      'اختر المعلومات التي ترغب في تلقيها.',
    'settings.planning':
      'التخطيط',
    'settings.planningDescription':
      'التغييرات والإجراءات الجديدة المخطط لها.',
    'settings.interventions':
      'التدخلات',
    'settings.interventionsDescription':
      'التدخلات الجديدة والتغييرات المهمة.',
    'settings.volunteerRequests':
      'طلبات المتطوعين',
    'settings.volunteerRequestsDescription':
      'طلبات جديدة للانضمام إلى جمعيتك.',
    'settings.pulseNews':
      'أخبار PULSE',
    'settings.pulseNewsDescription':
      'ميزات جديدة ومعلومات مهمة.',

    'settings.appearance':
      'المظهر',
    'settings.appearanceDescription':
      'خصص مظهر PULSE.',
    'settings.light':
      'فاتح',
    'settings.dark':
      'داكن',
    'settings.system':
      'النظام',

    'settings.compact':
      'العرض المضغوط',
    'settings.compactDescription':
      'تقليل المسافات بين العناصر لعرض المزيد من المعلومات.',

    'settings.preferences':
      'التفضيلات',
    'settings.preferencesDescription':
      'قم بإعداد تجربة PULSE الخاصة بك.',
    'settings.language':
      'اللغة',
    'settings.languageDescription':
      'اللغة المستخدمة في التطبيق.',

    'settings.security':
      'الخصوصية والأمان',
    'settings.securityDescription':
      'إدارة أمان حسابك.',
    'settings.password':
      'كلمة المرور',
    'settings.passwordDescription':
      'تغيير كلمة مرور تسجيل الدخول.',

    'settings.data':
      'البيانات',
    'settings.dataDescription':
      'إدارة البيانات المرتبطة بحسابك.',
    'settings.export':
      'تصدير بياناتي',
    'settings.exportDescription':
      'تنزيل نسخة من البيانات المرتبطة بحسابك.',

    'settings.about':
      'حول',
    'settings.terms':
      'شروط الاستخدام',
    'settings.privacy':
      'سياسة الخصوصية',
    'settings.support':
      'المساعدة والدعم',

    'settings.session':
      'الجلسة',
    'settings.sessionDescription':
      'إدارة جلسة PULSE الخاصة بك.',

    'settings.dangerZone':
      'منطقة حساسة',
    'settings.deleteAccount':
      'حذف الحساب',
    'settings.deleteAccountButton':
      'حذف حسابي',

    // التخطيط
    'planning.title':
      'التخطيط',
    'planning.subtitle':
      'عرض الإجراءات المخطط لها وتنظيم التدخلات الميدانية.',
    'planning.create':
      'إنشاء تدخل',
    'planning.actions':
      'الإجراءات',
    'planning.meals':
      'الوجبات',
    'planning.volunteers':
      'المتطوعون',
    'planning.today':
      'اليوم',
    'planning.week':
      'الأسبوع',
    'planning.month':
      'الشهر',
    'planning.filters':
      'الفلاتر',
    'planning.fieldActions':
      'الإجراءات الميدانية',
    'planning.todayInterventions':
      'تدخلات اليوم',

    // الخريطة
    'map.title':
      'الخريطة الميدانية',
    'map.realtime':
      'عرض في الوقت الفعلي',
    'map.points':
      'النقاط',
    'map.urgent':
      'عاجل',
    'map.interventions':
      'التدخلات',
    'map.hide':
      'إخفاء',
    'map.show':
      'إظهار',
    'map.search':
      'بحث...',
    'map.filters':
      'الفلاتر',
    'map.report':
      'إبلاغ',
    'map.emergency':
      'الأولوية',
    'map.critical':
      'حرج',
    'map.high':
      'عالية',
    'map.medium':
      'متوسطة',
    'map.low':
      'منخفضة',
  },
} as const

export type TranslationKey =
  keyof typeof translations.fr

function normalizeLanguage(
  language: string | null | undefined
): AppLanguage {
  const normalized =
    language?.toLowerCase().split('-')[0]

  if (
    normalized === 'fr' ||
    normalized === 'en' ||
    normalized === 'es' ||
    normalized === 'ar'
  ) {
    return normalized
  }

  return 'fr'
}

export function getLanguage(): AppLanguage {
  if (typeof window === 'undefined') {
    return 'fr'
  }

  return normalizeLanguage(
    localStorage.getItem(LANGUAGE_STORAGE_KEY)
  )
}

export function applyLanguage(
  language: AppLanguage
) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.lang = language
  document.documentElement.dir =
    language === 'ar' ? 'rtl' : 'ltr'
}

const initialLanguage = getLanguage()

i18n
  .use(initReactI18next)
  .init({
    resources: {
  fr: {
    translation: {
      ...translations.fr,
      ...frExtracted,
    },
  },

  en: {
    translation: {
      ...translations.en,
      ...enExtracted,
    },
  },

  es: {
    translation: {
      ...translations.es,
      ...esExtracted,
    },
  },

  ar: {
    translation: {
      ...translations.ar,
      ...arExtracted,
    },
  },
},

    lng: initialLanguage,
    fallbackLng: 'fr',

    supportedLngs: [
      'fr',
      'en',
      'es',
      'ar',
    ],

    defaultNS: 'translation',

    // Nos clés actuelles sont volontairement plates :
    // "settings.title", "nav.home", etc.
    keySeparator: false,

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    // Les traductions sont déjà embarquées dans le bundle.
    // L'initialisation peut donc être immédiate.
    initAsync: false,
  })

applyLanguage(initialLanguage)

i18n.on(
  'languageChanged',
  (language) => {
    const nextLanguage =
      normalizeLanguage(language)

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        nextLanguage
      )
    }

    applyLanguage(nextLanguage)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(
          'pulse-language-change',
          {
            detail: nextLanguage,
          }
        )
      )
    }
  }
)

export function setAppLanguage(
  language: AppLanguage
) {
  void i18n.changeLanguage(language)
}

export function initLanguage() {
  const language = getLanguage()

  applyLanguage(language)

  if (
    normalizeLanguage(i18n.language) !==
    language
  ) {
    void i18n.changeLanguage(language)
  }
}

export function translate(
  key: TranslationKey,
  language: AppLanguage = getLanguage()
): string {
  return i18n.getFixedT(language)(key)
}

export function useTranslation() {
  const {
    t: reactT,
    i18n: reactI18n,
  } = useReactI18next()

  const language =
    normalizeLanguage(
      reactI18n.resolvedLanguage ??
        reactI18n.language
    )

  function t(
    key: TranslationKey
  ): string {
    return reactT(key)
  }

  return {
    language,
    setLanguage: setAppLanguage,
    t,
    isRTL: language === 'ar',
    i18n: reactI18n,
  }
}

export default i18n