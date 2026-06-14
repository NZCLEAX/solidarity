import { usePermissions } from '@/features/auth/hooks/usePermissions'

export function AdminPage() {
  const { can } = usePermissions()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
      <p className="mt-2 text-sm text-gray-500">Parametres sensibles de la plateforme.</p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        <p>Acces admin: {can('admin.access') ? 'autorise' : 'interdit'}</p>
        <p className="mt-2">Exigence securite: 2FA obligatoire pour ce role (a brancher backend/auth provider).</p>
      </div>
    </div>
  )
}
