import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { apiRequest } from './apiClient'

const publicConfigSchema = z.object({
  descriptionsEnabled: z.boolean(),
  noteMaxLength: z.number().int().positive(),
  mapResultLimit: z.number().int().positive(),
})

export const publicConfigQueryKey = ['public-config'] as const

export function getPublicConfig() {
  return apiRequest('/config', publicConfigSchema)
}

export function usePublicConfig() {
  return useQuery({
    queryKey: publicConfigQueryKey,
    queryFn: getPublicConfig,
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export type PublicConfig = z.infer<typeof publicConfigSchema>
