// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Dialog } from './Dialog'

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
  document.body.style.overflow = ''
})

function renderDialog(onClose = vi.fn()) {
  render(
    <Dialog closeLabel="Закрыть окно" isOpen onClose={onClose} title="Выберите животных">
      Содержимое диалога
    </Dialog>,
  )

  return onClose
}

describe('Dialog', () => {
  it('closes on Escape', () => {
    const onClose = renderDialog()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes when the backdrop is clicked', () => {
    const onClose = renderDialog()
    const backdrop = screen.getByRole('dialog').parentElement

    if (!backdrop) {
      throw new Error('Dialog backdrop is missing')
    }

    fireEvent.click(backdrop)

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not close when dialog content is clicked', () => {
    const onClose = renderDialog()

    fireEvent.click(screen.getByText('Содержимое диалога'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('applies custom dimensions', () => {
    render(
      <Dialog
        closeLabel="Закрыть окно"
        isOpen
        maxHeight="30rem"
        maxWidth="27.5rem"
        onClose={() => undefined}
        title="Выберите животных"
      >
        Содержимое диалога
      </Dialog>,
    )

    const dialog = screen.getByRole('dialog')

    expect(dialog.style.maxHeight).toBe('30rem')
    expect(dialog.style.maxWidth).toBe('27.5rem')
  })

  it('uses aria label when it has no title', () => {
    render(
      <Dialog
        ariaLabel="Настройки фильтров"
        closeLabel="Закрыть окно"
        isOpen
        onClose={() => undefined}
      >
        Содержимое диалога
      </Dialog>,
    )

    expect(screen.getByRole('dialog', { name: 'Настройки фильтров' })).toBeTruthy()
  })

  it('keeps focus inside the dialog', () => {
    render(
      <Dialog closeLabel="Закрыть окно" isOpen onClose={() => undefined} title="Выберите животных">
        <button type="button">Первое действие</button>
        <button type="button">Последнее действие</button>
      </Dialog>,
    )

    const dialog = screen.getByRole('dialog')
    const closeButton = screen.getByRole('button', { name: 'Закрыть окно' })
    const lastButton = screen.getByRole('button', { name: 'Последнее действие' })
    lastButton.focus()

    fireEvent.keyDown(dialog, { key: 'Tab' })

    expect(document.activeElement).toBe(closeButton)

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })

    expect(document.activeElement).toBe(lastButton)
  })

  it('restores focus and page scroll when it closes', () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()

    const onClose = vi.fn()
    const { rerender } = render(
      <Dialog closeLabel="Закрыть окно" isOpen onClose={onClose} title="Выберите животных">
        Содержимое диалога
      </Dialog>,
    )

    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <Dialog closeLabel="Закрыть окно" isOpen={false} onClose={onClose} title="Выберите животных">
        Содержимое диалога
      </Dialog>,
    )

    expect(document.activeElement).toBe(trigger)
    expect(document.body.style.overflow).toBe('')
  })
})
