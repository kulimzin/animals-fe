import {
  observationMapResponseSchema,
  type ObservationMapQuery,
  type ObservationPeriod,
} from '../model/observation'

type MockObservation = {
  id: string
  animalId: string
  coordinates: [longitude: number, latitude: number]
  ageMinutes: number
}

const mockObservations: MockObservation[] = [
  { id: 'observation-1', animalId: 'cat', coordinates: [37.6176, 55.7558], ageMinutes: 25 },
  { id: 'observation-2', animalId: 'cat', coordinates: [37.601, 55.7298], ageMinutes: 180 },
  { id: 'observation-3', animalId: 'dog', coordinates: [37.672, 55.794], ageMinutes: 1_100 },
  { id: 'observation-4', animalId: 'fox', coordinates: [37.633, 55.829], ageMinutes: 3_100 },
  { id: 'observation-5', animalId: 'hedgehog', coordinates: [37.554, 55.715], ageMinutes: 15_000 },
  { id: 'observation-6', animalId: 'dog', coordinates: [37.6205, 55.7572], ageMinutes: 210 },
  { id: 'observation-7', animalId: 'fox', coordinates: [37.6147, 55.7539], ageMinutes: 1_600 },
  { id: 'observation-8', animalId: 'squirrel', coordinates: [37.648, 55.768], ageMinutes: 22_000 },
]

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
