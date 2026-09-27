import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      filters: {
        animals: 'Animals',
        removeAnimal: 'Remove {{animal}}',
        period: 'Period',
        periods: {
          '1h': 'Last hour',
          '24h': '24 hours',
          '7d': '7 days',
          '30d': '30 days',
        },
      },
      animalSelector: {
        limitReached: 'The maximum of 5 animals is selected. Remove one to choose another.',
        loading: 'Loading animals…',
        noResults: 'No animals found',
        placeholder: 'Choose animals',
        searchLabel: 'Search animals',
        searchPlaceholder: 'For example, cat',
        searchResults: 'Search results',
        selectedCount: '{{count}} of {{maximum}} selected',
        suggestions: 'Suggested animals',
      },
    },
  },
  ru: {
    translation: {
      filters: {
        animals: 'Животные',
        removeAnimal: 'Убрать {{animal}}',
        period: 'Период',
        periods: {
          '1h': 'Последний час',
          '24h': '24 часа',
          '7d': '7 дней',
          '30d': '30 дней',
        },
      },
      animalSelector: {
        limitReached: 'Выбрано максимум 5 животных. Уберите одно, чтобы выбрать другое.',
        loading: 'Загружаем животных…',
        noResults: 'Животные не найдены',
        placeholder: 'Выберите животных',
        searchLabel: 'Поиск животных',
        searchPlaceholder: 'Например, кошка',
        searchResults: 'Результаты поиска',
        selectedCount: 'Выбрано: {{count}} из {{maximum}}',
        suggestions: 'Предложенные животные',
      },
    },
  },
} as const

void i18n.use(initReactI18next).init({
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
  lng: 'ru',
  resources,
})

export { i18n }
