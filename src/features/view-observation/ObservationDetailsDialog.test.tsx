// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '../../shared/i18n/i18n'
import { ObservationDetailsDialog } from './ObservationDetailsDialog'

vi.mock('../../entities/observation/api/voteObservation', () => ({
  voteObservation: (observationId: string, vote: 'confirm' | 'reject') =>
    Promise.resolve({
      id: observationId,
      animalId: 'cat',
      location: {
        latitude: 55.7558,
        longitude: 37.6176,
        label: 'Манежная площадь, Москва',
      },
      observedAt: '2026-09-27T00:00:00.000Z',
      note: 'Рыжая кошка сидела у входа в Александровский сад.',
      votes: { confirm: vote === 'confirm' ? 13 : 12, reject: vote === 'reject' ? 2 : 1 },
      confirmationPercent: vote === 'confirm' ? 93 : 86,
      userVote: vote,
    }),
}))

vi.mock('../../entities/animal/api/getAnimals', () => ({
  getAnimals: () =>
    Promise.resolve({
      items: [
        { id: 'cat', slug: 'cat', name: { ru: 'Кошка', en: 'Cat' } },
        { id: 'dog', slug: 'dog', name: { ru: 'Собака', en: 'Dog' } },
      ],
    }),
}))

vi.mock('../../entities/observation/api/getObservation', () => ({
  getObservation: (observationId: string) => {
    if (observationId === 'missing-observation') {
      return Promise.resolve({ item: null })
    }

    const hasNote = observationId === 'observation-1'
    return Promise.resolve({
      item: {
        id: observationId,
        animalId: 'cat',
        location: {
          latitude: 55.7558,
          longitude: 37.6176,
          label: hasNote ? 'Манежная площадь, Москва' : 'Парк Горького, Москва',
        },
        observedAt: '2026-09-27T00:00:00.000Z',
        note: hasNote ? 'Рыжая кошка сидела у входа в Александровский сад.' : null,
        votes: { confirm: hasNote ? 12 : 7, reject: hasNote ? 1 : 0 },
        confirmationPercent: hasNote ? 92 : 100,
        userVote: null,
      },
    })
  },
}))

beforeEach(async () => {
  await i18n.changeLanguage('ru')
})

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
  document.body.style.overflow = ''
})

function renderDetails(observationId = 'observation-1', onClose = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <ObservationDetailsDialog observationId={observationId} onClose={onClose} />
    </QueryClientProvider>,
  )

  return onClose
}

describe('ObservationDetailsDialog', () => {
  it('shows encounter details and saves a vote', async () => {
    const user = userEvent.setup()
    renderDetails()

    expect(screen.getByRole('status').textContent).toContain('Загружаем')
    const dialog = await screen.findByRole('dialog', { name: 'Сведения о встрече: Кошка' })
    expect(dialog).toBeTruthy()
    expect(screen.queryByText('Встреча: Кошка')).toBeNull()
    expect(screen.getByText('Манежная площадь, Москва')).toBeTruthy()
    expect(screen.getByText('Рыжая кошка сидела у входа в Александровский сад.')).toBeTruthy()

    const confirmButton = screen.getByRole('button', { name: /Подтверждаю/ })
    await user.click(confirmButton)

    await waitFor(() => expect(confirmButton.getAttribute('aria-pressed')).toBe('true'))
    expect(confirmButton.textContent).toContain('13')
  })

  it('shows an unavailable state for an unknown encounter', async () => {
    renderDetails('missing-observation')

    expect(await screen.findByText('Встреча не найдена или больше недоступна.')).toBeTruthy()
  })

  it('does not render a note row when the encounter has no note', async () => {
    renderDetails('observation-2')

    await screen.findByRole('dialog', { name: 'Сведения о встрече: Кошка' })

    expect(screen.queryByText('Заметка')).toBeNull()
  })

  it('closes with the close button, Escape, and a backdrop click', async () => {
    const user = userEvent.setup()
    const onClose = renderDetails()
    const dialog = await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: 'Закрыть сведения о встрече' }))
    fireEvent.keyDown(dialog, { key: 'Escape' })
    fireEvent.click(dialog.parentElement as HTMLElement)

    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
