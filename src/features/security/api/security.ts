import { supabase } from '@/lib/supabase'

export type SecuritySeverity = 'info' | 'warning' | 'critical'

export type SecurityAuditLog = {
  id: string
  actor_id: string | null
  actor_email: string | null
  actor_name: string | null
  actor_role: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  severity: SecuritySeverity | null
  success: boolean | null
  details: Record<string, unknown> | null
  created_at: string
}

type SecurityEventInput = {
  action: string
  resourceType?: string | null
  resourceId?: string | null
  severity?: SecuritySeverity
  success?: boolean
  details?: Record<string, unknown>
}

export async function logSecurityEvent(input: SecurityEventInput) {
  try {
    const { error } = await supabase.rpc('record_security_event', {
      p_action: input.action,
      p_resource_type: input.resourceType ?? null,
      p_resource_id: input.resourceId ?? null,
      p_severity: input.severity ?? 'info',
      p_success: input.success ?? true,
      p_details: input.details ?? {},
    })

    if (error) {
      throw error
    }

    return true
  } catch {
    return false
  }
}

export async function getSecurityAuditLogs(limit = 25) {
  const { data, error } = await supabase
    .from('security_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return (data ?? []) as SecurityAuditLog[]
}
