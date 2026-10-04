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
  votes: z.object({
    confirm: z.number().int().nonnegative(),
    reject: z.number().int().nonnegative(),
  }),
  confirmationPercent: z.number().int().min(0).max(100).nullable(),
})

export const observationMapResponseSchema = z.object({
  items: z.array(observationMapItemSchema),
  truncated: z.boolean(),
  limit: z.literal(2_000),
})

export const observationVoteSchema = z.enum(['confirm', 'reject'])

export const observationDetailsSchema = observationMapItemSchema.extend({
  location: observationMapItemSchema.shape.location.extend({
    label: z.string().min(1).nullable(),
  }),
  note: z.string().nullable(),
  userVote: observationVoteSchema.nullable(),
})

export const observationDetailsResponseSchema = z.object({
  item: observationDetailsSchema.nullable(),
})

export const createObservationInputSchema = z.object({
  animalId: z.string().min(1),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    label: z.string().trim().min(1),
  }),
  observedAt: z.iso.datetime(),
  note: z.string().trim().nullable(),
})

export type ObservationPeriod = z.infer<typeof observationPeriodSchema>
export type ObservationMapItem = z.infer<typeof observationMapItemSchema>
export type ObservationDetails = z.infer<typeof observationDetailsSchema>
export type ObservationVote = z.infer<typeof observationVoteSchema>
export type CreateObservationInput = z.infer<typeof createObservationInputSchema>

export type ObservationMapQuery = {
  animalIds: string[]
  period: ObservationPeriod
  bounds: GeoBounds
}
