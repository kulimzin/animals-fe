import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

type SupportedLanguage = 'en' | 'ru'

function getPreferredLanguage(deviceLanguages: readonly string[]): SupportedLanguage {
  return deviceLanguages.some((language) => language.toLowerCase().split(/[-_]/)[0] === 'ru')
    ? 'ru'
    : 'en'
}

const preferredLanguage = getPreferredLanguage(
  typeof navigator === 'undefined' ? [] : [...navigator.languages, navigator.language],
)

const resources = {
  en: {
    translation: {
      app: {
        title: 'Where is the animal',
      },
      common: {
        cancel: 'Cancel',
        done: 'Done',
        retry: 'Try again',
      },
      addObservation: {
        animal: 'Animal',
        animalLimitReached: 'Only one animal can be selected. Remove it to choose another.',
        animalsError: 'Could not load animals.',
        chooseAnimal: 'Choose an animal',
        close: 'Close encounter form',
        currentLocation: 'Current location',
        currentLocationError: 'Could not determine your current location.',
        date: 'Date',
        location: 'Location',
        locationCoordinates: '{{latitude}}, {{longitude}}',
        locationEmpty: 'Choose your current location or select a point on the map.',
        locationRequired: 'Choose a location.',
        note: 'Additional details',
        notePlaceholder: 'Anything else worth mentioning?',
        publish: 'Publish',
        required: 'Fill in this field.',
        submitError: 'Could not publish the encounter. Try again.',
        successClose: 'Close publication result',
        successMessage: 'The encounter is now visible to everyone on the map.',
        successTitle: 'Encounter published',
        selectOnMap: 'Select on map',
        selectedOnMap: 'Point on map',
        selectingLocation: 'Click the map to select the encounter location.',
        time: 'Time',
        title: 'Add an encounter',
        useCurrentLocation: 'Current location',
        view: 'View encounter',
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
        note: 'Additional details',
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
        addObservation: 'Add encounter',
        filtersRequired: 'Choose at least one animal to see encounters on the map.',
      },
      animalSelector: {
        limitReached:
          'The maximum of {{maximum}} animals is selected. Remove one to choose another.',
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
      app: {
        title: 'Где животное',
      },
      common: {
        cancel: 'Отмена',
        done: 'Готово',
        retry: 'Повторить',
      },
      addObservation: {
        animal: 'Животное',
        animalLimitReached:
          'Можно выбрать только одно животное. Уберите его, чтобы выбрать другое.',
        animalsError: 'Не удалось загрузить животных.',
        chooseAnimal: 'Выберите животное',
        close: 'Закрыть форму встречи',
        currentLocation: 'Текущее местоположение',
        currentLocationError: 'Не удалось определить текущее местоположение.',
        date: 'Дата',
        location: 'Местоположение',
        locationCoordinates: '{{latitude}}, {{longitude}}',
        locationEmpty: 'Укажите текущее местоположение или выберите точку на карте.',
        locationRequired: 'Выберите местоположение.',
        note: 'Дополнительно',
        notePlaceholder: 'Что ещё важно сообщить?',
        publish: 'Опубликовать',
        required: 'Заполните это поле.',
        submitError: 'Не удалось опубликовать встречу. Попробуйте ещё раз.',
        successClose: 'Закрыть результат публикации',
        successMessage: 'Теперь встреча видна всем пользователям на карте.',
        successTitle: 'Встреча опубликована',
        selectOnMap: 'Выбрать на карте',
        selectedOnMap: 'Точка на карте',
        selectingLocation: 'Нажмите на карту, чтобы выбрать место встречи.',
        time: 'Время',
        title: 'Добавить встречу',
        useCurrentLocation: 'Текущее местоположение',
        view: 'Посмотреть встречу',
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
        note: 'Дополнительно',
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
        addObservation: 'Добавить встречу',
        filtersRequired: 'Выберите хотя бы одно животное, чтобы увидеть встречи на карте.',
      },
      animalSelector: {
        limitReached: 'Выбрано максимум животных: {{maximum}}. Уберите одно, чтобы выбрать другое.',
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

void i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    lng: preferredLanguage,
    resources,
  })
  .then(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = preferredLanguage
      document.title = i18n.t('app.title')
    }
  })

export { getPreferredLanguage, i18n }
