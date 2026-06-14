import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
      <h1 className="mb-3 text-2xl font-bold text-gray-900">Accès interdit</h1>
      <p className="mb-6 text-sm text-gray-600">
        Votre rôle ne permet pas d&apos;accéder à cet écran.
      </p>
      <Link
        to="/"
        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Retour au dashboard
      </Link>
    </div>
  )
}
