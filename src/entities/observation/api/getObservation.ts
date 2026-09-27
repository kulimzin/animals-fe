import { observationDetailsResponseSchema } from '../model/observation'
import { mockObservations } from './mockObservations'

export function getObservation(observationId: string) {
  const observation = mockObservations.find(({ id }) => id === observationId)

  if (!observation) {
    return Promise.resolve(observationDetailsResponseSchema.parse({ item: null }))
  }

  return Promise.resolve(
    observationDetailsResponseSchema.parse({
      item: {
        id: observation.id,
        animalId: observation.animalId,
        location: {
          latitude: observation.coordinates[1],
          longitude: observation.coordinates[0],
          label: observation.locationLabel,
        },
        observedAt: new Date(Date.now() - observation.ageMinutes * 60_000).toISOString(),
        note: observation.note,
        votes: observation.votes,
        userVote: observation.userVote,
      },
    }),
  )
}
