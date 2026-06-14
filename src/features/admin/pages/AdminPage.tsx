import { useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useSecurityAuditLogs } from '@/features/security/hooks/useSecurityAuditLogs'
import { logSecurityEvent } from '@/features/security/services/security-audit'

export function AdminPage() {
  const { can } = usePermissions()
  const queryClient = useQueryClient()
  const { data: logs, isLoading, error } = useSecurityAuditLogs(10)

  useEffect(() => {
    void logSecurityEvent({
      action: 'admin.audit.view',
      resource: 'security_audit_logs',
      outcome: 'success',
      details: { limit: 10 },
    })
  }, [])

  function handleRefresh() {
    void queryClient.invalidateQueries({ queryKey: ['security-audit-logs', 10] })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
      <p className="mt-2 text-sm text-gray-500">Parametres sensibles de la plateforme.</p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        <p>Acces admin: {can('admin.access') ? 'autorise' : 'interdit'}</p>
        <p className="mt-2">Exigence securite: 2FA obligatoire pour ce role.</p>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-900">Journal de securite</h2>
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Rafraichir
          </button>
        </div>

        {isLoading ? <p className="mt-4 text-sm text-gray-500">Chargement des logs...</p> : null}
        {error ? (
          <p className="mt-4 text-sm text-red-600">
            Impossible de charger le journal de securite.
          </p>
        ) : null}

        {!isLoading && !error ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Heure</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Resultat</th>
                  <th className="px-4 py-3">Acteur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {logs?.length ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(log.created_at).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{log.action}</td>
                      <td className="px-4 py-3 text-gray-600">{log.outcome}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {log.actor_email ?? log.actor_user_id ?? 'system'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-4 text-gray-500" colSpan={4}>
                      Aucun log de securite pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}
