import { supabase } from '@/lib/supabase'
import { isUserRole, type UserRole } from '@/features/auth/model/roles'

export type SecurityAuditOutcome = 'success' | 'failure' | 'denied'

export type SecurityAuditAction =
  | 'auth.login.success'
  | 'auth.logout'
  | 'auth.access.denied'
  | 'auth.mfa.required'
  | 'report.create.attempt'
  | 'report.create.success'
  | 'report.create.rate_limited'
  | 'report.create.validation_failed'
  | 'intervention.comment.attempt'
  | 'intervention.comment.success'
  | 'intervention.comment.validation_failed'
  | 'admin.audit.view'
  | 'security.retention.cleanup'
  | 'profile.role.changed'

export type SecurityAuditLogRow = {
  id: string
  actor_user_id: string | null
  actor_email: string | null
  actor_role: UserRole | null
  target_user_id: string | null
  action: SecurityAuditAction
  resource: string | null
  outcome: SecurityAuditOutcome
  details: Record<string, unknown> | null
  created_at: string
}

type LogSecurityEventInput = {
  action: SecurityAuditAction
  resource?: string | null
  outcome?: SecurityAuditOutcome
  details?: Record<string, unknown>
  target_user_id?: string | null
}

async function getCurrentActor() {
  const { data: userData } = await supabase.auth.getUser()
  const actor = userData.user

  if (!actor) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', actor.id)
    .maybeSingle()

  return {
    actorUserId: actor.id,
    actorEmail: actor.email ?? null,
    actorRole: profile && isUserRole(profile.role) ? profile.role : null,
  }
}

export async function logSecurityEvent(input: LogSecurityEventInput) {
  const actor = await getCurrentActor()
  if (!actor) {
    return { error: 'AUTH_REQUIRED' }
  }

  const payload = {
    actor_user_id: actor.actorUserId,
    actor_email: actor.actorEmail,
    actor_role: actor.actorRole,
    target_user_id: input.target_user_id ?? null,
    action: input.action,
    resource: input.resource ?? null,
    outcome: input.outcome ?? 'success',
    details: input.details ?? {},
  }

  const { error } = await supabase.from('security_audit_logs').insert(payload)

  return { error: error?.message ?? null }
}

export async function fetchSecurityAuditLogs(limit = 10) {
  const { data, error } = await supabase
    .from('security_audit_logs')
    .select('id, actor_user_id, actor_email, actor_role, target_user_id, action, resource, outcome, details, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as SecurityAuditLogRow[]
}
