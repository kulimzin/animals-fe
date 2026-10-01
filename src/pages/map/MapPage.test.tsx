// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '../../shared/i18n/i18n'
import { MapPage } from './MapPage'

vi.mock('../../entities/animal/api/getAnimals', () => ({
  getAnimals: () =>
    Promise.resolve({
      items: [
        { id: 'cat', slug: 'cat', name: { ru: 'Кошка', en: 'Cat' }, icon: '🐈' },
        { id: 'dog', slug: 'dog', name: { ru: 'Собака', en: 'Dog' }, icon: '🐕' },
      ],
    }),
}))

vi.mock('../../entities/observation/api/getObservations', () => ({
  getObservations: () => Promise.resolve({ items: [], truncated: false, limit: 2_000 }),
}))

vi.mock('../../entities/observation/api/getObservation', () => ({
  getObservation: () =>
    Promise.resolve({
      item: {
        id: 'observation-1',
        animalId: 'cat',
        location: {
          latitude: 55.7558,
          longitude: 37.6176,
          label: 'Манежная площадь, Москва',
        },
        observedAt: '2026-09-27T00:00:00.000Z',
        note: 'Рыжая кошка сидела у входа в Александровский сад.',
        votes: { confirm: 12, reject: 1 },
        confirmationPercent: 92,
        userVote: null,
      },
    }),
}))

vi.mock('../../shared/api', () => ({
  usePublicConfig: () => ({
    data: { descriptionsEnabled: true, noteMaxLength: 200, mapResultLimit: 2_000 },
  }),
}))

vi.mock('../../widgets/map', () => ({
  Map: ({
    isLocationSelectionEnabled,
    onLocationSelect,
    onObservationSelect,
  }: {
    isLocationSelectionEnabled: boolean
    onLocationSelect: (point: { latitude: number; longitude: number }) => void
    onObservationSelect: (id: string) => void
  }) => (
    <div>
      <button onClick={() => onObservationSelect('observation-1')} type="button">
        Точка встречи
      </button>
      {isLocationSelectionEnabled ? (
        <button
          onClick={() => onLocationSelect({ latitude: 55.75, longitude: 37.62 })}
          type="button"
        >
          Выбрать эту точку
        </button>
      ) : null}
    </div>
  ),
}))

vi.mock('../../widgets/map-filter-panel', () => ({
  MapFilterPanel: ({ onAnimalIdsChange }: { onAnimalIdsChange: (animalIds: string[]) => void }) => (
    <div>
      <span>Содержимое фильтров</span>
      <button onClick={() => onAnimalIdsChange(['cat'])} type="button">
        Выбрать кошку
      </button>
    </div>
  ),
}))

beforeEach(async () => {
  await i18n.changeLanguage('ru')
})

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
  document.body.style.overflow = ''
})

describe('MapPage encounter flow', () => {
  it('explains how to display encounters until an animal is selected', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MapPage />
      </QueryClientProvider>,
    )

    expect(
      screen.getByText('Выберите хотя бы одно животное, чтобы увидеть встречи на карте.'),
    ).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Фильтры' }))

    expect(screen.getByRole('dialog', { name: 'Фильтры' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Выбрать кошку' }))

    expect(
      screen.queryByText('Выберите хотя бы одно животное, чтобы увидеть встречи на карте.'),
    ).toBeNull()
  })

  it('opens the add encounter form in a dialog without unmounting the map', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MapPage />
      </QueryClientProvider>,
    )

    const mapMarker = screen.getByRole('button', { name: 'Точка встречи' })
    await user.click(screen.getByRole('button', { name: 'Добавить встречу' }))

    expect(screen.getByRole('dialog', { name: 'Добавить встречу' })).toBeTruthy()
    expect(mapMarker.isConnected).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Отмена' }))

    expect(screen.queryByRole('dialog', { name: 'Добавить встречу' })).toBeNull()
    expect(mapMarker.isConnected).toBe(true)
  })

  it('selects the encounter location on the map and returns to the form', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MapPage />
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Добавить встречу' }))
    await user.click(screen.getByRole('button', { name: 'Выбрать на карте' }))

    expect(screen.queryByRole('dialog', { name: 'Добавить встречу' })).toBeNull()
    expect(screen.getByText('Нажмите на карту, чтобы выбрать место встречи.')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Выбрать эту точку' }))

    expect(screen.getByRole('dialog', { name: 'Добавить встречу' })).toBeTruthy()
    expect(screen.getByText('Точка на карте')).toBeTruthy()
    expect(screen.getByText('55.75000, 37.62000')).toBeTruthy()
  })

  it('opens filters in a dialog without unmounting the map', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MapPage />
      </QueryClientProvider>,
    )

    const mapMarker = screen.getByRole('button', { name: 'Точка встречи' })
    await user.click(screen.getByRole('button', { name: 'Фильтры' }))

    expect(screen.getByRole('dialog', { name: 'Фильтры' })).toBeTruthy()
    expect(screen.getByText('Содержимое фильтров')).toBeTruthy()
    expect(mapMarker.isConnected).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Закрыть фильтры' }))

    expect(screen.queryByRole('dialog', { name: 'Фильтры' })).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Фильтры' }))
  })

  it('opens and closes encounter details without unmounting the map', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MapPage />
      </QueryClientProvider>,
    )

    const mapMarker = screen.getByRole('button', { name: 'Точка встречи' })
    await user.click(mapMarker)

    expect(await screen.findByRole('dialog', { name: 'Сведения о встрече: Кошка' })).toBeTruthy()
    expect(mapMarker.isConnected).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Закрыть сведения о встрече' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mapMarker.isConnected).toBe(true)
    expect(document.activeElement).toBe(mapMarker)
  })
})
