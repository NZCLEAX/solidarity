export function MfaRequiredPage() {
  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
      <h1 className="mb-3 text-2xl font-bold text-gray-900">MFA requis</h1>
      <p className="text-sm text-gray-600">
        Ce compte admin doit activer la double authentification (2FA/MFA) avant d&apos;acceder a
        l&apos;application.
      </p>
      <p className="mt-4 text-xs text-gray-500">
        Activez MFA dans Supabase Auth, puis reconnectez-vous.
      </p>
    </div>
  )
}
