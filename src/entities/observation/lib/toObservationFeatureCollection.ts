import type { ObservationMapItem } from '../model/observation'

export function toObservationFeatureCollection(observations: ObservationMapItem[]) {
  return {
    type: 'FeatureCollection' as const,
    features: observations.map((observation) => ({
      type: 'Feature' as const,
      id: observation.id,
      geometry: {
        type: 'Point' as const,
        coordinates: [observation.location.longitude, observation.location.latitude],
      },
      properties: {
        observationId: observation.id,
        animalId: observation.animalId,
      },
    })),
  }
}
