export default function NotificationsPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d94a0b]">
          Alertes
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Notifications
        </h1>

        <p className="mt-3 text-sm font-semibold text-slate-500">
          Les alertes importantes apparaîtront ici.
        </p>
      </div>
    </div>
  )
}