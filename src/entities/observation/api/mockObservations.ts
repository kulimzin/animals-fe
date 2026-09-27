import type { ObservationVote } from '../model/observation'

export type MockObservation = {
  id: string
  animalId: string
  coordinates: [longitude: number, latitude: number]
  ageMinutes: number
  locationLabel: string
  note: string | null
  votes: Record<ObservationVote, number>
  userVote: ObservationVote | null
}

export const mockObservations: MockObservation[] = [
  {
    id: 'observation-1',
    animalId: 'cat',
    coordinates: [37.6176, 55.7558],
    ageMinutes: 25,
    locationLabel: 'Манежная площадь, Москва',
    note: 'Рыжая кошка сидела у входа в Александровский сад.',
    votes: { confirm: 12, reject: 1 },
    userVote: null,
  },
  {
    id: 'observation-2',
    animalId: 'cat',
    coordinates: [37.601, 55.7298],
    ageMinutes: 180,
    locationLabel: 'Парк Горького, Москва',
    note: null,
    votes: { confirm: 7, reject: 0 },
    userVote: null,
  },
  {
    id: 'observation-3',
    animalId: 'dog',
    coordinates: [37.672, 55.794],
    ageMinutes: 1_100,
    locationLabel: 'Парк Сокольники, Москва',
    note: 'Собака с синим ошейником гуляла без хозяина.',
    votes: { confirm: 4, reject: 2 },
    userVote: null,
  },
  {
    id: 'observation-4',
    animalId: 'fox',
    coordinates: [37.633, 55.829],
    ageMinutes: 3_100,
    locationLabel: 'Останкинский парк, Москва',
    note: 'Лиса быстро ушла в сторону леса.',
    votes: { confirm: 9, reject: 1 },
    userVote: null,
  },
  {
    id: 'observation-5',
    animalId: 'hedgehog',
    coordinates: [37.554, 55.715],
    ageMinutes: 15_000,
    locationLabel: 'Воробьёвы горы, Москва',
    note: null,
    votes: { confirm: 3, reject: 0 },
    userVote: null,
  },
  {
    id: 'observation-6',
    animalId: 'dog',
    coordinates: [37.6205, 55.7572],
    ageMinutes: 210,
    locationLabel: 'Театральная площадь, Москва',
    note: 'Небольшая белая собака была рядом с фонтаном.',
    votes: { confirm: 6, reject: 1 },
    userVote: null,
  },
  {
    id: 'observation-7',
    animalId: 'fox',
    coordinates: [37.6147, 55.7539],
    ageMinutes: 1_600,
    locationLabel: 'Кремлёвская набережная, Москва',
    note: null,
    votes: { confirm: 2, reject: 3 },
    userVote: null,
  },
  {
    id: 'observation-8',
    animalId: 'squirrel',
    coordinates: [37.648, 55.768],
    ageMinutes: 22_000,
    locationLabel: 'Екатерининский парк, Москва',
    note: 'Белка брала орехи с ладони.',
    votes: { confirm: 15, reject: 0 },
    userVote: null,
  },
]
