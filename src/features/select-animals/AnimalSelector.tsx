import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { Animal } from '../../entities/animal'
import {
  MultiSelectAutocomplete,
  type MultiSelectAutocompleteOption,
} from '../../shared/ui/MultiSelectAutocomplete'

const maximumSelectedAnimals = 5

type AnimalSelectorProps = {
  animals: Animal[]
  isLoading: boolean
  selectedAnimalIds: string[]
  onChange: (animalIds: string[]) => void
}

export function AnimalSelector({
  animals,
  isLoading,
  selectedAnimalIds,
  onChange,
}: AnimalSelectorProps) {
  const { i18n, t } = useTranslation()
  const language = i18n.resolvedLanguage === 'en' ? 'en' : 'ru'
  const options = useMemo<MultiSelectAutocompleteOption[]>(
    () =>
      animals.map((animal) => ({
        label: animal.name[language],
        leadingContent: animal.icon,
        searchTerms: [animal.name.ru, animal.name.en, animal.slug],
        value: animal.id,
      })),
    [animals, language],
  )

  return (
    <MultiSelectAutocomplete
      ariaLabel={t('filters.animals')}
      disabled={isLoading}
      limitReachedText={t('animalSelector.limitReached')}
      maxSelected={maximumSelectedAnimals}
      noOptionsText={t('animalSelector.noResults')}
      onChange={onChange}
      options={options}
      placeholder={isLoading ? t('animalSelector.loading') : t('animalSelector.placeholder')}
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
        maximum: maximumSelectedAnimals,
      })}
      suggestionsLabel={t('animalSelector.suggestions')}
      value={selectedAnimalIds}
    />
  )
}
