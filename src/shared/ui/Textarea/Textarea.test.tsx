// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Textarea } from './Textarea'

afterEach(cleanup)

describe('Textarea', () => {
  it('announces a validation error', () => {
    render(<Textarea error="Опишите, что произошло." label="Примечание" />)

    const error = screen.getByText('Опишите, что произошло.')
    const textarea = screen.getByLabelText('Примечание')

    expect(error.getAttribute('aria-live')).toBe('polite')
    expect(textarea.getAttribute('aria-describedby')).toBe(error.id)
    expect(textarea.getAttribute('aria-invalid')).toBe('true')
  })
})
