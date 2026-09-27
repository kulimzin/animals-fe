import { animalListResponseSchema } from '../model/animal'

const mockAnimals = [
  { id: 'cat', slug: 'cat', name: { ru: 'Кошка', en: 'Cat' }, icon: '🐈' },
  { id: 'dog', slug: 'dog', name: { ru: 'Собака', en: 'Dog' }, icon: '🐕' },
  { id: 'fox', slug: 'fox', name: { ru: 'Лиса', en: 'Fox' }, icon: '🦊' },
  { id: 'squirrel', slug: 'squirrel', name: { ru: 'Белка', en: 'Squirrel' }, icon: '🐿️' },
  { id: 'hedgehog', slug: 'hedgehog', name: { ru: 'Ёж', en: 'Hedgehog' }, icon: '🦔' },
]

export function getAnimals() {
  return Promise.resolve(animalListResponseSchema.parse({ items: mockAnimals }))
}
