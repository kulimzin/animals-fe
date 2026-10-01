// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '../../shared/i18n/i18n'
import { ObservationDetailsDialog } from './ObservationDetailsDialog'

vi.mock('../../entities/animal/api/getAnimals', () => ({
  getAnimals: () =>
    Promise.resolve({
      items: [
        { id: 'cat', slug: 'cat', name: { ru: 'Кошка', en: 'Cat' }, icon: '🐈' },
        { id: 'dog', slug: 'dog', name: { ru: 'Собака', en: 'Dog' }, icon: '🐕' },
      ],
    }),
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
