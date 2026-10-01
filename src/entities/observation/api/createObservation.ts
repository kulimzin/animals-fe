import { z } from 'zod'
import { apiRequest } from '../../../shared/api'
import {
  createObservationInputSchema,
  observationDetailsSchema,
  type CreateObservationInput,
} from '../model/observation'

const createObservationResponseSchema = z.object({
  data: observationDetailsSchema,
})

export async function createObservation(input: CreateObservationInput) {
  const observationInput = createObservationInputSchema.parse(input)
  const response = await apiRequest('/observations', createObservationResponseSchema, {
    method: 'POST',
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({
      animalId: observationInput.animalId,
      location: {
        longitude: observationInput.location.longitude,
        latitude: observationInput.location.latitude,
      },
      observedAt: observationInput.observedAt,
      locationLabel: observationInput.location.label,
      note: observationInput.note,
    }),
  })

  return response.data
}
