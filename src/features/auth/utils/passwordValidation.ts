export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{15,}$/

const commonPasswordPatterns = [
  'password',
  'motdepasse',
  '123456',
  'qwerty',
  'azerty',
  'admin',
  'welcome',
]

export function isValidPassword(password: string): boolean {
  return passwordRegex.test(password)
}

export function containsCommonPasswordPattern(password: string) {
  const normalized = password.toLowerCase().replace(/\s+/g, '')

  return commonPasswordPatterns.some((pattern) =>
    normalized.includes(pattern)
  )
}

export const passwordValidationMessage =
  'Le mot de passe doit contenir au moins 15 caractères, une majuscule, une minuscule et un chiffre, sans mot de passe trop évident.'
