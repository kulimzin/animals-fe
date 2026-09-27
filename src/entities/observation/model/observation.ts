import { z } from 'zod'
import type { GeoBounds } from '../../../shared/lib/geo'

export const observationPeriodSchema = z.enum(['1h', '24h', '7d', '30d'])

export const observationMapItemSchema = z.object({
  id: z.string().min(1),
  animalId: z.string().min(1),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  observedAt: z.iso.datetime(),
})

export const observationMapResponseSchema = z.object({
  items: z.array(observationMapItemSchema),
})

export type ObservationPeriod = z.infer<typeof observationPeriodSchema>
export type ObservationMapItem = z.infer<typeof observationMapItemSchema>

export type ObservationMapQuery = {
  animalIds: string[]
  period: ObservationPeriod
  bounds: GeoBounds
}
