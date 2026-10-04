import { apiRequest } from '../../../shared/api'
import type { ListAnimalsResponses } from '../../../shared/api/generated'
import { animalListResponseSchema } from '../model/animal'

export async function getAnimals() {
  const response: ListAnimalsResponses[200] = await apiRequest('/animals', animalListResponseSchema)
  return response
}
