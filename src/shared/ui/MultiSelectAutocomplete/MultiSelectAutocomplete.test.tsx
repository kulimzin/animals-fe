// @vitest-environment jsdom

import { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  MultiSelectAutocomplete,
  type MultiSelectAutocompleteOption,
} from './MultiSelectAutocomplete'

const options: MultiSelectAutocompleteOption[] = [
  { label: 'Кошка', searchTerms: ['Cat'], value: 'cat' },
  { label: 'Собака', searchTerms: ['Dog'], value: 'dog' },
  { label: 'Лиса', searchTerms: ['Fox'], value: 'fox' },
  { label: 'Белка', searchTerms: ['Squirrel'], value: 'squirrel' },
  { label: 'Ёж', searchTerms: ['Hedgehog'], value: 'hedgehog' },
  { label: 'Заяц', searchTerms: ['Hare'], value: 'hare' },
]

afterEach(cleanup)

type TestSelectProps = {
  initialValue?: string[]
  maxSelected?: number
  onChange?: (values: string[]) => void
  selectOptions?: MultiSelectAutocompleteOption[]
}

function TestSelect({
  initialValue = [],
  maxSelected = 2,
  onChange,
  selectOptions = options,
}: TestSelectProps) {
  const [value, setValue] = useState(initialValue)

  return (
    <MultiSelectAutocomplete
      ariaLabel="Животные"
      limitReachedText="Достигнут лимит"
      maxSelected={maxSelected}
      noOptionsText="Ничего не найдено"
      onChange={(nextValue) => {
        setValue(nextValue)
        onChange?.(nextValue)
      }}
      options={selectOptions}
      placeholder="Выберите животных"
      removeOptionLabel={(option) => `Убрать ${option.label}`}
      resultsLabel="Результаты"
      searchLabel="Поиск"
      searchPlaceholder="Начните вводить"
      selectedCountText={`${value.length} из ${maxSelected}`}
      suggestionsLabel="Предложенные"
      value={value}
    />
  )
}

describe('MultiSelectAutocomplete', () => {
  it('shows every available option before a search is entered', async () => {
    const user = userEvent.setup()
    render(<TestSelect />)

    await user.click(screen.getByRole('combobox', { name: 'Животные' }))

    expect(screen.getAllByRole('option')).toHaveLength(options.length)
    expect(screen.getByRole('option', { name: 'Заяц' })).toBeTruthy()
  })

  it('renders only the visible part of a long list and updates it on scroll', async () => {
    const user = userEvent.setup()
    const longOptions = Array.from({ length: 1000 }, (_, index) => ({
      label: `Вариант ${index + 1}`,
      value: `option-${index + 1}`,
    }))
    render(<TestSelect selectOptions={longOptions} />)

    await user.click(screen.getByRole('combobox', { name: 'Животные' }))

    expect(screen.getAllByRole('option').length).toBeLessThan(20)
    expect(screen.queryByRole('option', { name: 'Вариант 900' })).toBeNull()

    const listbox = screen.getByRole('listbox')
    fireEvent.scroll(listbox, { target: { scrollTop: 48 * 895 } })

    expect(screen.getByRole('option', { name: 'Вариант 900' })).toBeTruthy()
    expect(screen.getAllByRole('option').length).toBeLessThan(20)
  })

  it('keeps keyboard navigation working across virtualized rows', async () => {
    const user = userEvent.setup()
    const longOptions = Array.from({ length: 1000 }, (_, index) => ({
      label: `Вариант ${index + 1}`,
      value: `option-${index + 1}`,
    }))
    render(<TestSelect maxSelected={5} selectOptions={longOptions} />)

    await user.click(screen.getByRole('combobox', { name: 'Животные' }))
    await user.keyboard('{ArrowDown}')
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('option', { name: 'Вариант 1' }))
    })

    await user.keyboard('{ArrowUp}')
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('option', { name: 'Вариант 1000' }))
    })
  })

  it('filters by additional search terms and keeps the list open after selection', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TestSelect onChange={onChange} />)

    await user.click(screen.getByRole('combobox', { name: 'Животные' }))
    await user.type(screen.getByRole('searchbox', { name: 'Поиск' }), 'dog')
    await user.click(screen.getByRole('option', { name: 'Собака' }))

    expect(onChange).toHaveBeenCalledWith(['dog'])
    expect(screen.getByRole('listbox', { name: 'Результаты' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Убрать Собака' })).toBeTruthy()
  })

  it('enforces the selection limit while allowing removal', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TestSelect initialValue={['cat', 'dog']} onChange={onChange} />)

    await user.click(screen.getByRole('combobox', { name: 'Животные' }))

    expect(screen.getByRole('option', { name: 'Лиса' }).getAttribute('disabled')).not.toBeNull()
    await user.click(screen.getByRole('button', { name: 'Убрать Кошка' }))

    expect(onChange).toHaveBeenCalledWith(['dog'])
  })

  it('opens from the keyboard and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<TestSelect />)

    const combobox = screen.getByRole('combobox', { name: 'Животные' })
    combobox.focus()
    await user.keyboard('{ArrowDown}')

    const searchbox = screen.getByRole('searchbox', { name: 'Поиск' })
    expect(document.activeElement).toBe(searchbox)

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(document.activeElement).toBe(combobox)
  })

  it('removes the last selected value with Backspace from an empty search', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TestSelect initialValue={['cat', 'dog']} onChange={onChange} />)

    await user.click(screen.getByRole('combobox', { name: 'Животные' }))
    await user.keyboard('{Backspace}')

    expect(onChange).toHaveBeenCalledWith(['cat'])
  })
})
