import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'

import '@/index.css'

// Initialise l'unique système i18next de PULSE
import '@/shared/i18n/i18n'

import { initTheme } from '@/shared/theme/theme'
import { queryClient } from '@/lib/query-client'
import { router } from '@/app/router'
import '@/shared/i18n/i18n'
import { initializeMobileAuth } from '@/features/auth/utils/mobileAuth'

initTheme()

const compactMode =
  localStorage.getItem('pulse-compact-mode') === 'true'

document.documentElement.classList.toggle(
  'compact',
  compactMode
)

void initializeMobileAuth()

// Dans l'app iPhone / Android : comportement d'application
// (pas de sélection de texte au toucher).
document.documentElement.classList.toggle(
  'app-native',
  Capacitor.isNativePlatform()
)
// Empêche la molette de la souris de modifier un champ numérique
// (nombre de bénévoles, repas, personnes) en faisant défiler la page.
document.addEventListener(
  'wheel',
  () => {
    const element = document.activeElement

    if (
      element instanceof HTMLInputElement &&
      element.type === 'number'
    ) {
      element.blur()
    }
  },
  { passive: true }
)

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)