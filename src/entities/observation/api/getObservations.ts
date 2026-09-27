import {
  observationMapResponseSchema,
  type ObservationMapQuery,
  type ObservationPeriod,
} from '../model/observation'
import { mockObservations } from './mockObservations'

const periodDurationMinutes: Record<ObservationPeriod, number> = {
  '1h': 60,
  '24h': 24 * 60,
  '7d': 7 * 24 * 60,
  '30d': 30 * 24 * 60,
}

function isLongitudeInsideBounds(longitude: number, query: ObservationMapQuery) {
  const { east, west } = query.bounds

  return west <= east
    ? longitude >= west && longitude <= east
    : longitude >= west || longitude <= east
}

export function getObservations(query: ObservationMapQuery) {
  const now = Date.now()
  const observations = mockObservations
    .filter((observation) => query.animalIds.includes(observation.animalId))
    .filter((observation) => observation.ageMinutes <= periodDurationMinutes[query.period])
    .filter((observation) => {
      const [longitude, latitude] = observation.coordinates

      return (
        isLongitudeInsideBounds(longitude, query) &&
        latitude >= query.bounds.south &&
        latitude <= query.bounds.north
      )
    })
    .map((observation) => ({
      id: observation.id,
      animalId: observation.animalId,
      location: {
        longitude: observation.coordinates[0],
        latitude: observation.coordinates[1],
      },
      observedAt: new Date(now - observation.ageMinutes * 60_000).toISOString(),
    }))

  return Promise.resolve(observationMapResponseSchema.parse({ items: observations }))
}
