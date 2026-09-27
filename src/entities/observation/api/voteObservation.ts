import { observationDetailsSchema, type ObservationVote } from '../model/observation'
import { mockObservations } from './mockObservations'

export function voteObservation(observationId: string, vote: ObservationVote) {
  const observation = mockObservations.find(({ id }) => id === observationId)

  if (!observation) {
    return Promise.reject(new Error('Observation not found'))
  }

  if (observation.userVote && observation.userVote !== vote) {
    observation.votes[observation.userVote] -= 1
  }

  if (observation.userVote !== vote) {
    observation.votes[vote] += 1
    observation.userVote = vote
  }

  return Promise.resolve(
    observationDetailsSchema.parse({
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
    }),
  )
}
