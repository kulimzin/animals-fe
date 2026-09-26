import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from '../Icon'
import { Chip } from './Chip'

const meta = {
  title: 'Shared/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Лисица',
  },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  args: {
    isSelected: true,
  },
}

export const WithLeadingIcon: Story = {
  args: {
    leadingIcon: <Icon name="mapPin" size={16} />,
  },
}

export const Removable: Story = {
  args: {
    isSelected: true,
    onRemove: () => undefined,
    removeLabel: 'Убрать лисицу из фильтра',
  },
}
