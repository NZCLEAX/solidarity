import { useMemo, useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { getCurrentProfile } from '@/features/admin/api/users'
import {
  createAssociation,
  getAssociations,
  updateAssociation,
  type Association,
  type AssociationStatus,
} from '@/features/admin/api/associations'
import { formatDate, formatLabel } from '../../../utils/formatters'

const statusValues: [AssociationStatus, ...AssociationStatus[]] = ['en_attente', 'active', 'suspendue', 'archivee']

const associationSchema = z.object({
  nom: z.string().min(1, { message: 'Le nom de l’association est obligatoire.' }),
  description: z.string().optional(),
  email: z.string().email({ message: 'L’email est invalide.' }).optional().or(z.literal('')),
  telephone: z.string().optional(),
  ville: z.string().optional(),
  zoneAction: z.string().optional(),
  typeAidePrincipale: z.string().optional(),
  statut: z.enum(statusValues),
})

type AssociationFormValues = z.infer<typeof associationSchema>

const emptyForm: AssociationFormValues = {
  nom: '',
  description: '',
  email: '',
  telephone: '',
  ville: '',
  zoneAction: '',
  typeAidePrincipale: '',
  statut: 'en_attente',
}

const statusOptions: Array<{
  label: string
  value: AssociationStatus
}> = [
  { label: 'En attente', value: 'en_attente' },
  { label: 'Active', value: 'active' },
  { label: 'Suspendue', value: 'suspendue' },
  { label: 'Archivée', value: 'archivee' },
]

export default function AdminAssociationsPage() {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [editingAssociation, setEditingAssociation] =
    useState<Association | null>(null)

  const {
    data: currentProfile,
    isLoading: currentProfileLoading,
    isError: currentProfileError,
    error: currentProfileErrorDetails,
  } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
  })

  const isAdmin = currentProfile?.role === 'admin'

  const {
    data: associations = [],
    isLoading: associationsLoading,
    isError: associationsError,
    error: associationsErrorDetails,
  } = useQuery({
    queryKey: ['admin-associations'],
    queryFn: getAssociations,
    enabled: isAdmin,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssociationFormValues>({
    resolver: zodResolver(associationSchema),
    defaultValues: emptyForm,
  })

  const createMutation = useMutation({
    mutationFn: (data: AssociationFormValues) => {
      const inputForApi = {
        ...data,
        description: data.description || '',
        email: data.email || '',
        telephone: data.telephone || '',
        ville: data.ville || '',
        zoneAction: data.zoneAction || '',
        typeAidePrincipale: data.typeAidePrincipale || '',
      }
      return createAssociation(inputForApi)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-associations'] })
      reset(emptyForm)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      associationId,
      input,
    }: {
      associationId: string;
      input: AssociationFormValues;
    }) => {
      const inputForApi = {
        ...input,
        description: input.description || '',
        email: input.email || '',
        telephone: input.telephone || '',
        ville: input.ville || '',
        zoneAction: input.zoneAction || '',
        typeAidePrincipale: input.typeAidePrincipale || '',
      }
      return updateAssociation(associationId, inputForApi)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-associations'] })
      setEditingAssociation(null)
      reset(emptyForm)
    },
  })

  const filteredAssociations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) return associations

    return associations.filter((association) => {
      const content = [
        association.nom,
        association.email,
        association.ville,
        association.zone_action,
        association.type_aide_principale,
        association.statut,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return content.includes(normalizedSearch)
    })
  }, [associations, searchTerm])

  useEffect(() => {
    if (editingAssociation) {
      reset({
        nom: editingAssociation.nom || '',
        description: editingAssociation.description || '',
        email: editingAssociation.email || '',
        telephone: editingAssociation.telephone || '',
        ville: editingAssociation.ville || '',
        zoneAction: editingAssociation.zone_action || '',
        typeAidePrincipale: editingAssociation.type_aide_principale || '',
        statut: (editingAssociation.statut as AssociationStatus) || 'en_attente',
      })
    } else {
      reset(emptyForm)
    }
  }, [editingAssociation, reset])

  const handleCancelEdit = () => {
    setEditingAssociation(null)
  }

  const onSubmit: SubmitHandler<AssociationFormValues> = (data) => {
    if (editingAssociation) {
      updateMutation.mutate({ associationId: editingAssociation.id, input: data })
    } else {
      createMutation.mutate(data)
    }
  }

  if (currentProfileLoading) {
    return (
      <div className="rounded-xl bg-white p-6 text-slate-600">
        Vérification des droits administrateur...
      </div>
    )
  }

  if (currentProfileError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {(currentProfileErrorDetails as Error)?.message ||
          'Impossible de vérifier ton profil.'}
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Accès refusé. Cette page est réservée aux administrateurs.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Gestion des associations
          </h1>
          <p className="mt-2 text-slate-600">
            Administration des associations partenaires et de leur statut.
          </p>
        </div>

        <Link
          to="/administration"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Gestion des utilisateurs
        </Link>
      </div>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          {editingAssociation
            ? 'Modifier une association'
            : 'Ajouter une association'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <input
                type="text"
                {...register('nom')}
                placeholder="Nom de l’association *"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>}
            </div>

            <div>
              <input
                type="email"
                {...register('email')}
                placeholder="Email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <input
              type="text"
              {...register('telephone')}
              placeholder="Téléphone"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />

            <input
              type="text"
              {...register('ville')}
              placeholder="Ville"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />

            <input
              type="text"
              {...register('zoneAction')}
              placeholder="Zone d’action"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />

            <input
              type="text"
              {...register('typeAidePrincipale')}
              placeholder="Type d’aide principale"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />

            <select
              {...register('statut')}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            {...register('description')}
            placeholder="Description"
            rows={3}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />

          {(createMutation.isError || updateMutation.isError) && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {(createMutation.error as Error)?.message ||
                (updateMutation.error as Error)?.message ||
                'Erreur lors de l’enregistrement de l’association.'}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting
                ? 'Enregistrement...'
                : editingAssociation
                  ? 'Mettre à jour'
                  : 'Créer l’association'}
            </button>

            {editingAssociation && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-lg border border-slate-300 px-5 py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-md">
            <label className="block text-sm font-medium text-slate-700">
              Rechercher une association
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nom, ville, email, statut..."
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <p className="text-sm text-slate-500">
            {filteredAssociations.length} association(s) affichée(s) sur{' '}
            {associations.length}
          </p>
        </div>
      </section>

      {associationsLoading && (
        <div className="rounded-xl bg-white p-6 text-slate-600">
          Chargement des associations...
        </div>
      )}

      {associationsError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {(associationsErrorDetails as Error)?.message ||
            'Erreur lors du chargement des associations.'}
        </div>
      )}

      {!associationsLoading &&
        !associationsError &&
        filteredAssociations.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
            Aucune association trouvée.
          </div>
        )}

      {!associationsLoading &&
        !associationsError &&
        filteredAssociations.length > 0 && (
          <div className="grid gap-4">
            {filteredAssociations.map((association) => (
              <article
                key={association.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      {association.nom || 'Association sans nom'}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {association.email || 'Email non renseigné'}
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    {formatLabel(association.statut)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs uppercase text-slate-500">Ville</p>
                    <p className="mt-1 font-semibold">
                      {association.ville || 'Non renseignée'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs uppercase text-slate-500">
                      Zone d’action
                    </p>
                    <p className="mt-1 font-semibold">
                      {association.zone_action || 'Non renseignée'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs uppercase text-slate-500">
                      Aide principale
                    </p>
                    <p className="mt-1 font-semibold">
                      {association.type_aide_principale || 'Non renseignée'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs uppercase text-slate-500">
                      Créée le
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatDate(association.created_at)}
                    </p>
                  </div>
                </div>

                {association.description &&
                  association.description.trim().length > 0 && (
                    <p className="mt-4 text-sm text-slate-700">
                      <span className="font-medium">Description :</span>{' '}
                      {association.description}
                    </p>
                  )}

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setEditingAssociation(association)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Modifier
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
    </div>
  )
}