import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { initTheme } from '@/shared/theme/theme'
import { queryClient } from '@/lib/query-client'
import { router } from '@/app/router'
import '@/index.css'
import {
  initLanguage,
} from '@/shared/i18n/i18n'

initTheme()
initLanguage()

const compactMode =
  localStorage.getItem('pulse-compact-mode') ===
  'true'

document.documentElement.classList.toggle(
  'compact',
  compactMode
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)