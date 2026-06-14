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

export type ReportFormValues = z.infer<typeof reportFormSchema>
export type InterventionCommentValues = z.infer<typeof interventionCommentSchema>
