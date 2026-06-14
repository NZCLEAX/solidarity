import { usePermissions } from '@/features/auth/hooks/usePermissions'

export function InterventionsPage() {
  const { can } = usePermissions()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Interventions</h1>
      <p className="mt-2 text-sm text-gray-500">Operations terrain selon votre role.</p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>
            Prendre et mettre a jour des interventions: {can('interventions.manage') ? 'autorise' : 'interdit'}
          </li>
          <li>Commenter une intervention: {can('interventions.comment') ? 'autorise' : 'interdit'}</li>
        </ul>
      </div>
    </div>
  )
}
