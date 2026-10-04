import { expect, test, type Page } from '@playwright/test'
import { MAP_STYLE_URL } from '../src/shared/config/map.js'

const emptyMapStyle = {
  version: 8,
  sources: {},
  layers: [],
}

async function openMap(page: Page) {
  await page.route(MAP_STYLE_URL, async (route) => {
    await route.fulfill({ json: emptyMapStyle })
  })
  await page.goto('/')
  await expect(page.getByRole('region', { name: 'Map' })).toBeVisible()
}

async function selectAnimal(page: Page, animal: string) {
  await page.getByRole('combobox', { name: /^Animals?$/ }).click()
  await page.getByRole('searchbox', { name: 'Search animals' }).fill(animal)
  await page.getByRole('option', { name: animal, exact: true }).click()
  await page.keyboard.press('Escape')
}

test('filters encounters and opens a matching map marker', async ({ page }) => {
  const observationId = 'e2e-cat-observation'
  let selectedAnimalId = ''

  await page.route('**/api/v1/observations?**', async (route) => {
    const animalId = new URL(route.request().url()).searchParams.get('animalIds')?.split(',')[0]
    selectedAnimalId = animalId ?? ''

    await route.fulfill({
      json: {
        items: animalId
          ? [
              {
                id: observationId,
                animalId,
                location: { latitude: 55.7558, longitude: 37.6176 },
                observedAt: '2026-10-04T10:00:00.000Z',
                votes: { confirm: 12, reject: 1 },
                confirmationPercent: 92,
              },
            ]
          : [],
        truncated: false,
        limit: 2_000,
      },
    })
  })
  await page.route(`**/api/v1/observations/${observationId}`, async (route) => {
    await route.fulfill({
      json: {
        item: {
          id: observationId,
          animalId: selectedAnimalId,
          location: {
            latitude: 55.7558,
            longitude: 37.6176,
            label: 'Манежная площадь, Москва',
          },
          observedAt: '2026-10-04T10:00:00.000Z',
          note: null,
          votes: { confirm: 12, reject: 1 },
          confirmationPercent: 92,
          userVote: null,
        },
      },
    })
  })

  await openMap(page)

  await expect(
    page.getByText('Choose at least one animal and a period to see encounters on the map.'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Close filter reminder' }).click()

  await page.getByRole('button', { name: 'Filters' }).click()
  await selectAnimal(page, 'Cat')
  const observationsResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/observations?') && response.url().includes('period=30d'),
  )
  await page.getByRole('button', { name: '30 days' }).click()
  await observationsResponse
  await page.getByRole('button', { name: 'Close filters' }).click()

  await expect(
    page.getByText('Choose at least one animal and a period to see encounters on the map.'),
  ).toBeHidden()

  const map = page.getByRole('region', { name: 'Map' })
  await map.click({ position: { x: 640, y: 360 } })

  await expect(page.getByRole('dialog', { name: 'Cat encounter details' })).toBeVisible()
  await expect(page.getByText('Манежная площадь, Москва')).toBeVisible()
})

test('opens an encounter and changes the vote', async ({ page }) => {
  await openMap(page)

  await page.getByRole('button', { name: 'Filters' }).click()
  await selectAnimal(page, 'Cat')

  await page.getByRole('button', { name: 'Filters' }).click()
  await page.getByRole('button', { name: 'Last hour' }).click()

  const map = page.getByRole('region', { name: 'Map' })
  await map.click({ position: { x: 640, y: 360 } })

  const dialog = page.getByRole('dialog', { name: 'Cat encounter details' })
  await expect(dialog).toBeVisible()

  const confirmVote = dialog.getByRole('button', { name: 'Confirm · 12' })
  await confirmVote.click()
  await expect(dialog.getByRole('button', { name: 'Confirm · 13' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  const rejectVote = dialog.getByRole('button', { name: 'Cannot confirm · 1' })
  await rejectVote.click()
  await expect(dialog.getByRole('button', { name: 'Confirm · 12' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await expect(dialog.getByRole('button', { name: 'Cannot confirm · 2' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test.describe('publishing an encounter', () => {
  test.use({
    geolocation: { latitude: 55.7558, longitude: 37.6173 },
    permissions: ['geolocation'],
  })

  test('publishes a valid encounter from the current location', async ({ page }) => {
    await openMap(page)

    await page.getByRole('button', { name: 'Add encounter' }).click()
    await selectAnimal(page, 'Fox')
    await page.getByRole('button', { name: 'Current location' }).click()
    await expect(page.getByText('55.75580, 37.61730')).toBeVisible()

    await page.getByRole('textbox', { name: 'Additional details' }).fill('Fox near the park')
    await page.getByRole('button', { name: 'Publish' }).click()

    await expect(page.getByRole('dialog', { name: 'Encounter published' })).toBeVisible()
    await expect(
      page.getByText('The encounter is now visible to everyone on the map.'),
    ).toBeVisible()
  })
})
