import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      common: {
        retry: 'Try again',
      },
      observation: {
        close: 'Close encounter details',
        date: 'Date',
        error: 'Could not load the encounter details.',
        label: 'Encounter details',
        labelWithAnimal: '{{animal}} encounter details',
        loading: 'Loading encounter details…',
        location: 'Location',
        notFound: 'This encounter was not found or is no longer available.',
        note: 'Note',
        time: 'Time',
        voting: {
          confirm: 'Confirm',
          error: 'Could not save your vote. Try again.',
          hint: 'Did you see this animal here?',
          reject: 'Cannot confirm',
        },
      },
      filters: {
        animals: 'Animals',
        close: 'Close filters',
        label: 'Filters',
        removeAnimal: 'Remove {{animal}}',
        period: 'Period',
        periods: {
          '1h': 'Last hour',
          '24h': '24 hours',
          '7d': '7 days',
          '30d': '30 days',
        },
      },
      map: {
        controls: {
          findMyLocation: 'Find my location',
          label: 'Map',
          locationNotAvailable: 'Location is not available',
          toggleAttribution: 'Map sources',
          zoomIn: 'Zoom in',
          zoomOut: 'Zoom out',
        },
        filters: 'Filters',
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
      common: {
        retry: 'Повторить',
      },
      observation: {
        close: 'Закрыть сведения о встрече',
        date: 'Дата',
        error: 'Не удалось загрузить сведения о встрече.',
        label: 'Сведения о встрече',
        labelWithAnimal: 'Сведения о встрече: {{animal}}',
        loading: 'Загружаем сведения о встрече…',
        location: 'Местоположение',
        notFound: 'Встреча не найдена или больше недоступна.',
        note: 'Заметка',
        time: 'Время',
        voting: {
          confirm: 'Подтверждаю',
          error: 'Не удалось сохранить голос. Попробуйте ещё раз.',
          hint: 'Вы видели это животное здесь?',
          reject: 'Не подтверждаю',
        },
      },
      filters: {
        animals: 'Животные',
        close: 'Закрыть фильтры',
        label: 'Фильтры',
        removeAnimal: 'Убрать {{animal}}',
        period: 'Период',
        periods: {
          '1h': 'Последний час',
          '24h': '24 часа',
          '7d': '7 дней',
          '30d': '30 дней',
        },
      },
      map: {
        controls: {
          findMyLocation: 'Найти моё местоположение',
          label: 'Карта',
          locationNotAvailable: 'Местоположение недоступно',
          toggleAttribution: 'Источники карты',
          zoomIn: 'Приблизить',
          zoomOut: 'Отдалить',
        },
        filters: 'Фильтры',
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
