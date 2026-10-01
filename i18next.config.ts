import { defineConfig } from 'i18next-cli'

export default defineConfig({
  locales: ['fr', 'en', 'es', 'ar'],

  extract: {
    input: [
      // Carte déjà instrumentée : on continue à extraire ses clés
      'src/features/map/pages/MapPage.tsx',

      // Interventions
      'src/features/interventions/pages/InterventionsPage.tsx',
      'src/features/interventions/pages/CreateInterventionPage.tsx',

      // Administration
      'src/features/admin/pages/AdminPage.tsx',
      'src/features/admin/pages/AdminAssociationsPage.tsx',
    ],

    output:
      'src/locales/{{language}}/{{namespace}}.json',

    primaryLanguage: 'fr',

    secondaryLanguages: [
      'en',
      'es',
      'ar',
    ],

    defaultNS: 'translation',

    sort: true,

    indentation: 2,

    // IMPORTANT :
    // on conserve les traductions Dashboard déjà existantes.
    removeUnusedKeys: false,

    instrumentScorer: (
      _content,
      { file }
    ) => {
      const normalizedFile =
        file.replace(/\\/g, '/')

      const technicalFolders = [
        '/api/',
        '/utils/',
        '/services/',
        '/lib/',
      ]

      if (
        technicalFolders.some((folder) =>
          normalizedFile.includes(folder)
        )
      ) {
        return null
      }

      if (
        normalizedFile.includes(
          '/shared/i18n/'
        )
      ) {
        return null
      }

      return undefined
    },
  },

  lint: {
    checkInterpolationParams: true,
    checkConcatenation: 'warn',
    checkPunctuationConcatenation: 'warn',
  },
})