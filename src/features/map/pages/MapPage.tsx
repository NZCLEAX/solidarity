import { usePermissions } from '@/features/auth/hooks/usePermissions'

export function MapPage() {
  const { can } = usePermissions()
  const canViewSensitiveLayers = can('map.view_sensitive_layers')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Carte</h1>
      <p className="mt-2 text-sm text-gray-500">Carte des interventions.</p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-800">Couches actives</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>Carte publique (safe): visible pour tous les roles connectes</li>
          <li className={canViewSensitiveLayers ? 'text-gray-600' : 'font-medium text-amber-700'}>
            Zones sensibles (risques/pauvrete): {canViewSensitiveLayers ? 'autorisees' : 'interdites pour votre role'}
          </li>
        </ul>
      </div>
    </div>
  )
}
