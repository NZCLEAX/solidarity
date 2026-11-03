import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { getOpenContentReports } from '@/features/moderation/api/contentReports'

// Ligne « Contenus signalés : N à traiter » avec un lien vers la page
// Modération. Utilisée sur la page Administration.
export default function OpenReportsLink() {
  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['signalements-contenu'],
    queryFn: getOpenContentReports,
  })

  const count = reports.length

  return (
    <section className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-y border-slate-200 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-950">
          Contenus signalés par les utilisateurs
        </p>

        <p className="mt-0.5 text-sm text-slate-500">
          {isLoading
            ? 'Chargement...'
            : error
              ? (error as Error).message
              : count === 0
                ? 'Aucun signalement à traiter.'
                : `${count} signalement${count > 1 ? 's' : ''} à traiter.`}
        </p>
      </div>

      <Link
        to="/moderation"
        className="text-sm font-semibold text-[#d94a0b]"
      >
        Ouvrir la modération →
      </Link>
    </section>
  )
}
