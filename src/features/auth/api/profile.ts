
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/features/auth/utils/roles'

export type CurrentProfile = {
  id: string
  email: string | null
  nom: string | null
  role: UserRole | null
  association_id: string | null
  association_nom: string | null
  statut_compte: string | null
  created_at: string | null
  updated_at: string | null
}

function isValidRole(value: unknown): value is UserRole {
  return (
    value === 'citoyen' ||
    value === 'benevole' ||
    value === 'association' ||
    value === 'moderateur' ||
    value === 'admin'
  )
}

export async function getCurrentProfile(): Promise<CurrentProfile> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    throw sessionError
  }

  if (!session?.user) {
    throw new Error('Utilisateur non connecté.')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      nom,
      role,
      association_id,
      statut_compte,
      created_at,
      updated_at
    `)
    .eq('id', session.user.id)
    .maybeSingle()

  if (error) {
    throw error
  }

  // Aucun profil enregistré : aucun rôle attribué par défaut.
  if (!profile) {
    return {
      id: session.user.id,
      email: session.user.email ?? null,
      nom:
        session.user.user_metadata?.nom ??
        session.user.user_metadata?.name ??
        null,
      role: null,
      association_id: null,
      association_nom: null,
      statut_compte: null,
      created_at: null,
      updated_at: null,
    }
  }

  // Récupération du nom de l'association.
  let associationNom: string | null = null

  if (profile.association_id) {
    const {
      data: association,
      error: associationError,
    } = await supabase
      .from('associations')
      .select('nom')
      .eq('id', profile.association_id)
      .maybeSingle()

    if (associationError) {
      console.error(
        "Impossible de récupérer le nom de l'association :",
        associationError
      )
    } else {
      associationNom = association?.nom ?? null
    }
  }

  return {
    id: profile.id,
    email: profile.email ?? session.user.email ?? null,
    nom: profile.nom ?? null,
    role: isValidRole(profile.role) ? profile.role : null,
    association_id: profile.association_id ?? null,
    association_nom: associationNom,
    statut_compte: profile.statut_compte ?? null,
    created_at: profile.created_at ?? null,
    updated_at: profile.updated_at ?? null,
  }
}

/**
 * Enregistre le rôle choisi lors de la première connexion sociale.
 * Les comptes ayant déjà un rôle le conservent.
 */
export async function savePublicRole(
  role: 'citoyen' | 'benevole'
): Promise<CurrentProfile> {
  if (role !== 'citoyen' && role !== 'benevole') {
    throw new Error('Le rôle sélectionné est invalide.')
  }
  // Le serveur ne modifie que les comptes tout juste créés.
  const { error } = await supabase.rpc('set_initial_public_role', {
    p_role: role,
  })

  if (error) {
    throw error
  }
  return getCurrentProfile()
}
