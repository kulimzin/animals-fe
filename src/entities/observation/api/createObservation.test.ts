import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../shared/api'
import { createObservation } from './createObservation'

vi.mock('../../../shared/api', () => ({
  apiRequest: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(apiRequest).mockReset()
})

describe('createObservation', () => {
  it('publishes an observation with an idempotency key', async () => {
    const input = {
      animalId: '2416c275-4cd6-5c44-b4c9-d10b4d152fb2',
      location: { longitude: 37.6176, latitude: 55.7558, label: 'Парк' },
      observedAt: '2026-09-27T00:00:00.000Z',
      note: 'У фонтана',
    }
    const observation = {
      id: '28ccc1db-b416-4da2-8af0-c183de6698e3',
      animalId: input.animalId,
      location: { ...input.location },
      observedAt: input.observedAt,
      note: input.note,
      votes: { confirm: 0, reject: 0 },
      confirmationPercent: null,
      userVote: null,
    }
    vi.mocked(apiRequest).mockResolvedValue({ item: observation })

    await expect(createObservation(input)).resolves.toEqual(observation)

    const [path, , init] = vi.mocked(apiRequest).mock.calls[0] ?? []
    expect(path).toBe('/observations')
    expect(init).toMatchObject({ method: 'POST' })
    expect(new Headers(init?.headers).get('Idempotency-Key')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
    expect(init?.body).toEqual(expect.any(String))
    expect(JSON.parse(typeof init?.body === 'string' ? init.body : '')).toEqual({
      animalId: input.animalId,
      location: { longitude: 37.6176, latitude: 55.7558, label: 'Парк' },
      observedAt: input.observedAt,
      note: 'У фонтана',
    })
  })
})
