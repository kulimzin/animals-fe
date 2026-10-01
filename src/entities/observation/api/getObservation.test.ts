import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest } from '../../../shared/api'
import { getObservation } from './getObservation'

vi.mock('../../../shared/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../../shared/api')>()
  return { ...original, apiRequest: vi.fn() }
})

beforeEach(() => {
  vi.mocked(apiRequest).mockReset()
})

describe('getObservation', () => {
  it('adapts an API details response', async () => {
    const observation = {
      id: '28ccc1db-b416-4da2-8af0-c183de6698e3',
      animalId: '2416c275-4cd6-5c44-b4c9-d10b4d152fb2',
      location: { longitude: 37.6176, latitude: 55.7558, label: null },
      observedAt: '2026-09-27T00:00:00.000Z',
      note: null,
      votes: { confirm: 0, reject: 0 },
      confirmationPercent: null,
      userVote: null,
    }
    vi.mocked(apiRequest).mockResolvedValue({ data: observation })

    await expect(getObservation(observation.id)).resolves.toEqual({ item: observation })
    expect(apiRequest).toHaveBeenCalledWith(`/observations/${observation.id}`, expect.anything())
  })

  it('maps an unavailable observation to an empty result', async () => {
    vi.mocked(apiRequest).mockRejectedValue(
      new ApiError(404, 'OBSERVATION_NOT_FOUND', 'Observation not found', 'request-1'),
    )

    await expect(getObservation('28ccc1db-b416-4da2-8af0-c183de6698e3')).resolves.toEqual({
      item: null,
    })
  })

  it('preserves other API errors', async () => {
    const error = new ApiError(500, 'INTERNAL_ERROR', 'Internal error', 'request-2')
    vi.mocked(apiRequest).mockRejectedValue(error)

    await expect(getObservation('28ccc1db-b416-4da2-8af0-c183de6698e3')).rejects.toBe(error)
  })
})
