import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from './Badge'

const meta = {
  title: 'Shared/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: '3/5',
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {}

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
}

export const Success: Story = {
  args: {
    children: 'Опубликовано',
    variant: 'success',
  },
}

export const Danger: Story = {
  args: {
    children: 'Не подтверждено',
    variant: 'danger',
  },
}
