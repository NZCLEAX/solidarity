import type { ReactNode } from 'react'

/* Styles communs des formulaires PULSE (points, interventions). */

export const formFieldClass =
  'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition focus:border-[#d94a0b] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500'

export const formLabelClass =
  'mb-1 block text-sm font-medium text-slate-700'

// Pastille de choix (types d'aide, besoins observés).
export function chipClass(selected: boolean) {
  return `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
    selected
      ? 'border-[#d94a0b] bg-orange-50 text-orange-700'
      : 'border-slate-300 text-slate-700'
  }`
}

// Barre récapitulative + bouton, au-dessus de la barre
// de navigation du téléphone.
export const formFooterClass =
  'border-t border-slate-200 pb-6 pt-4'
  
export default function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: number
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-slate-200 py-5">
      <h2 className="text-base font-semibold text-slate-950">
        <span className="mr-2 text-slate-400">{number}.</span>
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}

      <div className="mt-3">{children}</div>
    </section>
  )
}
