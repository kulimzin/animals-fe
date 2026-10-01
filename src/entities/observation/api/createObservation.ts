import {
  createObservationInputSchema,
  observationDetailsSchema,
  type CreateObservationInput,
} from '../model/observation'
import { mockObservations } from './mockObservations'

let createdObservationCount = 0

export function createObservation(input: CreateObservationInput) {
  const observationInput = createObservationInputSchema.parse(input)
  createdObservationCount += 1

  const observation = {
    id: `created-observation-${createdObservationCount}`,
    animalId: observationInput.animalId,
    coordinates: [observationInput.location.longitude, observationInput.location.latitude] as [
      longitude: number,
      latitude: number,
    ],
    ageMinutes: Math.max(0, (Date.now() - Date.parse(observationInput.observedAt)) / 60_000),
    locationLabel: observationInput.location.label,
    note: observationInput.note || null,
    votes: { confirm: 0, reject: 0 },
    confirmationPercent: null,
    userVote: null,
  }

  mockObservations.push(observation)

  return Promise.resolve(
    observationDetailsSchema.parse({
      id: observation.id,
      animalId: observation.animalId,
      location: {
        latitude: observation.coordinates[1],
        longitude: observation.coordinates[0],
        label: observation.locationLabel,
      },
      observedAt: observationInput.observedAt,
      note: observation.note,
      votes: observation.votes,
      confirmationPercent: observation.confirmationPercent,
      userVote: observation.userVote,
    }),
  )
}
