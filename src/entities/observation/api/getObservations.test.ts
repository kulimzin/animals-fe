import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../shared/api'
import { getObservations } from './getObservations'

vi.mock('../../../shared/api', () => ({
  apiRequest: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(apiRequest).mockReset()
})

describe('getObservations', () => {
  it('serializes filters and map bounds for the API', async () => {
    const response = {
      items: [
        {
          id: '28ccc1db-b416-4da2-8af0-c183de6698e3',
          animalId: '2416c275-4cd6-5c44-b4c9-d10b4d152fb2',
          location: { longitude: 37.6176, latitude: 55.7558 },
          observedAt: '2026-09-27T00:00:00.000Z',
          votes: { confirm: 12, reject: 1 },
          confirmationPercent: 92,
        },
      ],
      truncated: false,
      limit: 2_000,
    }
    vi.mocked(apiRequest).mockResolvedValue(response)

    await expect(
      getObservations({
        animalIds: ['2416c275-4cd6-5c44-b4c9-d10b4d152fb2', '9d0b7da1-d7d5-57ce-8631-261e0dfd96bd'],
        period: '24h',
        bounds: { west: 37.4, south: 55.6, east: 37.85, north: 55.9 },
      }),
    ).resolves.toEqual(response)

    const requestedPath = vi.mocked(apiRequest).mock.calls[0]?.[0]
    expect(requestedPath).toBe(
      '/observations?animalIds=2416c275-4cd6-5c44-b4c9-d10b4d152fb2%2C9d0b7da1-d7d5-57ce-8631-261e0dfd96bd&period=24h&west=37.4&south=55.6&east=37.85&north=55.9',
    )
  })

  it('preserves antimeridian-crossing bounds', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ items: [], truncated: false, limit: 2_000 })

    await getObservations({
      animalIds: ['2416c275-4cd6-5c44-b4c9-d10b4d152fb2'],
      period: '7d',
      bounds: {
        west: 170,
        south: -90,
        east: -170,
        north: 90,
      },
    })

    const requestedPath = vi.mocked(apiRequest).mock.calls[0]?.[0]
    expect(requestedPath).toContain('west=170')
    expect(requestedPath).toContain('east=-170')
  })
})
