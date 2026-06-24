export type SecuritySettings = {
  id: boolean
  admin_2fa_required: boolean
  password_min_length: number
  password_require_uppercase: boolean
  password_require_number: boolean
  password_require_lowercase: boolean
  security_audit_log_retention_days: number
  report_rate_limit_per_minute: number
  sensitive_api_rate_limit_per_minute: number
  data_minimization_note: string
  created_at: string
  updated_at: string
}

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  id: true,
  admin_2fa_required: true,
  password_min_length: 15,
  password_require_uppercase: true,
  password_require_number: true,
  password_require_lowercase: true,
  security_audit_log_retention_days: 90,
  report_rate_limit_per_minute: 3,
  sensitive_api_rate_limit_per_minute: 30,
  data_minimization_note: 'least privilege enforced by role and route guards',
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
}

