import { useQuery } from '@tanstack/react-query'
import { getObservation } from '../api/getObservation'

export const observationDetailsQueryKey = (observationId: string) =>
  ['observation', observationId] as const

export function useObservation(observationId: string) {
  return useQuery({
    queryKey: observationDetailsQueryKey(observationId),
    queryFn: () => getObservation(observationId),
    select: (response) => response.item,
  })
}
