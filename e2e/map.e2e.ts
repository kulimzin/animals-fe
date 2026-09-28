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
  await page.getByRole('option', { name: animal }).click()
  await page.keyboard.press('Escape')
}

test('filters encounters and opens a matching map marker', async ({ page }) => {
  await openMap(page)

  await expect(
    page.getByText('Choose at least one animal to see encounters on the map.'),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Filters' }).click()
  await selectAnimal(page, 'Cat')

  await page.getByRole('button', { name: 'Filters' }).click()
  await page.getByRole('button', { name: 'Last hour' }).click()

  await expect(
    page.getByText('Choose at least one animal to see encounters on the map.'),
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
