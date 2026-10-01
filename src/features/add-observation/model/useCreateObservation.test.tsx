// @vitest-environment jsdom

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { observationsQueryKey, type CreateObservationInput } from '../../../entities/observation'
import { useCreateObservation } from './useCreateObservation'

const { createObservation } = vi.hoisted(() => ({
  createObservation: vi.fn(() => Promise.resolve({ id: 'observation-1' })),
}))

vi.mock('../../../entities/observation/api/createObservation', () => ({
  createObservation,
}))

const input: CreateObservationInput = {
  animalId: 'cat',
  location: { latitude: 55.75, longitude: 37.62, label: 'Точка на карте' },
  observedAt: '2026-10-01T09:00:00.000Z',
  note: null,
}

describe('useCreateObservation', () => {
  beforeEach(() => {
    createObservation.mockClear()
  })

  it('refetches active map observations after publishing', async () => {
    const getObservations = vi.fn(() => Promise.resolve({ items: [] }))
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(
      () => {
        useQuery({ queryKey: [...observationsQueryKey, 'map'], queryFn: getObservations })
        return useCreateObservation()
      },
      { wrapper },
    )

    await waitFor(() => expect(getObservations).toHaveBeenCalledTimes(1))

    result.current.mutate(input)

    await waitFor(() => expect(getObservations).toHaveBeenCalledTimes(2))
  })
})
