// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '../../shared/i18n/i18n'
import { AddObservationDialog } from './AddObservationDialog'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  document.body.replaceChildren()
  document.body.style.overflow = ''
})

const selectedLocation = {
  label: 'Точка на карте',
  point: { latitude: 55.75, longitude: 37.62 },
}

function renderDialog({
  location = selectedLocation,
  onLocationChange = vi.fn(),
  onSuccess = vi.fn(),
}: {
  location?: typeof selectedLocation | null
  onLocationChange?: (location: typeof selectedLocation) => void
  onSuccess?: (observationId: string) => void
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <AddObservationDialog
        isOpen
        location={location}
        onClose={vi.fn()}
        onLocationChange={onLocationChange}
        onSelectLocationOnMap={vi.fn()}
        onSuccess={onSuccess}
      />
    </QueryClientProvider>,
  )

  return onSuccess
}

describe('AddObservationDialog', () => {
  it('uses the current browser location', async () => {
    const user = userEvent.setup()
    const onLocationChange = vi.fn()
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({ coords: { latitude: 55.76, longitude: 37.61 } } as GeolocationPosition)
    })
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
    renderDialog({ location: null, onLocationChange })

    await user.click(screen.getByRole('button', { name: 'Текущее местоположение' }))

    expect(getCurrentPosition).toHaveBeenCalledOnce()
    expect(onLocationChange).toHaveBeenCalledWith({
      label: 'Текущее местоположение',
      point: { latitude: 55.76, longitude: 37.61 },
    })
  })

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup()
    renderDialog({ location: null })

    await user.click(screen.getByRole('button', { name: 'Опубликовать' }))

    expect(screen.getByText('Заполните это поле.')).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toBe('Выберите местоположение.')
  })

  it('validates the current values on every publish attempt', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Опубликовать' }))
    expect(screen.getByText('Заполните это поле.')).toBeTruthy()

    await user.clear(screen.getByLabelText(/Дата/))
    await user.click(screen.getByRole('button', { name: 'Опубликовать' }))

    expect(screen.getAllByText('Заполните это поле.')).toHaveLength(2)
  })

  it('publishes a valid encounter', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    renderDialog({ onSuccess })

    await screen.findByRole('combobox', { name: 'Животное' })
    await user.click(screen.getByRole('combobox', { name: 'Животное' }))
    await user.click(screen.getByRole('option', { name: /Кошка/ }))

    expect(screen.getByRole('option', { name: /Собака/ }).hasAttribute('disabled')).toBe(true)

    await user.type(screen.getByRole('textbox', { name: 'Дополнительно' }), 'Кошка у скамейки')
    await user.click(screen.getByRole('button', { name: 'Опубликовать' }))

    expect(onSuccess).toHaveBeenCalledWith(expect.stringMatching(/^created-observation-/))
  })
})
