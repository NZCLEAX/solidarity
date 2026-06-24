import { z } from 'zod'

const noHtmlTags = (value: string) => !/[<>]/.test(value)

export const reportMessageSchema = z
  .string()
  .trim()
  .min(20, 'Le signalement doit contenir au moins 20 caracteres')
  .max(500, 'Le signalement ne doit pas depasser 500 caracteres')
  .refine(noHtmlTags, 'Les balises HTML ne sont pas autorisees')

export const reportFormSchema = z.object({
  message: reportMessageSchema,
})

export const interventionCommentSchema = z.object({
  comment: z
    .string()
    .trim()
    .min(10, 'Le commentaire doit contenir au moins 10 caracteres')
    .max(300, 'Le commentaire ne doit pas depasser 300 caracteres')
    .refine(noHtmlTags, 'Les balises HTML ne sont pas autorisees'),
})

export const pointSubmissionSchema = z.object({
  adresse: z
    .string()
    .trim()
    .min(3, 'L\'adresse doit contenir au moins 3 caracteres')
    .max(120, 'L\'adresse ne doit pas depasser 120 caracteres')
    .refine(noHtmlTags, 'Les balises HTML ne sont pas autorisees'),
  latitude: z.number().finite('La latitude doit etre un nombre valide'),
  longitude: z.number().finite('La longitude doit etre un nombre valide'),
  nombrePersonnesEstime: z.number().int().positive('Le nombre de personnes doit etre superieur a 0'),
  typologie: z
    .string()
    .trim()
    .max(120, 'La typologie ne doit pas depasser 120 caracteres')
    .refine(noHtmlTags, 'Les balises HTML ne sont pas autorisees')
    .optional()
    .or(z.literal('')),
  niveauUrgence: z.enum(['basse', 'moyenne', 'haute', 'critique']),
  besoins: z.array(z.string().trim().min(1)).min(1, 'Selectionne au moins un besoin'),
  commentaire: z
    .string()
    .trim()
    .max(500, 'Le commentaire ne doit pas depasser 500 caracteres')
    .refine(noHtmlTags, 'Les balises HTML ne sont pas autorisees')
    .optional()
    .or(z.literal('')),
})

export const interventionSubmissionSchema = z.object({
  pointId: z.string().uuid('Le point selectionne est invalide'),
  dateIntervention: z.string().min(1, 'La date d\'intervention est obligatoire'),
  heureDebut: z.string().min(1, 'L\'heure de debut est obligatoire'),
  heureFin: z.string().min(1, 'L\'heure de fin est obligatoire'),
  typeAide: z
    .string()
    .trim()
    .min(3, 'Le type d\'aide doit contenir au moins 3 caracteres')
    .max(120, 'Le type d\'aide ne doit pas depasser 120 caracteres')
    .refine(noHtmlTags, 'Les balises HTML ne sont pas autorisees'),
  nombreRepas: z.number().int().min(0, 'Le nombre de repas doit etre valide'),
  nombreBenevoles: z.number().int().positive('Le nombre de benevoles doit etre superieur a 0'),
  commentaire: z
    .string()
    .trim()
    .max(500, 'Le commentaire ne doit pas depasser 500 caracteres')
    .refine(noHtmlTags, 'Les balises HTML ne sont pas autorisees')
    .optional()
    .or(z.literal('')),
})

export const pointUpdateSchema = pointSubmissionSchema.extend({
  statut: z.enum(['signale', 'a_confirmer', 'confirme', 'actif', 'inactif', 'archive']),
})

export type ReportFormValues = z.infer<typeof reportFormSchema>
export type InterventionCommentValues = z.infer<typeof interventionCommentSchema>
export type PointSubmissionValues = z.infer<typeof pointSubmissionSchema>
export type InterventionSubmissionValues = z.infer<typeof interventionSubmissionSchema>
export type PointUpdateValues = z.infer<typeof pointUpdateSchema>
