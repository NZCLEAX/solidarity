import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  createAssociationRequest,
  uploadAssociationDocuments,
  type AssociationDocumentType,
} from '@/features/associations/api/associations'
import {
  verifyOfficialAssociation,
  type OfficialAssociationData,
} from '@/features/associations/api/officialVerification'
import { verifyAssociationDossier } from '@/features/associations/services/verificationService'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{15,}$/

const documentLabels: Array<{
  type: AssociationDocumentType
  label: string
  required: boolean
}> = [
  { type: 'statuts', label: 'Statuts de l’association', required: true },
  { type: 'recepisse', label: 'Récépissé de déclaration', required: true },
  { type: 'pv_bureau', label: 'PV de nomination du bureau', required: true },
]

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
  const [siren, setSiren] = useState('')
  const [siret, setSiret] = useState('')
  const [representantNom, setRepresentantNom] = useState('')
  const [representantFonction, setRepresentantFonction] = useState('')
  const [officialData, setOfficialData] =
    useState<OfficialAssociationData | null>(null)
  const [verifyError, setVerifyError] = useState('')
  const [documents, setDocuments] = useState<
    Partial<Record<AssociationDocumentType, File>>
  >({})

  const verificationMutation = useMutation({
    mutationFn: async () => {
      const query = siret.trim() || siren.trim() || nom.trim()

      if (!query) {
        throw new Error('Renseigne au moins un SIRET, un SIREN ou un nom.')
      }

      const result = await verifyOfficialAssociation(query)

      if (!result) {
        throw new Error('Aucune donnée officielle trouvée.')
      }

      return result
    },
    onSuccess: (result) => {
      setOfficialData(result)
      setVerifyError('')

      if (result.officialName) setNom(result.officialName)
      if (result.officialCity) setVille(result.officialCity)
      if (result.officialSiren) setSiren(result.officialSiren)
      if (result.officialSiret) setSiret(result.officialSiret)
    },
    onError: (error) => {
      setOfficialData(null)
      setVerifyError(
        (error as Error)?.message ||
          'Impossible de vérifier automatiquement.'
      )
    },
  })

 const createMutation = useMutation({
  mutationFn: async () => {
    const filesToUpload = Object.entries(documents)
      .filter(([, file]) => Boolean(file))
      .map(([type, file]) => ({
        type: type as AssociationDocumentType,
        file: file as File,
      }))

    const requiredMissing = documentLabels.some(
      (item) => item.required && !documents[item.type]
    )

    if (requiredMissing) {
      throw new Error(
        'Les statuts, le récépissé et le PV du bureau sont obligatoires.'
      )
    }

    const verification = await verifyAssociationDossier(
      {
        nom,
        siren,
        siret,
        representantNom,
        officialData,
      },
      documents
    )

    if (verification.score < 50) {
      throw new Error(
        `Dossier trop incomplet. Score : ${verification.score}/100. ${verification.notes.join(
          ' '
        )}`
      )
    }

    const associationId = await createAssociationRequest({
      nom,
      email,
      password,
      telephone,
      ville,
      zoneAction,
      typeAidePrincipale,
      description,
      siren,
      siret,
      representantNom,
      representantFonction,
      officialData,
    })

    await uploadAssociationDocuments(associationId, filesToUpload)

    return associationId
  },
  onSuccess: () => {
    navigate('/profile')
  },
})

  const isPasswordValid = passwordRegex.test(password)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isPasswordValid) return

    createMutation.mutate()
  }

  function handleDocumentChange(
    type: AssociationDocumentType,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) return

    setDocuments((current) => ({
      ...current,
      [type]: file,
    }))
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
            Crée ton dossier avec SIREN/SIRET, informations officielles et
            documents justificatifs.
          </p>

          <div className="mt-8 rounded-3xl bg-orange-50 p-5 text-sm font-semibold leading-relaxed text-orange-800">
            Documents obligatoires : statuts, récépissé de déclaration et PV du
            bureau.
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Informations de l’association
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Renseigne les informations principales et vérifie-les
                automatiquement.
              </p>
            </div>

            {createMutation.isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {(createMutation.error as Error)?.message ||
                  'Impossible de créer la demande association.'}
              </div>
            )}

            {verifyError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {verifyError}
              </div>
            )}

            {officialData && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                Données officielles trouvées :{' '}
                {officialData.officialName || 'Nom non renseigné'} —{' '}
                {officialData.officialCity || 'Ville non renseignée'} — SIREN{' '}
                {officialData.officialSiren || 'non renseigné'}
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
                  placeholder="Ex : HUMAN'S LIFE"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Email de contact
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

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  SIRET
                </label>

                <input
                  value={siret}
                  onChange={(event) => setSiret(event.target.value)}
                  placeholder="14 chiffres"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  SIREN
                </label>

                <input
                  value={siren}
                  onChange={(event) => setSiren(event.target.value)}
                  placeholder="9 chiffres"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="flex items-end sm:col-span-2">
                <button
                  type="button"
                  onClick={() => verificationMutation.mutate()}
                  disabled={verificationMutation.isPending}
                  className="min-h-12 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-black text-[#d94a0b] transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {verificationMutation.isPending
                    ? 'Vérification...'
                    : 'Vérifier automatiquement'}
                </button>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Représentant
                </label>

                <input
                  value={representantNom}
                  onChange={(event) => setRepresentantNom(event.target.value)}
                  placeholder="Nom du président / responsable"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Fonction du représentant
                </label>

                <input
                  value={representantFonction}
                  onChange={(event) =>
                    setRepresentantFonction(event.target.value)
                  }
                  placeholder="Président, trésorier..."
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

            <div className="rounded-[2rem] border border-[#eadfd6] bg-slate-50 p-5">
              <h3 className="text-xl font-black text-slate-950">
                Documents justificatifs
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                PDF uniquement, 10 Mo maximum par fichier.
              </p>

              <div className="mt-5 grid gap-4">
                {documentLabels.map((document) => (
                  <label
                    key={document.type}
                    className="rounded-2xl border border-slate-300 bg-white p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-slate-950">
                          {document.label}{' '}
                          {document.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {documents[document.type]?.name ||
                            'Aucun fichier sélectionné'}
                        </p>
                      </div>

                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(event) =>
                          handleDocumentChange(document.type, event)
                        }
                        className="text-sm"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending || !isPasswordValid}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {createMutation.isPending
                ? 'Création du dossier...'
                : 'Envoyer le dossier association'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}