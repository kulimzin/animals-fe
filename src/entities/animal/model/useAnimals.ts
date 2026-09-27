import { useQuery } from '@tanstack/react-query'
import { getAnimals } from '../api/getAnimals'

const animalQueryKey = ['animals'] as const

export function useAnimals() {
  return useQuery({
    queryKey: animalQueryKey,
    queryFn: getAnimals,
    select: (response) => response.items,
    staleTime: Number.POSITIVE_INFINITY,
  })
}
