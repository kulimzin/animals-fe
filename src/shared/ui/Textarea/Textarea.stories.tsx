import type { Meta, StoryObj } from '@storybook/react-vite'

import { Textarea } from './Textarea'

const meta = {
  title: 'Shared/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Примечание',
    placeholder: 'Расскажите подробнее…',
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = {
  args: {
    hint: 'Необязательное поле.',
  },
}

export const Error: Story = {
  args: {
    error: 'Опишите, что произошло.',
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: 'Бежала вдоль тропинки в сторону леса.',
    disabled: true,
  },
}

export const ReadOnly: Story = {
  args: {
    defaultValue: 'Бежала вдоль тропинки в сторону леса.',
    readOnly: true,
  },
}
