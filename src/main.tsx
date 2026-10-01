import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

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

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)