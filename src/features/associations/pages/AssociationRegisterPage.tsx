import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { createAssociationRequest } from '@/features/associations/api/associations'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{15,}$/

export default function AssociationRegisterPage() {
  const navigate = useNavigate()

  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telephone, setTelephone] = useState('')
  const [ville, setVille] = useState('')
  const [zoneAction, setZoneAction] = useState('')
  const [typeAidePrincipale, setTypeAidePrincipale] = useState('')
  const [description, setDescription] = useState('')

  const mutation = useMutation({
    mutationFn: createAssociationRequest,
    onSuccess: () => {
      navigate('/profile')
    },
  })

  const isPasswordValid = passwordRegex.test(password)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isPasswordValid) return

    mutation.mutate({
      nom,
      email,
      password,
      telephone,
      ville,
      zoneAction,
      typeAidePrincipale,
      description,
    })
  }

  return (
    <div className="min-h-screen bg-[#faf8f4] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-orange-200 bg-white p-8 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d94a0b] text-xl font-black text-white">
            ♡
          </div>

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
            Association
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950">
            Demander un accès association
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Crée un compte association. La demande sera mise en attente jusqu’à
            validation par un administrateur.
          </p>

          <div className="mt-8 rounded-3xl bg-orange-50 p-5 text-sm font-semibold leading-relaxed text-orange-800">
            Une fois validée, ton association pourra accéder à la carte, aux
            points, aux interventions et aux demandes bénévoles.
          </div>

          <div className="mt-6 text-sm text-slate-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-black text-[#d94a0b]">
              Se connecter
            </Link>
          </div>

          <div className="mt-2 text-sm text-slate-600">
            Tu es citoyen ou bénévole ?{' '}
            <Link to="/register" className="font-black text-[#d94a0b]">
              Créer un compte simple
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Informations de l’association
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Remplis les informations principales pour créer la demande.
              </p>
            </div>

            {mutation.isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {(mutation.error as Error)?.message ||
                  'Impossible de créer la demande association.'}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Nom de l’association
                </label>

                <input
                  value={nom}
                  onChange={(event) => setNom(event.target.value)}
                  required
                  placeholder="Ex : SOAD"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Email
                </label>

                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  placeholder="contact@association.fr"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Téléphone
                </label>

                <input
                  value={telephone}
                  onChange={(event) => setTelephone(event.target.value)}
                  placeholder="06 00 00 00 00"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Ville
                </label>

                <input
                  value={ville}
                  onChange={(event) => setVille(event.target.value)}
                  placeholder="Ex : Goussainville"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Zone d’action
                </label>

                <input
                  value={zoneAction}
                  onChange={(event) => setZoneAction(event.target.value)}
                  placeholder="Ex : Val-d’Oise"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Type d’aide principale
                </label>

                <select
                  value={typeAidePrincipale}
                  onChange={(event) =>
                    setTypeAidePrincipale(event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                >
                  <option value="">Sélectionner</option>
                  <option value="Repas">Repas</option>
                  <option value="Maraude">Maraude</option>
                  <option value="Vêtements">Vêtements</option>
                  <option value="Hygiène">Hygiène</option>
                  <option value="Santé">Santé</option>
                  <option value="Hébergement">Hébergement</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Mot de passe
                </label>

                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  placeholder="Minimum 15 caractères, majuscule, minuscule, chiffre"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                />

                <p
                  className={`mt-2 text-xs font-semibold ${
                    password.length === 0
                      ? 'text-slate-500'
                      : isPasswordValid
                        ? 'text-emerald-600'
                        : 'text-red-600'
                  }`}
                >
                  Minimum 15 caractères avec au moins une majuscule, une
                  minuscule et un chiffre.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  placeholder="Présente rapidement l’association, ses missions et son fonctionnement..."
                  className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || !isPasswordValid}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {mutation.isPending
                ? 'Création en cours...'
                : 'Envoyer la demande association'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}