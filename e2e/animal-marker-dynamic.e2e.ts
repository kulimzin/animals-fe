import { expect, test } from '@playwright/test'
import { MAP_STYLE_URL } from '../src/shared/config/map.js'

test('loads icons for animal groups added after the map initialization', async ({ page }) => {
  const catId = '2416c275-4cd6-5c44-b4c9-d10b4d152fb2'
  const foxId = '4187ce96-5986-5800-9ad6-35dd600508ec'
  const missingImageWarnings: string[] = []

  page.on('console', (message) => {
    if (message.text().includes('could not be loaded')) {
      missingImageWarnings.push(message.text())
    }
  })
  await page.route(MAP_STYLE_URL, async (route) => {
    await route.fulfill({ json: { version: 8, sources: {}, layers: [] } })
  })
  await page.route('**/api/v1/client-tokens', async (route) => {
    await route.fulfill({ json: { data: { token: 'a'.repeat(43) } } })
  })
  await page.route('**/api/v1/animals', async (route) => {
    await route.fulfill({
      json: {
        data: [
          { id: catId, slug: 'cat', name: { ru: 'Кошка', en: 'Cat' } },
          { id: foxId, slug: 'fox', name: { ru: 'Лиса', en: 'Fox' } },
        ],
      },
    })
  })
  await page.route('**/api/v1/observations?*', async (route) => {
    const animalId = route.request().url().includes(foxId) ? foxId : catId

    await route.fulfill({
      json: {
        items: [
          {
            id: `observation-${animalId}`,
            animalId,
            location: { latitude: 55.7558, longitude: 37.6173 },
            observedAt: new Date().toISOString(),
            votes: { confirm: 1, reject: 0 },
            confirmationPercent: 100,
          },
        ],
        truncated: false,
        limit: 2000,
      },
    })
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'Close filter reminder' }).click()
  await page.getByRole('button', { name: 'Filters' }).click()
  await page.getByRole('combobox', { name: 'Animals' }).click()
  await page.getByRole('option', { name: 'Cat', exact: true }).click()
  await page.getByRole('button', { name: 'Close filters' }).click()
  await page.waitForTimeout(300)

  await page.getByRole('button', { name: 'Filters' }).click()
  await page.getByRole('button', { name: 'Remove Cat' }).click()
  await page.getByRole('combobox', { name: 'Animals' }).click()
  await page.getByRole('option', { name: 'Fox', exact: true }).click()
  await page.getByRole('button', { name: 'Close filters' }).click()
  await page.waitForTimeout(300)

  expect(missingImageWarnings).toEqual([])
})
