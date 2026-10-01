import { z } from 'zod'
import { ApiError, apiRequest } from '../../../shared/api'
import { observationDetailsResponseSchema, observationDetailsSchema } from '../model/observation'

const apiObservationDetailsResponseSchema = z.object({
  data: observationDetailsSchema,
})

export async function getObservation(observationId: string) {
  try {
    const response = await apiRequest(
      `/observations/${encodeURIComponent(observationId)}`,
      apiObservationDetailsResponseSchema,
    )

    return observationDetailsResponseSchema.parse({ item: response.data })
  } catch (error) {
    if (error instanceof ApiError && error.code === 'OBSERVATION_NOT_FOUND') {
      return observationDetailsResponseSchema.parse({ item: null })
    }
    throw error
  }
}
