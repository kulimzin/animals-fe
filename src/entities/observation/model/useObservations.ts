import { skipToken, useQuery } from '@tanstack/react-query'
import { getObservations } from '../api/getObservations'
import type { ObservationMapQuery } from './observation'

export const observationsQueryKey = ['observations'] as const

export function useObservations(query: ObservationMapQuery | null) {
  return useQuery({
    queryKey: [...observationsQueryKey, query],
    queryFn: query ? () => getObservations(query) : skipToken,
    select: (response) => response.items,
  })
}
