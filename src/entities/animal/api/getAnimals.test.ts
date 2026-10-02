import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../shared/api'
import { getAnimals } from './getAnimals'

vi.mock('../../../shared/api', () => ({
  apiRequest: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(apiRequest).mockReset()
})

describe('getAnimals', () => {
  it('validates the API response', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      data: [
        {
          id: '2416c275-4cd6-5c44-b4c9-d10b4d152fb2',
          slug: 'cat',
          name: { ru: 'Кошка', en: 'Cat' },
        },
        {
          id: 'f3185d79-5e96-5a71-8801-84ecc40308ab',
          slug: 'agama',
          name: { ru: 'Агама', en: 'Agama' },
        },
      ],
    })

    await expect(getAnimals()).resolves.toEqual({
      items: [
        {
          id: '2416c275-4cd6-5c44-b4c9-d10b4d152fb2',
          slug: 'cat',
          name: { ru: 'Кошка', en: 'Cat' },
        },
        {
          id: 'f3185d79-5e96-5a71-8801-84ecc40308ab',
          slug: 'agama',
          name: { ru: 'Агама', en: 'Agama' },
        },
      ],
    })
  })
})
