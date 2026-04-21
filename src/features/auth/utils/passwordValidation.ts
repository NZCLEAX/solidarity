export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{15,}$/

export function isValidPassword(password: string): boolean {
  return passwordRegex.test(password)
}

export const passwordValidationMessage =
  'Le mot de passe doit contenir au moins 15 caractères, une majuscule, une minuscule et un chiffre.'