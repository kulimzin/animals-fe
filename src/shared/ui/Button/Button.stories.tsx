import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './Button'
import { Icon } from '../Icon'

const meta = {
  title: 'Shared/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Добавить встречу',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Danger: Story = {
  args: {
    children: 'Удалить встречу',
    variant: 'danger',
  },
}

export const WithLeadingIcon: Story = {
  args: {
    leadingIcon: <Icon name="plus" />,
  },
}

export const WithTrailingIcon: Story = {
  args: {
    children: 'Продолжить',
    trailingIcon: <Icon name="arrowRight" />,
  },
}

export const IconOnly: Story = {
  args: {
    'aria-label': 'Добавить встречу',
    children: undefined,
    isIconOnly: true,
    leadingIcon: <Icon name="plus" />,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}
