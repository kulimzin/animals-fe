import { skipToken, useQuery } from '@tanstack/react-query'
import { getObservations } from '../api/getObservations'
import type { ObservationMapQuery } from './observation'

export function useObservations(query: ObservationMapQuery | null) {
  return useQuery({
    queryKey: ['observations', query],
    queryFn: query ? () => getObservations(query) : skipToken,
    select: (response) => response.items,
  })
}
