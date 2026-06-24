import { useMemo, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/auth-context'
import { logSecurityEvent } from '@/features/security/services/security-audit'
import { evaluatePasswordPolicy } from '@/features/security/model/password-policy'
import { useSecuritySettings } from '@/features/security/hooks/useSecuritySettings'
import { supabase } from '@/lib/supabase'

export function SecurityCenterPage() {
  const { user, isMfaRequired } = useAuth()
  const queryClient = useQueryClient()
  const { data: settings, isLoading, error } = useSecuritySettings()
  const [samplePassword, setSamplePassword] = useState('')

  const passwordPolicy = useMemo(() => evaluatePasswordPolicy(samplePassword, settings), [samplePassword, settings])

  const purgeMutation = useMutation({
    mutationFn: async () => {
      const { data, error: rpcError } = await supabase.rpc('purge_old_security_audit_logs')

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      return data as number
    },
    onSuccess: async (deletedCount) => {
      await logSecurityEvent({
        action: 'security.retention.cleanup',
        resource: 'security_audit_logs',
        outcome: 'success',
        details: {
          deleted_rows: deletedCount,
          retention_days: settings?.security_audit_log_retention_days ?? null,
        },
      })

      await queryClient.invalidateQueries({ queryKey: ['security-settings'] })
      await queryClient.invalidateQueries({ queryKey: ['security-audit-logs', 10] })
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Security center</h1>
      <p className="mt-2 text-sm text-gray-500">
        Sprint 3 hardening: MFA, password policy, retention, minimization and API controls.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">Admin 2FA</h2>
          <p className="mt-2 text-sm text-gray-600">
            Role actif: <span className="font-medium">{user?.role ?? 'anonymous'}</span>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            MFA requis pour admin: {settings?.admin_2fa_required ? 'oui' : 'non'}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Session actuelle MFA: {isMfaRequired ? 'non validee' : 'validee'}
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Les comptes admin restent bloques sur /mfa-required tant que le niveau AAL2 n&apos;est pas atteint.
          </p>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">Password policy</h2>
          <p className="mt-2 text-sm text-gray-600">
            Longueur minimale: {settings?.password_min_length ?? 12} caracteres
          </p>
          <p className="text-sm text-gray-600">
            Majuscule: {settings?.password_require_uppercase ? 'obligatoire' : 'optionnelle'}
          </p>
          <p className="text-sm text-gray-600">
            Chiffre: {settings?.password_require_number ? 'obligatoire' : 'optionnel'}
          </p>
          <p className="text-sm text-gray-600">
            Minuscule: {settings?.password_require_lowercase ? 'obligatoire' : 'optionnelle'}
          </p>

          <label htmlFor="sample-password" className="mt-4 block text-sm font-medium text-gray-700">
            Tester un mot de passe
          </label>
          <input
            id="sample-password"
            type="password"
            value={samplePassword}
            onChange={(event) => setSamplePassword(event.target.value)}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Tapez un mot de passe test"
          />

          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            {passwordPolicy.checks.map((check) => (
              <li key={check.label} className={check.passed ? 'text-emerald-700' : 'text-red-600'}>
                {check.passed ? 'OK' : 'KO'} - {check.label}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">Retention logs</h2>
          <p className="mt-2 text-sm text-gray-600">
            Conservation des logs de securite: {settings?.security_audit_log_retention_days ?? 90} jours
          </p>
          <p className="text-sm text-gray-600">
            Etat actuel: {isLoading ? 'chargement...' : error ? 'indisponible' : 'pret'}
          </p>
          <button
            type="button"
            onClick={() => purgeMutation.mutate()}
            disabled={purgeMutation.isPending || isLoading || Boolean(error)}
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {purgeMutation.isPending ? 'Nettoyage...' : 'Purger les vieux logs'}
          </button>
          {purgeMutation.data ? (
            <p className="mt-3 text-sm text-emerald-700">
              {purgeMutation.data} ligne(s) supprimee(s).
            </p>
          ) : null}
          {purgeMutation.error instanceof Error ? (
            <p className="mt-3 text-sm text-red-600">{purgeMutation.error.message}</p>
          ) : null}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">Data minimization and API hardening</h2>
          <p className="mt-2 text-sm text-gray-600">
            {settings?.data_minimization_note ?? 'least privilege enforced by role and route guards'}
          </p>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <p>Signalements / minute: {settings?.report_rate_limit_per_minute ?? 3}</p>
            <p>Actions sensibles / minute: {settings?.sensitive_api_rate_limit_per_minute ?? 30}</p>
            <p>Le role citoyen ne voit jamais les couches sensibles de cartographie.</p>
            <p>Les champs personnels restent limites au besoin metier du role connecte.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

