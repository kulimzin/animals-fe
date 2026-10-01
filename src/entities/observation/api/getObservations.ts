import { apiRequest } from '../../../shared/api'
import { observationMapResponseSchema, type ObservationMapQuery } from '../model/observation'

export function getObservations(query: ObservationMapQuery) {
  const searchParams = new URLSearchParams({
    animalIds: query.animalIds.join(','),
    period: query.period,
    west: String(query.bounds.west),
    south: String(query.bounds.south),
    east: String(query.bounds.east),
    north: String(query.bounds.north),
  })

  return apiRequest(`/observations?${searchParams}`, observationMapResponseSchema)
}
