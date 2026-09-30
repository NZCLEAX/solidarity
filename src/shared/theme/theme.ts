export type ThemePreference =
  | 'light'
  | 'dark'
  | 'system'

const THEME_STORAGE_KEY = 'pulse-theme'

export function getThemePreference(): ThemePreference {
  const savedTheme = localStorage.getItem(
    THEME_STORAGE_KEY
  )

  if (
    savedTheme === 'light' ||
    savedTheme === 'dark' ||
    savedTheme === 'system'
  ) {
    return savedTheme
  }

  return 'system'
}

export function isDarkTheme(
  preference: ThemePreference = getThemePreference()
) {
  if (preference === 'dark') {
    return true
  }

  if (preference === 'light') {
    return false
  }

  return window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches
}

export function applyTheme(
  preference: ThemePreference = getThemePreference()
) {
  const dark = isDarkTheme(preference)

  document.documentElement.classList.toggle(
    'dark',
    dark
  )

  document.documentElement.dataset.theme =
    dark ? 'dark' : 'light'

  document.documentElement.style.colorScheme =
    dark ? 'dark' : 'light'

  return dark
}

export function setThemePreference(
  preference: ThemePreference
) {
  localStorage.setItem(
    THEME_STORAGE_KEY,
    preference
  )

  applyTheme(preference)

  window.dispatchEvent(
    new CustomEvent('pulse-theme-change', {
      detail: preference,
    })
  )
}

export function initTheme() {
  applyTheme()

  const mediaQuery = window.matchMedia(
    '(prefers-color-scheme: dark)'
  )

  const handleSystemThemeChange = () => {
    if (getThemePreference() === 'system') {
      applyTheme('system')
    }
  }

  mediaQuery.addEventListener(
    'change',
    handleSystemThemeChange
  )

  return () => {
    mediaQuery.removeEventListener(
      'change',
      handleSystemThemeChange
    )
  }
}