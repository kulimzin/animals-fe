import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  MultiSelectAutocomplete,
  type MultiSelectAutocompleteOption,
  type MultiSelectAutocompleteProps,
} from './MultiSelectAutocomplete'

const animalOptions: MultiSelectAutocompleteOption[] = [
  { label: 'Кошка', leadingContent: '🐈', searchTerms: ['Cat'], value: 'cat' },
  { label: 'Собака', leadingContent: '🐕', searchTerms: ['Dog'], value: 'dog' },
  { label: 'Лиса', leadingContent: '🦊', searchTerms: ['Fox'], value: 'fox' },
  {
    label: 'Белка',
    leadingContent: '🐿️',
    searchTerms: ['Squirrel'],
    value: 'squirrel',
  },
  {
    label: 'Ёж',
    leadingContent: '🦔',
    searchTerms: ['Hedgehog'],
    value: 'hedgehog',
  },
  { label: 'Заяц', leadingContent: '🐇', searchTerms: ['Hare'], value: 'hare' },
]

const virtualizedOptions: MultiSelectAutocompleteOption[] = Array.from(
  { length: 1000 },
  (_, index) => ({
    label: `Вариант ${index + 1}`,
    searchTerms: [`Option ${index + 1}`],
    value: `option-${index + 1}`,
  }),
)

function MultiSelectAutocompleteStory(args: MultiSelectAutocompleteProps) {
  const [value, setValue] = useState(args.value)

  return (
    <div style={{ width: 'min(36rem, calc(100vw - 2rem))' }}>
      <MultiSelectAutocomplete
        {...args}
        onChange={(nextValue) => {
          setValue(nextValue)
          args.onChange(nextValue)
        }}
        selectedCountText={`Выбрано: ${value.length} из ${args.maxSelected}`}
        value={value}
      />
    </div>
  )
}

const meta = {
  title: 'Shared/MultiSelectAutocomplete',
  component: MultiSelectAutocomplete,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onChange: { control: false },
    options: { control: false },
    removeOptionLabel: { control: false },
    value: { control: false },
  },
  args: {
    ariaLabel: 'Животные',
    limitReachedText: 'Выбрано максимальное количество. Уберите один вариант.',
    maxSelected: 5,
    noOptionsText: 'Ничего не найдено',
    onChange: () => undefined,
    options: animalOptions,
    placeholder: 'Выберите животных',
    removeOptionLabel: (option) => `Убрать ${option.label}`,
    resultsLabel: 'Результаты поиска',
    searchLabel: 'Поиск вариантов',
    searchPlaceholder: 'Начните вводить название',
    selectedCountText: 'Выбрано: 0 из 5',
    suggestionsLabel: 'Все варианты',
    value: [],
  },
  render: (args) => <MultiSelectAutocompleteStory {...args} />,
} satisfies Meta<typeof MultiSelectAutocomplete>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSelectedOptions: Story = {
  args: {
    value: ['cat', 'dog'],
  },
}

export const SelectionLimitReached: Story = {
  args: {
    value: ['cat', 'dog', 'fox', 'squirrel', 'hedgehog'],
  },
}

export const VirtualizedList: Story = {
  args: {
    options: virtualizedOptions,
    placeholder: 'Выберите варианты',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
