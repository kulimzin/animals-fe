import { apiRequest } from '../../../shared/api'
import type { ListObservationsData, ListObservationsResponses } from '../../../shared/api/generated'
import { observationMapResponseSchema, type ObservationMapQuery } from '../model/observation'

export async function getObservations(query: ObservationMapQuery) {
  const parameters: ListObservationsData['query'] = {
    animalIds: query.animalIds.join(','),
    period: query.period,
    west: query.bounds.west,
    south: query.bounds.south,
    east: query.bounds.east,
    north: query.bounds.north,
  }
  const searchParams = new URLSearchParams({
    animalIds: parameters.animalIds,
    period: parameters.period,
    west: String(parameters.west),
    south: String(parameters.south),
    east: String(parameters.east),
    north: String(parameters.north),
  })

  const response: ListObservationsResponses[200] = await apiRequest(
    `/observations?${searchParams}`,
    observationMapResponseSchema,
  )
  return response
}
