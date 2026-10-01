import { z } from 'zod'

export const animalSchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1),
  name: z.object({
    ru: z.string().min(1),
    en: z.string().min(1),
  }),
  icon: z.string().min(1),
})

export const animalListResponseSchema = z.object({
  items: z.array(animalSchema),
})

export type Animal = z.infer<typeof animalSchema>
