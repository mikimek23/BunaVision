import { z } from 'zod'

export const errorCodeSchema = z.string()

export const apiErrorBodySchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
    request_id: z.string().nullable().optional(),
    assessment_id: z.string().nullable().optional(),
    details: z.unknown().optional(),
  }),
})

export function createPaginatedListResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    page_size: z.number().int().positive(),
    has_more: z.boolean(),
  })
}
