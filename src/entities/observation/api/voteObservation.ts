import { z } from 'zod'
import { apiRequest } from '../../../shared/api'
import { observationDetailsSchema, type ObservationVote } from '../model/observation'

const voteObservationResponseSchema = z.object({
  data: observationDetailsSchema,
})

export async function voteObservation(observationId: string, vote: ObservationVote) {
  const response = await apiRequest(
    `/observations/${encodeURIComponent(observationId)}/vote`,
    voteObservationResponseSchema,
    {
      method: 'PUT',
      body: JSON.stringify({ value: vote }),
    },
  )

  return response.data
}
