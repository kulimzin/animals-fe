import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  observationDetailsQueryKey,
  observationsQueryKey,
  voteObservation,
  type ObservationVote,
} from '../../../entities/observation'

export function useVoteObservation(observationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vote: ObservationVote) => voteObservation(observationId, vote),
    onSuccess: (observation) => {
      queryClient.setQueryData(observationDetailsQueryKey(observationId), {
        item: observation,
      })
      void queryClient.invalidateQueries({ queryKey: observationsQueryKey })
    },
  })
}
