import { DEFAULT_SECURITY_SETTINGS, type SecuritySettings } from './security-settings'

export type PasswordPolicyCheck = {
  label: string
  passed: boolean
}

export type PasswordPolicyResult = {
  isValid: boolean
  checks: PasswordPolicyCheck[]
}

function hasUppercase(value: string) {
  return /[A-Z]/.test(value)
}

function hasNumber(value: string) {
  return /\d/.test(value)
}

function hasLowercase(value: string) {
  return /[a-z]/.test(value)
}

export function evaluatePasswordPolicy(
  password: string,
  policy: Pick<
    SecuritySettings,
    | 'password_min_length'
    | 'password_require_uppercase'
    | 'password_require_number'
    | 'password_require_lowercase'
  > = DEFAULT_SECURITY_SETTINGS,
): PasswordPolicyResult {
  const checks: PasswordPolicyCheck[] = [
    {
      label: `Au moins ${policy.password_min_length} caracteres`,
      passed: password.length >= policy.password_min_length,
    },
    {
      label: 'Au moins une majuscule',
      passed: !policy.password_require_uppercase || hasUppercase(password),
    },
    {
      label: 'Au moins un chiffre',
      passed: !policy.password_require_number || hasNumber(password),
    },
    {
      label: 'Au moins une minuscule',
      passed: !policy.password_require_lowercase || hasLowercase(password),
    },
  ]

  return {
    isValid: checks.every((check) => check.passed),
    checks,
  }
}

