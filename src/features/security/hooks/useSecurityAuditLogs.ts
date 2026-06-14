import { useQuery } from '@tanstack/react-query'

import { fetchSecurityAuditLogs } from '@/features/security/services/security-audit'

export function useSecurityAuditLogs(limit = 10) {
  return useQuery({
    queryKey: ['security-audit-logs', limit],
    queryFn: () => fetchSecurityAuditLogs(limit),
    staleTime: 30_000,
  })
}
