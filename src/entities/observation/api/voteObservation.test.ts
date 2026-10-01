import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../shared/api'
import { voteObservation } from './voteObservation'

vi.mock('../../../shared/api', () => ({
  apiRequest: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(apiRequest).mockReset()
})

describe('voteObservation', () => {
  it('sets a vote and returns updated observation details', async () => {
    const observation = {
      id: '28ccc1db-b416-4da2-8af0-c183de6698e3',
      animalId: '2416c275-4cd6-5c44-b4c9-d10b4d152fb2',
      location: { longitude: 37.6176, latitude: 55.7558, label: null },
      observedAt: '2026-09-27T00:00:00.000Z',
      note: null,
      votes: { confirm: 1, reject: 0 },
      confirmationPercent: 100,
      userVote: 'confirm' as const,
    }
    vi.mocked(apiRequest).mockResolvedValue({ data: observation })

    await expect(voteObservation(observation.id, 'confirm')).resolves.toEqual(observation)
    expect(apiRequest).toHaveBeenCalledWith(
      `/observations/${observation.id}/vote`,
      expect.anything(),
      { method: 'PUT', body: JSON.stringify({ value: 'confirm' }) },
    )
  })
})
