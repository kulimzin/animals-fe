import { z } from 'zod'
import { apiRequest } from '../../../shared/api'
import type { VoteObservationData, VoteObservationResponses } from '../../../shared/api/generated'
import { observationDetailsSchema, type ObservationVote } from '../model/observation'

const voteObservationResponseSchema = z.object({
  item: observationDetailsSchema,
})

export async function voteObservation(observationId: string, vote: ObservationVote) {
  const body: VoteObservationData['body'] = { value: vote }
  const response: VoteObservationResponses[200] = await apiRequest(
    `/observations/${encodeURIComponent(observationId)}/vote`,
    voteObservationResponseSchema,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  )

  return response.item
}
