import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { Animal } from '../../entities/animal'
import { AnimalIcon } from '../../shared/ui/AnimalIcon'
import {
  MultiSelectAutocomplete,
  type MultiSelectAutocompleteOption,
} from '../../shared/ui/MultiSelectAutocomplete'

type AnimalSelectorProps = {
  ariaLabel?: string
  animals: Animal[]
  isLoading: boolean
  limitReachedText?: string
  maxSelected?: number
  placeholder?: string
  selectedAnimalIds: string[]
  onChange: (animalIds: string[]) => void
}

export function AnimalSelector({
  ariaLabel,
  animals,
  isLoading,
  limitReachedText,
  maxSelected = 5,
  placeholder,
  selectedAnimalIds,
  onChange,
}: AnimalSelectorProps) {
  const { i18n, t } = useTranslation()
  const language = i18n.resolvedLanguage === 'en' ? 'en' : 'ru'
  const options = useMemo<MultiSelectAutocompleteOption[]>(
    () =>
      animals.map((animal) => ({
        label: animal.name[language],
        leadingContent: <AnimalIcon slug={animal.slug} />,
        searchTerms: [animal.name.ru, animal.name.en, animal.slug],
        value: animal.id,
      })),
    [animals, language],
  )

  return (
    <MultiSelectAutocomplete
      ariaLabel={ariaLabel ?? t('filters.animals')}
      disabled={isLoading}
      limitReachedText={
        limitReachedText ?? t('animalSelector.limitReached', { maximum: maxSelected })
      }
      maxSelected={maxSelected}
      noOptionsText={t('animalSelector.noResults')}
      onChange={onChange}
      options={options}
      placeholder={
        isLoading ? t('animalSelector.loading') : (placeholder ?? t('animalSelector.placeholder'))
      }
      removeOptionLabel={(option) =>
        t('filters.removeAnimal', {
          animal: option.label,
        })
      }
      resultsLabel={t('animalSelector.searchResults')}
      searchLabel={t('animalSelector.searchLabel')}
      searchPlaceholder={t('animalSelector.searchPlaceholder')}
      selectedCountText={t('animalSelector.selectedCount', {
        count: selectedAnimalIds.length,
        maximum: maxSelected,
      })}
      suggestionsLabel={t('animalSelector.suggestions')}
      value={selectedAnimalIds}
    />
  )
}
