import type { Page } from '@playwright/test'

const animals = [
  {
    id: '2416c275-4cd6-5c44-b4c9-d10b4d152fb2',
    slug: 'cat',
    name: { ru: 'Кошка', en: 'Cat' },
  },
  {
    id: '4187ce96-5986-5800-9ad6-35dd600508ec',
    slug: 'fox',
    name: { ru: 'Лиса', en: 'Fox' },
  },
]

export async function mockApi(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const { pathname } = new URL(request.url())

    if (request.method() === 'POST' && pathname === '/api/v1/clients') {
      await route.fulfill({ json: { token: 'a'.repeat(43) } })
      return
    }

    if (request.method() === 'GET' && pathname === '/api/v1/animals') {
      await route.fulfill({ json: { items: animals } })
      return
    }

    if (request.method() === 'GET' && pathname === '/api/v1/config') {
      await route.fulfill({
        json: { descriptionsEnabled: true, noteMaxLength: 200, mapResultLimit: 2_000 },
      })
      return
    }

    if (request.method() === 'GET' && pathname === '/api/v1/observations') {
      await route.fulfill({ json: { items: [], truncated: false, limit: 2_000 } })
      return
    }

    if (request.method() === 'POST' && pathname === '/api/v1/observations') {
      const body = request.postDataJSON() as {
        animalId: string
        location: { longitude: number; latitude: number; label: string }
        observedAt: string
        note: string | null
      }
      await route.fulfill({
        status: 201,
        json: {
          item: {
            id: 'e2e-created-observation',
            ...body,
            votes: { confirm: 0, reject: 0 },
            confirmationPercent: null,
            userVote: null,
          },
        },
      })
      return
    }

    await route.fulfill({
      status: 404,
      json: {
        error: { code: 'OBSERVATION_NOT_FOUND', message: 'Observation not found' },
        requestId: 'e2e-request',
      },
    })
  })
}
