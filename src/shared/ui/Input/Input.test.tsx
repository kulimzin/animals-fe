// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Input } from './Input'

afterEach(cleanup)

describe('Input', () => {
  it('announces a validation error', () => {
    render(<Input error="Укажите место встречи." label="Место встречи" />)

    const error = screen.getByText('Укажите место встречи.')
    const input = screen.getByLabelText('Место встречи')

    expect(error.getAttribute('aria-live')).toBe('polite')
    expect(input.getAttribute('aria-describedby')).toBe(error.id)
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })
})
