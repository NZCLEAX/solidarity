import { z } from 'zod'

const trimmedString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)

export const createPointInputSchema = z.object({
  adresse: trimmedString(3, 200),
  latitude: z.number().finite().gte(-90).lte(90),
  longitude: z.number().finite().gte(-180).lte(180),
  nombrePersonnesEstime: z.number().int().positive().max(100000),
  typologie: z.string().trim().max(120).optional().or(z.literal('')),
  besoins: z
    .array(trimmedString(1, 50))
    .min(1)
    .max(10),
  niveauUrgence: z.enum(['basse', 'moyenne', 'haute', 'critique']),
  commentaire: z.string().trim().max(1000).optional().or(z.literal('')),
})

export const updatePointInputSchema = createPointInputSchema.extend({
  statut: z.enum([
    'signale',
    'a_confirmer',
    'confirme',
    'actif',
    'inactif',
    'archive',
    'rejete',
  ]),
})

export const createInterventionInputSchema = z.object({
  pointId: z.string().uuid(),
  dateIntervention: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/),
  heureDebut: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/),
  heureFin: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/),
  typeAide: trimmedString(2, 200),
  nombreRepas: z.number().int().min(0).max(100000),
  nombreBenevoles: z.number().int().positive().max(100000),
  commentaire: z.string().trim().max(1000).optional(),
})

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => issue.message).join(' ')
}
