import { z } from 'zod'
import { ApiError, apiRequest } from '../../../shared/api'
import type { GetObservationResponses } from '../../../shared/api/generated'
import { observationDetailsResponseSchema, observationDetailsSchema } from '../model/observation'

const apiObservationDetailsResponseSchema = z.object({
  item: observationDetailsSchema,
})

export async function getObservation(observationId: string) {
  try {
    const response: GetObservationResponses[200] = await apiRequest(
      `/observations/${encodeURIComponent(observationId)}`,
      apiObservationDetailsResponseSchema,
    )

    return observationDetailsResponseSchema.parse({ item: response.item })
  } catch (error) {
    if (error instanceof ApiError && error.code === 'OBSERVATION_NOT_FOUND') {
      return observationDetailsResponseSchema.parse({ item: null })
    }
    throw error
  }
}
