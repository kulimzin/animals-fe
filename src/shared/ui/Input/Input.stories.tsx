import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from '../Icon'
import { Input } from './Input'

const meta = {
  title: 'Shared/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Место встречи',
    placeholder: 'Введите адрес',
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = {
  args: {
    hint: 'Укажите ориентир, если точного адреса нет.',
  },
}

export const WithLeadingIcon: Story = {
  args: {
    leadingIcon: <Icon name="mapPin" />,
  },
}

export const WithTrailingElement: Story = {
  args: {
    trailingElement: <Icon name="close" />,
    defaultValue: 'Москва, парк Покровское-Стрешнево',
  },
}

export const Error: Story = {
  args: {
    error: 'Укажите место встречи.',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Москва, парк Покровское-Стрешнево',
  },
}

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 'Москва, парк Покровское-Стрешнево',
  },
}
