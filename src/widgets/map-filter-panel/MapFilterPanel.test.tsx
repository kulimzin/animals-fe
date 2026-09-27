// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '../../shared/i18n/i18n'
import type { Animal } from '../../entities/animal'
import { MapFilterPanel } from './MapFilterPanel'

const animals: Animal[] = [
  { id: 'cat', slug: 'cat', name: { ru: 'Кошка', en: 'Cat' }, icon: '🐈' },
  { id: 'dog', slug: 'dog', name: { ru: 'Собака', en: 'Dog' }, icon: '🐕' },
  { id: 'fox', slug: 'fox', name: { ru: 'Лиса', en: 'Fox' }, icon: '🦊' },
  { id: 'squirrel', slug: 'squirrel', name: { ru: 'Белка', en: 'Squirrel' }, icon: '🐿️' },
  { id: 'hedgehog', slug: 'hedgehog', name: { ru: 'Ёж', en: 'Hedgehog' }, icon: '🦔' },
  { id: 'hare', slug: 'hare', name: { ru: 'Заяц', en: 'Hare' }, icon: '🐇' },
]

afterEach(cleanup)

function renderPanel(
  selectedAnimalIds: string[] = [],
  onAnimalToggle = vi.fn(),
  onPeriodChange = vi.fn(),
) {
  render(
    <MapFilterPanel
      animals={animals}
      isAnimalsLoading={false}
      period="24h"
      selectedAnimalIds={selectedAnimalIds}
      onAnimalIdsChange={onAnimalToggle}
      onPeriodChange={onPeriodChange}
    />,
  )

  return { onAnimalToggle, onPeriodChange }
}

describe('MapFilterPanel', () => {
  it('searches animals by name and reports filter changes', async () => {
    const user = userEvent.setup()
    const { onAnimalToggle, onPeriodChange } = renderPanel()

    await user.click(screen.getByRole('combobox', { name: 'Животные' }))
    await user.type(screen.getByRole('searchbox', { name: 'Поиск животных' }), 'dog')

    expect(screen.queryByRole('option', { name: 'Кошка' })).toBeNull()
    await user.click(screen.getByRole('option', { name: 'Собака' }))
    await user.click(screen.getByRole('button', { name: '7 дней' }))

    expect(onAnimalToggle).toHaveBeenCalledWith(['dog'])
    expect(onPeriodChange).toHaveBeenCalledWith('7d')
  })

  it('disables unselected animals after five selections', async () => {
    const user = userEvent.setup()
    renderPanel(['cat', 'dog', 'fox', 'squirrel', 'hedgehog'])

    await user.click(screen.getByRole('combobox', { name: 'Животные' }))

    expect(screen.getByRole('option', { name: 'Кошка' }).getAttribute('disabled')).toBeNull()
    await user.type(screen.getByRole('searchbox', { name: 'Поиск животных' }), 'заяц')
    expect(screen.getByRole('option', { name: 'Заяц' }).getAttribute('disabled')).not.toBeNull()
    expect(screen.getByText('Выбрано: 5 из 5')).toBeTruthy()
  })

  it('shows selected animals as removable chips', async () => {
    const user = userEvent.setup()
    const { onAnimalToggle } = renderPanel(['cat'])

    await user.click(screen.getByRole('button', { name: 'Убрать Кошка' }))

    expect(onAnimalToggle).toHaveBeenCalledWith([])
  })
})
