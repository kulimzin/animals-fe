import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Meta, StoryObj } from '@storybook/react-vite'

import type { ObservationDetails } from '../../entities/observation'
import { VotingControl } from './VotingControl'

const observation: ObservationDetails = {
  id: 'observation-4',
  animalId: 'fox',
  location: {
    label: 'Останкинский парк, Москва',
    latitude: 55.829,
    longitude: 37.633,
  },
  note: 'Лиса быстро ушла в сторону леса.',
  observedAt: '2026-09-27T17:08:00.000Z',
  userVote: null,
  votes: { confirm: 9, reject: 1 },
  confirmationPercent: 90,
}

function VotingControlStory({
  width,
  ...args
}: {
  observation: ObservationDetails
  width: string
}) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { mutations: { retry: false } } }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width }}>
        <VotingControl {...args} />
      </div>
    </QueryClientProvider>
  )
}

const meta = {
  title: 'Features/VotingControl',
  component: VotingControl,
  parameters: {
    layout: 'centered',
  },
  args: {
    observation,
  },
  render: (args) => <VotingControlStory {...args} width="32rem" />,
} satisfies Meta<typeof VotingControl>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Narrow: Story = {
  render: (args) => <VotingControlStory {...args} width="20rem" />,
}
