// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '../../shared/i18n/i18n'
import { MapPage } from './MapPage'

vi.mock('../../widgets/map', () => ({
  Map: ({ onObservationSelect }: { onObservationSelect: (id: string) => void }) => (
    <button onClick={() => onObservationSelect('observation-1')} type="button">
      Точка встречи
    </button>
  ),
}))

vi.mock('../../widgets/map-filter-panel', () => ({
  MapFilterPanel: () => null,
}))

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
  document.body.style.overflow = ''
})

describe('MapPage encounter flow', () => {
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
