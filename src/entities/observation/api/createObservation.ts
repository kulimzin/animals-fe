import { z } from 'zod'
import { apiRequest } from '../../../shared/api'
import type {
  CreateObservationData,
  CreateObservationResponses,
} from '../../../shared/api/generated'
import {
  createObservationInputSchema,
  observationDetailsSchema,
  type CreateObservationInput,
} from '../model/observation'

const createObservationResponseSchema = z.object({
  item: observationDetailsSchema,
})

export async function createObservation(input: CreateObservationInput) {
  const observationInput = createObservationInputSchema.parse(input)
  const body: CreateObservationData['body'] = {
    animalId: observationInput.animalId,
    location: observationInput.location,
    observedAt: observationInput.observedAt,
    note: observationInput.note,
  }
  const response: CreateObservationResponses[201] = await apiRequest(
    '/observations',
    createObservationResponseSchema,
    {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify(body),
    },
  )

  return response.item
}
