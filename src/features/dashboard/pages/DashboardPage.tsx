import { useAuth } from '@/features/auth/auth-context'
import { usePermissions } from '@/features/auth/hooks/usePermissions'

export function DashboardPage() {
  const { user } = useAuth()
  const { list } = usePermissions()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-500">Vue d'ensemble des droits du role connecte.</p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-800">Role actif: {user?.role}</p>
        <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">Permissions actives</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
          {list.length === 0 ? <li>Aucune permission</li> : list.map((permission) => <li key={permission}>{permission}</li>)}
        </ul>
      </div>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Regle transversale: les donnees sensibles sont refusees par defaut et les couches cartographiques sensibles sont interdites au role citoyen.
      </div>
    </div>
  )
}
