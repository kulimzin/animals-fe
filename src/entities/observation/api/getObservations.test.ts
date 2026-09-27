import { describe, expect, it } from 'vitest'
import { getObservations } from './getObservations'

const moscowBounds = {
  west: 37.4,
  south: 55.6,
  east: 37.85,
  north: 55.9,
}

describe('getObservations', () => {
  it('filters observations by animal and period', async () => {
    const response = await getObservations({
      animalIds: ['cat'],
      period: '1h',
      bounds: moscowBounds,
    })

    expect(response.items.map((observation) => observation.id)).toEqual(['observation-1'])
  })

  it('filters observations by map bounds', async () => {
    const response = await getObservations({
      animalIds: ['cat'],
      period: '24h',
      bounds: {
        west: 37.59,
        south: 55.72,
        east: 37.61,
        north: 55.74,
      },
    })

    expect(response.items.map((observation) => observation.id)).toEqual(['observation-2'])
  })

  it('supports bounds crossing the antimeridian', async () => {
    const response = await getObservations({
      animalIds: ['cat'],
      period: '24h',
      bounds: {
        west: 170,
        south: -90,
        east: -170,
        north: 90,
      },
    })

    expect(response.items).toEqual([])
  })
})
