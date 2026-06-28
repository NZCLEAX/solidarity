import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getSecurityAuditLogs } from '@/features/security/api/security'

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getSeverityClass(severity: string | null | undefined) {
  if (severity === 'critical') {
    return 'bg-red-50 text-red-700 ring-red-200'
  }

  if (severity === 'warning') {
    return 'bg-orange-50 text-orange-700 ring-orange-200'
  }

  return 'bg-slate-100 text-slate-700 ring-slate-200'
}

function stringifyDetails(details: Record<string, unknown> | null) {
  if (!details || Object.keys(details).length === 0) {
    return 'Aucun détail complémentaire.'
  }

  return Object.entries(details)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(' · ')
}

export default function SecurityCenterPage() {
  const {
    data: logs = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['security-audit-logs'],
    queryFn: () => getSecurityAuditLogs(40),
  })

  const groupedCounts = useMemo(() => {
    return {
      critical: logs.filter((log) => log.severity === 'critical').length,
      warning: logs.filter((log) => log.severity === 'warning').length,
      info: logs.filter((log) => !log.severity || log.severity === 'info').length,
    }
  }, [logs])

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
            Sécurité
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl xl:text-5xl">
            Centre de sécurité
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Vue synthétique des garde-fous déjà intégrés dans l’application:
            rôles, protections d’accès, journalisation et anti-abus.
          </p>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-red-500">
              Critiques
            </p>
            <p className="mt-3 text-4xl font-black text-red-700">
              {groupedCounts.critical}
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-orange-200 bg-orange-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
              Avertissements
            </p>
            <p className="mt-3 text-4xl font-black text-orange-700">
              {groupedCounts.warning}
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Infos
            </p>
            <p className="mt-3 text-4xl font-black text-slate-950">
              {groupedCounts.info}
            </p>
          </article>
        </section>

        <section className="mb-8 rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-950">
            Briques de sécurité actives
          </h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="rounded-3xl bg-slate-50 p-5">
              <h3 className="text-lg font-black text-slate-950">
                Sprint 1
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                <li>• Protection des rôles et blocage des changements non autorisés.</li>
                <li>• Limitation anti-spam sur les signalements.</li>
                <li>• Garde-fous côté serveur pour éviter les écritures abusives.</li>
              </ul>
            </article>

            <article className="rounded-3xl bg-slate-50 p-5">
              <h3 className="text-lg font-black text-slate-950">
                Sprint 2
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                <li>• Journal d’audit centralisé pour tracer les actions sensibles.</li>
                <li>• Contrôles de validation des mots de passe renforcés.</li>
                <li>• Journalisation des connexions, déconnexions et refus d’accès.</li>
              </ul>
            </article>

            <article className="rounded-3xl bg-slate-50 p-5 lg:col-span-2">
              <h3 className="text-lg font-black text-slate-950">
                Sprint 3
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                <li>• Centre de sécurité admin avec visibilité sur les événements.</li>
                <li>• Validation stricte des entrées sur les points et interventions.</li>
                <li>• Principe du moindre privilège appliqué dans les routes.</li>
              </ul>
            </article>
          </div>

          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-relaxed text-emerald-800">
            La MFA n’est pas incluse dans cette version. La CSP reste réservée
            au build de preview / production pour ne pas bloquer le chargement
            en développement.
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Journal d’audit
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Derniers événements de sécurité enregistrés.
              </p>
            </div>

            <p className="text-sm font-medium text-slate-500">
              {logs.length} événement(s) chargé(s)
            </p>
          </div>

          {isLoading && (
            <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-slate-600">
              Chargement du journal d’audit...
            </div>
          )}

          {isError && (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
              {(error as Error)?.message ||
                'Impossible de charger les événements de sécurité.'}
            </div>
          )}

          {!isLoading && !isError && logs.length === 0 && (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              Aucun événement de sécurité pour le moment.
            </div>
          )}

          <div className="mt-6 space-y-4">
            {logs.map((log) => (
              <article
                key={log.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-slate-950">
                        {log.action}
                      </h3>

                      <span
                        className={[
                          'rounded-full px-3 py-1 text-xs font-bold ring-1',
                          getSeverityClass(log.severity),
                        ].join(' ')}
                      >
                        {log.severity || 'info'}
                      </span>

                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">
                        {log.success === false ? 'Échec' : 'Succès'}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {log.actor_name || log.actor_email || log.actor_id || 'Système'}
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {stringifyDetails(log.details)}
                    </p>
                  </div>

                  <div className="shrink-0 text-sm font-semibold text-slate-500">
                    {formatDate(log.created_at)}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                  {log.resource_type && (
                    <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                      Ressource: {log.resource_type}
                    </span>
                  )}
                  {log.resource_id && (
                    <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                      ID: {log.resource_id}
                    </span>
                  )}
                  {log.actor_role && (
                    <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                      Rôle: {log.actor_role}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
