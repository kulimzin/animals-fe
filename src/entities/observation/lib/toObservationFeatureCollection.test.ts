import { describe, expect, it } from 'vitest'
import { toObservationFeatureCollection } from './toObservationFeatureCollection'

describe('toObservationFeatureCollection', () => {
  it('uses longitude-latitude coordinate order and keeps observation properties', () => {
    const featureCollection = toObservationFeatureCollection([
      {
        id: 'observation-1',
        animalId: 'cat',
        location: { latitude: 55.7558, longitude: 37.6176 },
        observedAt: '2026-09-27T00:00:00.000Z',
        votes: { confirm: 12, reject: 1 },
        confirmationPercent: 92,
      },
    ])

    expect(featureCollection.features[0]).toMatchObject({
      id: 'observation-1',
      geometry: { coordinates: [37.6176, 55.7558] },
      properties: { animalId: 'cat', observationId: 'observation-1' },
    })
  })
})
