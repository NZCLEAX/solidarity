import { usePermissions } from '@/features/auth/hooks/usePermissions'

export function ModerationPage() {
  const { can } = usePermissions()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Moderation</h1>
      <p className="mt-2 text-sm text-gray-500">Gestion des contenus signales.</p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        Droit de revue moderation: {can('moderation.review') ? 'autorise' : 'interdit'}
      </div>
    </div>
  )
}
