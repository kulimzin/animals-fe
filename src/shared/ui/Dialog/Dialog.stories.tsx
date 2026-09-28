import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '../Button'
import { Dialog, type DialogProps } from './Dialog'

function DialogStory(args: DialogProps) {
  const [isOpen, setIsOpen] = useState(args.isOpen)

  function handleClose() {
    setIsOpen(false)
    args.onClose()
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="secondary">
        Открыть окно
      </Button>
      <Dialog {...args} isOpen={isOpen} onClose={handleClose} />
    </>
  )
}

const meta = {
  title: 'Shared/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Содержимое диалога.',
    closeLabel: 'Закрыть окно',
    footer: <Button>Сохранить</Button>,
    isOpen: true,
    onClose: () => undefined,
    title: 'Заголовок диалога',
  },
  render: (args) => <DialogStory {...args} />,
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Narrow: Story = {
  args: {
    maxWidth: '27.5rem',
  },
}

export const WithMinimumHeight: Story = {
  args: {
    minHeight: '30rem',
  },
}

export const WithoutTitle: Story = {
  args: {
    ariaLabel: 'Настройки фильтров',
    title: undefined,
  },
}

export const LongContent: Story = {
  args: {
    children: (
      <>
        <p>Содержимое прокручивается внутри диалога.</p>
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index}>Пункт {index + 1}</p>
        ))}
      </>
    ),
    maxHeight: '20rem',
  },
}
