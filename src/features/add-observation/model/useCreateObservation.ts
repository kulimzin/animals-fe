import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createObservation,
  observationsQueryKey,
  type CreateObservationInput,
} from '../../../entities/observation'

export function useCreateObservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateObservationInput) => createObservation(input),
    onSuccess: () => queryClient.refetchQueries({ queryKey: observationsQueryKey, type: 'active' }),
  })
}
