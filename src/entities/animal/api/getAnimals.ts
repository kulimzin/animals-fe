import { z } from 'zod'
import { apiRequest } from '../../../shared/api'
import { animalListResponseSchema } from '../model/animal'

const apiAnimalSchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1),
  name: z.object({
    ru: z.string().min(1),
    en: z.string().min(1),
  }),
})

const apiAnimalListResponseSchema = z.object({
  data: z.array(apiAnimalSchema),
})

export async function getAnimals() {
  const response = await apiRequest('/animals', apiAnimalListResponseSchema)

  return animalListResponseSchema.parse({
    items: response.data,
  })
}
